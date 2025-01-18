import {Observable, firstValueFrom} from "rxjs";
import {EMacroLoopKey, EMouseBtn} from "../enum";
import {filter, map, timeout} from "rxjs/operators";
import {ByteUtil, StrUtil} from "src/app/utils";
import {deserializeMouseButton} from "../util";
import {HidDeviceEventType} from "../../keyboard-device";
import {MouseDevice} from "../base";
import {VersionFactory} from ".";
import {EDeviceConnectState} from "../../../enum";
import {IBaseInfo, Light} from "../types";
import {Result} from "src/app/model";
import { RecverTransceiver } from "../../../transceiver";

VersionFactory.inject(
	(s) => s === "M",
	(device: MouseDevice) => new MouseDeviceM(device)
);

// 51短包21 52标准包65 53超长包1001
export class MouseDeviceM {
	private readonly mouse: MouseDevice;

	constructor(mouse: MouseDevice) {
		this.mouse = mouse;
		this.mouse.profileCount = 0;
	}

	public open(): Observable<any> {
		return new Observable<any>((s) => {
			const init = async () => {			
				const { workMode, version } = this.mouse
				console.log(workMode, version);
				
				const protocol = await firstValueFrom(this.getProtocolVersion());
				console.log(protocol);
				
				if (workMode === 1) {
					this.mouse.setTransceiver(new RecverTransceiver(this.mouse.hidRaw))
					const receiver = await firstValueFrom(this.getReceiverState());
					if (receiver.state === 0) {
						return s.error({...receiver, workMode, version});
					}
					this.mouse.state = EDeviceConnectState.G;
					await firstValueFrom(this.getBaseInfo());
				} else {
					await firstValueFrom(this.getBaseInfo());
				}
				this.mouse.baseInfo.workMode = workMode;
				this.mouse.baseInfo.feature = protocol.feature;
				await firstValueFrom(this.getDeviceDesc());
				// await firstValueFrom(this.mouse.loadJson()).catch((err) => {
				// 	s.error({code: "noHid", msg: err});
				// });
				this.mouse.loaded = true;
				this.mouse.event$.next({
					type: HidDeviceEventType.JsonConf,
					data: this,
				});
				s.next();
			};
			if (this.mouse.hidRaw.opened) {
				if (this.mouse.loaded) {
					s.next();
				} else {
					init();
				}
			} else {
				this.mouse.hidRaw.open().then((r: any) => {
					init();
				});
			}
		});
	}

	public power: any
	public feature: number

	public getProtocolVersion(): Observable<{
		version: number;
		workMode: number;
		feature: number;
	}> {
		return new Observable<{ version: number; workMode: number; feature: number; }>((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x6;
			const obj = this.mouse.report$
				.pipe(
					filter((v) => v[1] === 0x6),
					// timeout(500),
					map((v) =>v.slice(1)),
					map((v) => {
						console.log(v);
						
						const bits = ByteUtil.oct2Bin(v[9]);
						const workMode = ByteUtil.bin2Oct(bits.substring(5, bits.length));
						const powerState = ByteUtil.oct2Bin(v[11], 8, 'tail');
						const power = {
							state: Number(powerState.charAt(0)),
							value: v[10]
						}
						// console.log(power);
						
						this.power = power || this.power

						const featureBit = ByteUtil.oct2Bin(v[13])
						const feature = ByteUtil.bin2Oct(featureBit.substring(7, featureBit.length));
						return {
							version: (v[2] << 8) | v[1],
							workMode,
							feature:feature === 0 ? 1 : 0
						};
					})
				)
				.subscribe({
					next: (v) => {
						this.mouse.protocolVersion = v.version;
						obj.unsubscribe()
						s.next(v);
					},
					error: () => {
						s.next({
							version: 1,
							workMode: 0,
							feature: 0
						})
					},
				});
				console.log(buf);
				
			this.mouse.write(0x51, buf, 2).subscribe();
		});
	}

	public getReceiverState(): Observable<{
		state: number;
		vid: string;
		pid: string;
		vpId: number;
	}> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x3;
			const sub = this.mouse.report$
				.pipe(
					map((v) => v.slice(1)),
					filter((v) => v[0] === 0x3),
					map((v) => {
						const state = v[6];
						const vid = `0x${ByteUtil.oct2Hex(v[3], 2, "")}${ByteUtil.oct2Hex(
							v[2],
							2,
							""
						)}`;
						const pid = `0x${ByteUtil.oct2Hex(v[5], 2, "")}${ByteUtil.oct2Hex(
							v[4],
							2,
							""
						)}`;
						const vpId = MouseDevice.vendorProductId(
							ByteUtil.hex2Oct(vid),
							ByteUtil.hex2Oct(pid)
						);
						this.mouse.id = vpId;
						return {
							state,
							vid,
							pid,
							vpId,
						};
					})
				)
				.subscribe((v) => {
					s.next(v);
					sub.unsubscribe();
				});
			this.mouse.write(0x51, buf, 0).subscribe();
		});
	}

	public getDeviceDesc() {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x4;
			const sub = this.mouse.report$
				.pipe(
					map((v) => v.slice(1)),
					filter((v) => v[0] === 0x4),
					map((v) => {
						const r: number[] = [];
						v.forEach((i) => r.push(i));
						return r;
					}),
					map((v) => {
						const versionLen = v[1];
						const versionBytes = v.slice(2, versionLen + 2);
						const modelLen = v[21];
						const modelBytes = v.slice(22, modelLen + 22);

						const version2Len = v[41];
						const version2Bytes = v.slice(42, version2Len + 42);

						const workMode = this.mouse.baseInfo.workMode;
						let receiver = "",
							mouse = "";
						if (workMode === 0) {
							mouse = ByteUtil.byteToAscii(versionBytes);
						} else {
							mouse = ByteUtil.byteToAscii(version2Bytes);
							receiver = ByteUtil.byteToAscii(versionBytes);
						}
						return {
							receiverName: ByteUtil.byteToAscii(modelBytes),
							receiver,
							mouse,
							workMode,
						};
					})
				)
				.subscribe((v) => {
					this.mouse.firmware = v;
					sub.unsubscribe();
					s.next(v);
				});
			this.mouse.write(0x51, buf, 2).subscribe();
		});
	}

	public getBaseInfo(): Observable<IBaseInfo> {
		return new Observable<IBaseInfo>((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x7;
			const sub = this.mouse.report$
				.pipe(
					map((v) => v.slice(1)),
					filter((v) => v[0] === 0x7),
					map((v) => {
						const handleDpi = (n: number) => {
							const dpi = ByteUtil.oct2Bin(n);
							const bits = StrUtil.splitByLen(dpi, 4);
							return {
								dpi: ByteUtil.bin2Oct(bits[1]),
								reportRate: ByteUtil.bin2Oct(bits[0]),
							};
						};
						const handleSys = (val: number) => {
							const bits = ByteUtil.oct2Bin(val);
							return {
								lod: ByteUtil.bin2Oct(bits.substring(6, 8)),
								wave: Number(bits.charAt(5)),
								line: Number(bits.charAt(4)),
								motion: Number(bits.charAt(3)),
								scroll: Number(bits.charAt(1)),
							};
						};
						const dpiLevelCount = v[16];
						const dpiPosition: number[][] = [
							[6, 5],
							[8, 7],
							[10, 9],
							[12, 11],
							[14, 13],
							[21, 20],
							[23, 22],
							[25, 24],
						];
						const dpiVal = dpiPosition
							.slice(0, dpiLevelCount)
							.map((i) => (v[i[0]] << 8) | v[i[1]]);
						
						return {
							feature: this.mouse.baseInfo?.feature,
							workMode:
								this.mouse.baseInfo?.workMode !== undefined
									? this.mouse.baseInfo.workMode
									: null,
							profile: v[1],
							usb: handleDpi(v[2]),
							rf: handleDpi(v[3]),
							bt: handleDpi(v[4]),
							dpiConf: {
								levelEnable: dpiLevelCount - 1 || 4,
								levelVal: dpiVal,
							},
							gears: v[16],
							delay: v[17],
							sleep: v[18],
							sys: handleSys(v[15]),
							power: this.power
						};
					})
				)
				.subscribe((v) => {
					this.mouse.baseInfo = v;
					sub.unsubscribe();
					s.next(v);
				});

			this.mouse.write(0x51, buf, 2).subscribe();
		});
	}

	// 监控值
	public handleUpdate(bufs: Uint8Array) {
		return new Observable((s) => {
			const buf = bufs
			if (buf[0] === 0xe1) {
				const data = {
					mode: buf[1],
					s: buf[3],
					n: buf[4],
					rgb: [buf[5],buf[6],buf[7]],
					currentColor: `rgb(${buf[5]},${buf[6]},${buf[7]})`
				}
				this.mouse.update$.next({type: "light", data})
			}
			if (buf[0] === 0xe2) {
				// workMode: 0: usb, 1: 2.4g, 2: BT
				const obj = {
					workMode: buf[1],
					connect: buf[2],
					power: {
						state: buf[3],
						percent: buf[4],
					},
					dpi: {
						value: buf[5],
						report: buf[6],
						level: buf[7],
					},
				};
				this.mouse.baseInfo.power = {state: buf[3], value: buf[4]}
				this.power = {state: buf[3], value: buf[4]}
				
				this.mouse.update$.next({
					type: "base",
					data: obj,
				});
				s.next(true);
			} else {
				s.next(false);
			}
		});
	}

	public setDpi(data: {
		current: number;
		level: number;
		values: number[];
	}): Observable<any> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x40;
			buf[1] = data.current;
			buf[2] = data.current;
			buf[3] = data.current;
			const bytes = ByteUtil.numToHighLow(data.values);
			bytes.forEach((k: number, i: number) => (buf[i + 4] = k));
			buf[14] = 5; // 档位数

			const getBuf = MouseDevice.Buffer(20);
			getBuf[0] = 0x30;
			this.mouse.write(0x51, buf, 3).subscribe(() => s.next());
		});
	}

	public setReportRate(data: {
		level: number;
		values: number[];
	}): Observable<any> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x41;
			buf[1] = data.level;
			buf[2] = data.level;
			const bytes = ByteUtil.numToHighLow(data.values);
			bytes.forEach((n: number, i: number) => (buf[i + 3] = n));
			if (data.values.filter((i) => i < 125 || i > 8000).length)
				return s.error("out of range");

			const getBuf = MouseDevice.Buffer(20);
			getBuf[0] = 0x31;
			this.mouse.write(0x51, buf, 3).subscribe(() => s.next());
		});
	}

	public getMouseBtnInfo(btn: number): Observable<any> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x62;
			buf[1] = btn;
			const subj = this.mouse.report$
				.pipe(
					map((v) => v.slice(1)),
					filter((v) => v[0] === 0x62 && v[1] === btn),
					map((v) => {
						const type = v[3];
						console.log(deserializeMouseButton(type, v.slice(4)));
						
						return {
							type,
							mouseKey: v[1],
							data: deserializeMouseButton(type, v.slice(4)),
						};
					})
				)
				.subscribe((v) => {
					s.next(v);
					subj.unsubscribe();
				});
			this.mouse.write(0x52, buf, 2).subscribe();
		});
	}

	public setMouseBtn(
		action: EMouseBtn,
		mouseKey: number,
		buffer: number[] = []
	): Observable<any> {
		return new Observable<any>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x52;
			buf[1] = mouseKey;
			buf[3] = action;
			if (buffer && buffer.length) buffer.forEach((k, i) => (buf[i + 4] = k));
			this.mouse.write(0x52, buf, 3).subscribe(() => s.next());
		});
	}

	public setMacro(data: {
		mouseKey: number;
		loopType: EMacroLoopKey;
		loopCount?: number;
		macro: Array<number[]>;
		delay: number;
	}): Observable<any> {
		return new Observable((s) => {
			const maxlen = 64;
			const loop = (data.loopType << 13) | data.loopCount;
			const m = data.macro.flat();
			if (!m.length) return;

			const section: Observable<Result>[] = [];

			let i = 0;
			while (i < m.length) {
				let buf = [];
				const lastFlag = m.length <= i + maxlen - 12;
				const mLen = lastFlag
					? (m.length + 6) - (maxlen - 6) * section.length
					: maxlen - 6;
				buf[0] = 0x55;
				buf[1] = data.mouseKey;
				buf[2] = lastFlag ? 0 : 1;

				buf[3] = 0;
				buf[4] = 0;
				buf[5] = mLen;

				if (i === 0) {
					buf[6] = 0b1;
					buf[7] = loop & 0xff;
					buf[8] = loop >>> 8;
					buf[9] = data.delay & 0xff;
					buf[10] = data.delay >>> 8;
					buf[11] = m.length / 4;

					i += maxlen - 12;
					buf = buf.concat(m.slice(0, i));
				} else {
					buf[3] = (i + 6) & 0xff;
					buf[4] = (i + 6) >>> 8;
					buf = buf.concat(m.slice(i, i + maxlen - 6));
					i += maxlen - 6;
				}

				buf.length = maxlen;
				buf = buf.map((b) => b || 0);

				section.push(this.mouse.write(0x52, new Uint8Array(buf), i < m.length ? 1:3));
			}

			const run = () => {
				const data = section.shift();
				data.subscribe();
				const subj = this.mouse.report$.subscribe((r) => {
					if (section.length) {
						run();
					} else {
						s.next();
					}
					subj.unsubscribe();
				});
			};
			run();
		});
	}

	public setDebounce(v: number) {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x43;
			buf[1] = v;
			this.mouse.write(0x51, buf, 3).subscribe(() => {
				// setTimeout(() => {
				// 	const sub = this.mouse.getBaseInfo().subscribe(v => {
				// 		this.mouse.event$.next({type: HidDeviceEventType.ProfileChange, data: null})
				// 		sub.unsubscribe()
				// 		s.next()
				// 	})
				// }, 100)
				s.next()
			});
		});
	}

	public setExtConf(data: {
		lod: number;
		wave: number;
		line: number;
		motion: number;
		scroll: number;
	}, stop: boolean) {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x42;
			buf[1] = data.lod || 1;
			buf[2] = data.wave || 1;
			buf[3] = data.line || 2;
			buf[4] = data.motion || 1;
			buf[6] = data.scroll || 1;

			this.mouse.write(0x51, buf, 3).subscribe((r) => {
				s.next()
			});
		});
	}

	// 恢复出厂设置
	public recovery({tagVal}: any) {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0xb;
			buf[1] = 0x01
			buf[2] = tagVal
			this.mouse.write(0x51, buf, 3).subscribe((r) => {
				s.next(r);
			});
		});
	}

	public resetToFactory() {
		return new Observable((s) => {
			this.recovery({value: 0xff}).subscribe(() => {
				this.setDebounce(8).subscribe(() => {
					const sub = this.mouse.getBaseInfo().subscribe(v => {
						this.mouse.event$.next({type: HidDeviceEventType.ProfileChange, data: null})
						sub.unsubscribe()
						s.next()
					})
				});
			});
		});
	}

	/**
	 * light 灯效
	 * 0x12 灯效工作模式读取
	 * 0x13 灯效亮度读取
	 * 0x14/15/16 灯效R/G/B值读取
	 * 0x17 灯效速度
	 * 0x22 全模式灯效设置
	 * 0x24/25/26 R/G/B设置
	 */
	// 灯效
	public getLight() {
		return new Observable((s) => {
			const iLight = (index: number) => {
				const buf = MouseDevice.Buffer(20);
				buf[0] = 0x18;
				buf[1] = index;

				const subj = this.mouse.report$
					.pipe(filter(v => v[1] === 0x18))
					.subscribe((v: any) => {
						if (v) {
							// console.log(v);
							const r = v.slice(2)
							const data = {
								lightMode: (r[4] || r[5]) ? (r[0] + 1) : r[0],
								brightness: r[4],
								speed: r[5],
								rgbArr: [r[1], r[2], r[3]],
								currentColor: `rgb(${r[1]},${r[2]},${r[3]})`
							}
							s.next(data);
						}
						subj.unsubscribe();
					});
				this.mouse.write(0x51, buf, 2).subscribe();
			}

			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x12;
			const subj = this.mouse.report$
				.pipe(filter(v => v[1] === 0x12))
				.subscribe((v: any) => {
					if (v) {
						const r = v.slice(4)
						iLight(r[0])
					}
					subj.unsubscribe();
				});
			this.mouse.write(0x51, buf, 2).subscribe();
		});
	}

	public setLight(data: Light) {
		return new Observable((res) => {
			const {i, l, s, r, g, b, type} = data
			
			switch(type){
				case 1: // 灯效模式
					this.setLightM(i).subscribe((r) => {
						this.getLight().subscribe()
						res.next(r);
					})
					break;
				case 2: // 灯效亮度
					this.setLightL(l, i).subscribe((r) => {
						res.next(r);
					})
					break;
				case 3: // 灯效速度
					this.setLightS(s, i).subscribe((r) => {
						res.next(r);
					})
					break;
				default: // 灯效颜色
					this.setLightC([r,g,b], i).subscribe((r) => {
						res.next(r);
					})
					break;
			}
		});
	}

	public setLightM(i: number){
		return new Observable((res) => {
			const indexBuf = MouseDevice.Buffer(20);
			indexBuf[0] = 0x22
			indexBuf[1] = 0x01
			indexBuf[2] = i
			
			this.mouse.write(0x51, indexBuf, 3).subscribe((r) => {
				res.next(r);
			});
		})
	}
	public setLightL(val: number, i: number){
		return new Observable((res) => {
			const indexBuf = MouseDevice.Buffer(20);
			indexBuf[0] = 0x23
			indexBuf[1] = 0x01
			indexBuf[2] = i
			indexBuf[3] = val
			
			this.mouse.write(0x51, indexBuf, 3).subscribe((r) => {
				res.next(r);
			});
		})
	}
	public setLightS(val: number, i: number){
		return new Observable((res) => {
			const indexBuf = MouseDevice.Buffer(20);
			indexBuf[0] = 0x27
			indexBuf[1] = 0x01
			indexBuf[2] = i
			indexBuf[3] = val
			
			this.mouse.write(0x51, indexBuf, 3).subscribe((r) => {
				res.next(r);
			});
		})
	}
	public setLightC(val:number[], i: number){
		const [r,g,b] = val
		return new Observable((res) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x28
			buf[1] = 0x01
			buf[2] = i
			buf[3] = r
			buf[4] = g
			buf[5] = b
			this.mouse.write(0x51, buf, 3).subscribe((r) => {
				res.next(r);
			});
		})
	}
}
