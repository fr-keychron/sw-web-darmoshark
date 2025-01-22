import {Observable, firstValueFrom} from "rxjs";
import {
	EMacroLoopKey,
	EMouseBtn,
	EMouseCommand,
} from "../enum";
import {filter, map, timeout} from "rxjs/operators";
import {IBaseInfo, Light} from "../types";
import {ByteUtil, StrUtil} from "src/app/utils";
import {deserializeMacroByLong, deserializeMacroByShort, deserializeMouseButton} from "../util";
import {HidDeviceEventType} from "../../keyboard-device";
import {MouseDevice} from '../base'
import {VersionFactory} from '.'
import {SerialTransceiver} from "../../../transceiver";
import {EDeviceConnectState} from "../../../enum";
import { EEventEnum } from "../../../type";

VersionFactory.inject(s => s === 1, (device: MouseDevice) => new MouseDeviceV1(device))

export class MouseDeviceV1 {
	private readonly mouse: MouseDevice;

	constructor(mouse: MouseDevice) {
		this.mouse = mouse
	}

	open(): Observable<any> {
		return new Observable<any>(s => {
			const init = async () => {
				const { workMode, version } = this.mouse
				// const protocol = await firstValueFrom(this.getProtocolVersion())
				if (workMode === 1) {
					this.mouse.setTransceiver(new SerialTransceiver(this.mouse.hidRaw))
					const receiver = await firstValueFrom(this.getReceiverState());
					if (receiver.state === 0) {
						return s.error({...receiver, version, workMode})
					}
					this.mouse.state = EDeviceConnectState.G
					await firstValueFrom(this.getBaseInfo())
				} else {
					await firstValueFrom(this.getBaseInfo())
				}
				this.mouse.baseInfo.workMode = workMode
				await firstValueFrom(this.getDeviceDesc())
				// await firstValueFrom(this.mouse.loadJson()).catch(err => {
				// 	s.error({code: 'noHid', msg: err});
				// })
				this.mouse.loaded = true;
				this.mouse.event$.next({type: HidDeviceEventType.JsonConf, data: this});
				s.next()
			}
			if (this.mouse.opened) {
				if (this.mouse.loaded) {
					s.next()
				} else {
					init()
				}
			} else {
				this.mouse.hidRaw
					.open()
					.then((r: any) => {
						this.mouse.opened = true
						init()
					})
			}
		})
	}

	public getDeviceDesc() {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(63)
			buf[0] = EMouseCommand.CMD_BASE_GET_DEVICE_STRING
			const sub = this.mouse.report$
				.pipe(
					filter(v => v[0] === EMouseCommand.CMD_BASE_GET_DEVICE_STRING),
					map(v => {
						const r: number[] = []
						v.forEach(i => r.push(i))
						return r
					}),
					map(v => {
						const versionLen = v[1];
						const versionBytes = v.slice(2, versionLen + 2);
						const modelLen = v[21]
						const modelBytes = v.slice(22, modelLen + 22);

						const version2Len = v[41];
						const version2Bytes = v.slice(42, version2Len + 42);

						const workMode = this.mouse.baseInfo.workMode;
						let receiver = '', mouse = '';
						if (workMode === 0) {
							mouse = ByteUtil.byteToAscii(versionBytes)
						} else {
							mouse = ByteUtil.byteToAscii(version2Bytes)
							receiver = ByteUtil.byteToAscii(versionBytes)
						}
						return {
							receiverName: ByteUtil.byteToAscii(modelBytes),
							receiver,
							mouse,
							workMode
						}
					})
				)
				.subscribe(v => {
					this.mouse.firmware = v;
					sub.unsubscribe()
					s.next(v)
				})
			this.mouse.write(0xb3, buf).subscribe()
		})
	}

	public getReceiverState(): Observable<{
		state: number,
		vid: string,
		pid: string,
		vpId: number
	}> {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(20)
			buf[0] = EMouseCommand.CMD_BASE_GET_BOND_INFO
			const sub = this.mouse.report$.pipe(
				filter(v => v[0] === EMouseCommand.CMD_BASE_GET_BOND_INFO),
				map(v => {
					const state = v[6]
					const vid = `0x${ByteUtil.oct2Hex(v[3], 2, '')}${ByteUtil.oct2Hex(v[2], 2, '')}`
					const pid = `0x${ByteUtil.oct2Hex(v[5], 2, '')}${ByteUtil.oct2Hex(v[4], 2, '')}`
					const vpId = MouseDevice.vendorProductId(
						ByteUtil.hex2Oct(vid), ByteUtil.hex2Oct(pid)
					);
					this.mouse.id = vpId
					return {
						state,
						vid,
						pid,
						vpId: vpId
					}
				})
			).subscribe(v => {
				s.next(v)
				sub.unsubscribe()
			})
			this.mouse.write(0xb5, buf).subscribe()
		})
	}

	// public getProtocolVersion(): Observable<{ version: number, workMode: number }> {
	// 	return new Observable<{ version: number, workMode: number }>(s => {
	// 		const buf = MouseDevice.Buffer()
	// 		buf[0] = 0x02;
	// 		this.mouse.report$
	// 			.pipe(
	// 				filter(v => v[0] === 0x02),
	// 				timeout(500),
	// 				map(v => v.slice(1)),
	// 				map(v => {
	// 					const bits = ByteUtil.oct2Bin(v[8])
	// 					const workMode = ByteUtil.bin2Oct(bits.substring(4, bits.length))
	// 					return {
	// 						version: v[1] << 8 | v[0],
	// 						workMode
	// 					}
	// 				})
	// 			)
	// 			.subscribe(v => {
	// 				this.mouse.protocolVersion = v.version
	// 				s.next(v)
	// 			}, () => {
	// 				s.next({
	// 					version: 1,
	// 					workMode: 0
	// 				})
	// 			})
	// 		this.mouse.write(0xb5, buf).subscribe()
	// 	})
	// }

	public getBaseInfo(): Observable<IBaseInfo> {
		return new Observable<IBaseInfo>(s => {
			const buf = MouseDevice.Buffer(63)
			buf[0] = 0x05
			const sub = this.mouse.report$
				.pipe(
					filter(v => [0x05, 0x06].includes(v[0])),
					map(v => {
						const dpiLevelCount = v[16];
						if (v[0] === 0x05) {
							if (dpiLevelCount > 5) {
								buf[0] = 0x06
								this.mouse.write(0xb5, buf).subscribe()
							} else {
								return this.handleInfo(v)
							}
						} else {
							return this.handleInfo(v)
						}
					})
				)
				.subscribe(v => {
					if (v) {
						this.mouse.baseInfo = v;
						sub.unsubscribe()
						s.next(v)
					}
				})
			this.mouse.write(0xb5, buf).subscribe()
		})
	}

	private handleInfo(v: any): IBaseInfo {
		const handleDpi = (n: number) => {
			const dpi = ByteUtil.oct2Bin(n)
			const bits = StrUtil.splitByLen(dpi, 4);
			return {
				dpi: ByteUtil.bin2Oct(bits[1]),
				reportRate: ByteUtil.bin2Oct(bits[0])
			}
		}
		const handleSys = (val: number) => {
			const bits = ByteUtil.oct2Bin(val)
			return {
				lod: ByteUtil.bin2Oct(bits.substring(6, 8)),
				wave: Number(bits.charAt(5)),
				line: Number(bits.charAt(4)),
				motion: Number(bits.charAt(3)),
				scroll: Number(bits.charAt(1)),
				eSports: Number(bits.charAt(0))
			}
		}
		
		const dpiLevelCount = v[16];
		const dpiPosition: number[][] = [
			[6, 5], [8, 7], [10, 9], [12, 11],
			[14, 13], [21, 20], [23, 22], [25, 24]
		]
		const dpiVal = dpiPosition.slice(0, dpiLevelCount)
			.map(i => v[i[0]] << 8 | v[i[1]]) 
		const doubledDpiVal = dpiVal.flatMap(val => [val, val]);

		const powerState = ByteUtil.oct2Bin(v[19], 8);
		const power = {
			state: Number(powerState.charAt(0)),
			value: ByteUtil.bin2Oct(powerState.substring(1))
		}

		return {
			workMode: this.mouse.baseInfo?.workMode !== undefined ? this.mouse.baseInfo.workMode : null,
			profile: v[1],
			usb: handleDpi(v[2]),
			rf: handleDpi(v[3]),
			bt: handleDpi(v[4]),
			dpiConf: {
				levelEnable: dpiLevelCount - 1 || 4,
				levelVal: doubledDpiVal
			},
			gears: v[16],
			delay: v[17],
			sys: handleSys(v[15]),
			sleep: v[18] * 60,
			power
		}
	}

	public handleUpdate(buf: Uint8Array) {
		return new Observable(s => {
			if (buf[0] === 0xe2) {
				// workMode: 0: usb, 1: 2.4g, 2: BT
				// const obj = {
				// 	workMode: buf[1],
				// 	connect: buf[2],
				// 	power: {
				// 		state: buf[3],
				// 		percent: buf[4]
				// 	},
				// 	dpi: {
				// 		value: buf[5],
				// 		report: buf[6],
				// 		level: buf[7]
				// 	}
				// }

				// this.mouse.update$.next({
				// 	type: "base",
				// 	data: obj
				// })
				this.mouse.update$.next({
					type: EEventEnum.HIBERNATE,
					data: buf[2] === 2 ? true : false,
				});
				s.next(true)
			} else {
				s.next(false)
			}
		})
	}


	public switchProfile(v: number): Observable<any> {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = EMouseCommand.CMD_BASE_PROFILE_SWITCH;
			buf[1] = v;
			this.mouse.report$.pipe(
				filter(r => r[0] === 0xe4 && r[2] === 0x0e)
			).subscribe(v => {
				const sub = this.getBaseInfo().subscribe(v => {
					this.mouse.event$.next({type: HidDeviceEventType.ProfileChange, data: v})
					sub.unsubscribe()
					s.next()
				})
			})
			this.mouse.write(0xb5, buf).subscribe()
		})
	}

	public setDpi(data: {
		current: number,
		level: number,
		gears: number,
		values: number[],
	}): Observable<any> {
		return new Observable(s => {
			const dpiNum = this.mouse.baseInfo.dpiConf.levelEnable + 1
			const buf = MouseDevice.Buffer(20)
			buf[1] = data.current
			buf[2] = data.current
			buf[3] = data.current

			if (dpiNum > 5) { // todo 不知道什么情况会大于 5 档位
				buf[0] = 0x44
				buf[4] = dpiNum
				const bytes = ByteUtil.numToHighLow(data.values)
				bytes.forEach((k: number, i: number) => buf[i + 5] = k);
				this.mouse.write(0xb3, buf).subscribe(() => s.next())
			} else {
				buf[0] = EMouseCommand.CMD_MOUSE_SET_DPI
				const bytes = ByteUtil.numToHighLow(data.values)
				bytes.forEach((k: number, i: number) => buf[i + 4] = k);
				buf[14] = data.gears; // 档位数

				this.mouse.write(0xb5, buf).subscribe(() => s.next())
			}
		})
	}

	public setReportRate(data: {
		level: number,
		values: number[]
	}): Observable<any> {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(20)
			buf[0] = EMouseCommand.CMD_MOUSE_SET_REPORT_RATE;
			buf[1] = data.level
			buf[2] = data.level;
			const bytes = ByteUtil.numToHighLow(data.values);
			bytes.forEach((n: number, i: number) => buf[i + 3] = n)
			if (data.values.filter(i => i < 125 || i > 8000).length) return s.error('out of range')
			this.mouse.write(0xb5, buf).subscribe(() => s.next())
		})
	}

	public setMouseBtn(
		action: EMouseBtn, mouseKey: number, buffer: number[] = []
	): Observable<any> {
		return new Observable<any>(s => {
			const buf = MouseDevice.Buffer(20)
			buf[0] = EMouseCommand.CMD_MOUSE_BTN_SET_n_CONFIG_VALUE
			buf[1] = mouseKey;
			buf[3] = action;
			if (buffer && buffer.length)
				buffer.forEach((k, i) => buf[i + 4] = k)
			this.mouse.write(0xb3, buf).subscribe(() => s.next())
		})
	}

	private macroList = JSON.parse(localStorage.getItem('macroList'))
	public getMouseBtnInfo(btn: number): Observable<any> {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(63)
			buf[0] = EMouseCommand.CMD_MOUSE_BTN_GET_n_CONFIG;
			buf[1] = btn;
			const subj = this.mouse.report$
				.pipe(
					filter(v => v[0] === EMouseCommand.CMD_MOUSE_BTN_GET_n_CONFIG && v[1] === btn),
					map(async v => {
						const type = v[3];
						const data = deserializeMouseButton(type, v.slice(4))
						if(type === EMouseBtn.Macro){
							const macroData = await firstValueFrom(this.getMacroName(btn))
							const macro = this.macroList.find((e: any)=>{
								return e.id === macroData.macroId
							})
							if (macro) {
								data.name = macro.name
							}
							data.value = macroData.macroId
						}
						const { MouseBtn, ...filteredData } = data || {};
						return {
							type,
							mouseKey: v[1],
							data: filteredData
						}
					})
				)
				.subscribe(v => {
					s.next(v)
					subj.unsubscribe()
				})
			this.mouse.write(0xb3, buf).subscribe()
		})
	}

	public setMacro(data: {
		mouseKey: number,
		loopType: EMacroLoopKey,
		loopCount?: number,
		macro: Array<number[]>,
		delay: number
	}): Observable<any> {
		return new Observable(s => {
			const loop = data.loopType << 13 | data.loopCount;
			const m = data.macro.flat();
			let buf: number[] = []
			buf[0] = EMouseCommand.CMD_MOUSE_BTN_MACROS_SET_n_CPLT_DATA;
			buf[1] = data.mouseKey;
			buf[2] = 0

			buf[3] = (m.length + 6) & 0xff;
			buf[4] = (m.length + 6) >>> 8;

			buf[5] = 0b1
			buf[6] = loop & 0xff
			buf[7] = loop >>> 8
			buf[8] = data.delay & 0xff
			buf[9] = data.delay >>> 8

			buf[10] = data.macro.length;

			buf = buf.concat(m)

			if (buf.length <= 62) {
				const buffer = MouseDevice.Buffer(63);
				buf.forEach((v, i) => buffer[i] = v)
				const sub = this.mouse.report$.subscribe(v => {
					sub.unsubscribe()
					s.next()
				})
				this.mouse.write(0xb3, buffer).subscribe()
			} else {
				this.mouse.sendLongData(buf)
					.subscribe(() => {
						s.next()
					})
			}
		})
	}

	public getMacro(key: number): Observable<any> {
		return new Observable(s => {
			// IN
			const buuf = MouseDevice.Buffer(63)
			buuf[0] = EMouseCommand.CMD_MOUSE_BTN_MACROS_GET_n_CPLT_DATA
			buuf[1] = key
			// OUT
			const buffer: number[] = []
			const subj = this.mouse.report$.subscribe(v => {
				if (v[0] === 0x64) {
					v.slice(5, 5 + ByteUtil.byteToNum([v[4], v[3]])).forEach(k => buffer.push(k))
					subj.unsubscribe()
					s.next(deserializeMacroByShort(buffer))
				} else {
					const sn = ByteUtil.oct2Bin(v[1]);
					const end = sn.charAt(sn.length - 1);
					const len = v[2];

					v.slice(3, len + 3).forEach(k => buffer.push(k))
					if (end === '0') {
						subj.unsubscribe()
						s.next(deserializeMacroByLong(buffer))
					}
				}
			})
			this.mouse.write(0xb3, buuf).subscribe()
		})
	}

	public sendLongData(bytes: number[]): Observable<any> {
		return new Observable(s => {
			const byteLen = 59;
			let remain = bytes.length
			let count = 0;

			const bufArr: Uint8Array[] = []
			const generateBuf = (byte: number[], md: number, sn: number) => {
				const buf = MouseDevice.Buffer(63);
				buf[0] = 0x71;
				buf[1] = (sn << 2) | (0 << 1) | md;
				buf[2] = byte.length;
				byte.forEach((v, i) => buf[3 + i] = v)
				return buf
			}

			while (remain > 0) {
				const c = remain > byteLen ? byteLen : remain
				const byteSend = bytes.slice(count * byteLen, count * byteLen + c);
				const md = remain > byteLen ? 1 : 0
				bufArr.push(generateBuf(byteSend, md, count))
				count++;
				remain -= c;
			}
			const run = () => {
				const data = bufArr.shift()
				const subj = this.mouse.report$
					.pipe(
						filter(v => v[0] === 0x72)
					)
					.subscribe(() => {
						subj.unsubscribe()
						bufArr.length ? (run()) : (s.next());
					})
				this.mouse.write(0xb3, data).subscribe()
			}
			run()
		})
	}

	// 重置
	public recovery(opt:{profile?:number, tagVal?: any, value?:number}) {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(20)
			buf[0] = 0xF;
			buf[1] = opt.tagVal || 0
			if (opt.profile || opt.profile === 0){
				buf[1] = 0x1f
			}
			
			this.mouse.write(0xb5, buf).subscribe((r) => {
				s.next() 
			})
		})
	}

	// 回复出厂设置
	public resetToFactory(val: number) {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(20)
			buf[0] = 0xf
			buf[1] = val

			this.mouse.write(0xb5, buf).subscribe(() => {
				s.next()
			})
			// const inn: Observable<any>[] = []
			// inn.push(this.mouse.write(0xb5, buf)) // 恢复出厂设置
			// 临时
			// for (let i = 4; i>= 0; i--) {
			// 	const buf2 = MouseDevice.Buffer(20);
			// 	buf2[0] = EMouseCommand.CMD_BASE_PROFILE_SWITCH;
			// 	buf2[1] = i;
			// 	inn.push(this.mouse.write(0xb5, buf2)) // 切换profile
			// 	inn.push(this.mouse.setExtConf({
			// 		lod: 1,
			// 		wave: 1,
			// 		line: 2,
			// 		motion: 1,
			// 		scroll: 1
			// 	}, true)) // 设置系统功能
			// 	inn.push(this.mouse.setDpi({
			// 		current: 2,
			// 		level: 1600,
			// 		values: [400, 800, 1600, 3200, 5000]
			// 	})) // 设置dpi
			// 	inn.push(this.mouse.setReportRate({
			// 		level: 2,
			// 		values: [125, 500, 1000, 2000, 4000, 8000]
			// 	})) // 设置reportRate
			// }

			// inn.push(this.switchProfile(0)) // 设置回profile 0


			// const runInn = () => {
			// 	const ob = inn.shift()
			// 	ob.subscribe(() => {
			// 		if (inn.length) {
			// 			runInn()
			// 		} else {
			// 			s.next()
			// 		}
			// 	})
			// }
			// runInn()
		})
	}

	public setDebounce(v: number) {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(20)
			buf[0] = EMouseCommand.CMD_MOUSE_SET_BTN_DEBOUNCE_TIME;
			buf[1] = v;
			this.mouse.write(0xb5, buf).subscribe(() => {
				setTimeout(() => {
					const sub = this.mouse.getBaseInfo().subscribe(v => {
						this.mouse.event$.next({type: HidDeviceEventType.ProfileChange, data: null})
						sub.unsubscribe()
						s.next()
					})
				}, 100)
			})
		})
	}

	public setExtConf(data: {
		lod: number, wave: number, line: number, motion: number, scroll: number,
	}, stop?: boolean) {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(20)
			buf[0] = EMouseCommand.CMD_MOUSE_SET_SENSOR_LIFT_CUTOFF_VALUE
			buf[1] = data.lod || 1;
			buf[2] = data.wave || 1
			buf[3] = data.line || 2;
			buf[4] = data.motion || 1
			buf[6] = data.scroll || 1;

			this.mouse.write(0xb5, buf).subscribe(() => {
				if (!stop) {
					setTimeout(() => {
						const sub = this.mouse.getBaseInfo().subscribe(v => {
							this.mouse.event$.next({type: HidDeviceEventType.ProfileChange, data: null})
							sub.unsubscribe()
							s.next()
						})
					}, 100)
				} else {
					s.next()
				}
			})
		})
	}

	// 灯效
	public getLight() {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x23;
			const subj = this.mouse.report$
				.pipe(filter(v => v[0] === 0 || v[0] === 1 || v[0] === 2))
				.subscribe((v: any) => {
					if (v) {
						const data = {
							lightMode: v[0],
							brightness: v[1],
							speed: v[2],
							rgbArr: [v[3], v[4], v[5]],
							currentColor: `rgb(${v[3]},${v[4]},${v[5]})`
						}
						s.next(data);
					}
					subj.unsubscribe();
				});
			this.mouse.write(0xb5, buf).subscribe();
		});
	}

	public setLight(data: Light) {
		const {i, l, s, r, g, b} = data
		return new Observable((res) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x24
			buf[1] = i || 0
			buf[2] = l || 0
			buf[3] = s || 0
			buf[4] = r || 0
			buf[5] = g || 0
			buf[6] = b || 0

			this.mouse.write(0xb5, buf).subscribe((r) => {
				res.next(r);
			});
		});
	}

	public setBtnTime(data: {
		btnRespondTime: number
		sleepTime:number
	}) {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20)
			buf[0] = EMouseCommand.CMD_BASE_DEV_TIME;
			buf[1] = 0x1;
			buf[2] = data.sleepTime / 60;
			this.mouse.write(0xb5, buf).subscribe(() => {
				this.setDebounce(data.btnRespondTime).subscribe(() => {
					s.next();
				});
			})
		});
	}

	public setMacroName(
		mouseKey: number,
		macroId: string
	): Observable<any> {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(63);
			buf[0] = EMouseCommand.CMD_MOUSE_BTN_MACROS_SET_n_NAME;
			buf[1] = mouseKey;
			buf[2] = macroId.length;
			const macroNameBytes = new TextEncoder().encode(macroId);
			for (let i = 0; i < macroId.length; i++) {
				buf[3 + i] = macroNameBytes[i];
			}
			this.mouse.write(0xb3, buf).subscribe(()=>s.next())
		})
	}

	public getMacroName(
		mouseKey: number
	): Observable<any> {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(63);
			buf[0] = EMouseCommand.CMD_MOUSE_BTN_MACROS_GET_n_NAME;
			buf[1] = mouseKey;
			const subj = this.mouse.report$
				.pipe(
					filter((v) => (v[0] === 0x63)),
					map(v => {
						const data = v.slice(3, 17)
						const text = new TextDecoder().decode(new Uint8Array(data));
						return {
							macroId: text,
						};
					})
				)
				.subscribe(v => {
					s.next(v)
					subj.unsubscribe()
				})
			this.mouse.write(0xb3, buf).subscribe()
		})
	}
}

