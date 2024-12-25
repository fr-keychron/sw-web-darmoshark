import {Observable, firstValueFrom} from "rxjs";
import {EDmsMacroLoopKey, EMouseBtn, productFirmware} from "../enum";
import {EDeviceConnectState} from "../../../enum";
import {filter, map, switchMap, take, tap, timeout} from "rxjs/operators";
import {ByteUtil} from "src/app/utils";
import {getMouseButtonInfo,} from "../util";
import {HidDeviceEventType} from "../../keyboard-device";
import {MouseDevice} from "../base";
import {VersionFactory} from ".";
import {IBaseInfo, IDpiReport} from "../types";
import {Result} from "src/app/model";
import {SerialTransceiver} from "../../../transceiver";
import { EEventEnum } from "../../../type";
VersionFactory.inject(
	(s) => s === "dms",
	(device: MouseDevice) => new MouseDeviceV4(device)
);

export class MouseDeviceV4 {
	private readonly mouse: MouseDevice;
	constructor(mouse: MouseDevice) {
		this.mouse = mouse;
		this.mouse.profileCount = 0;
	}

	private setbuf63(buf: Uint8Array): void {
        let sum = 0;
        for (let i = 0; i < 63; i++) {
            sum += buf[i];
        }
        buf[63] = 0xA1 - (sum & 0xFF);
    }

	public setbuf0(buf: Uint8Array): void {
		if(this.mouse.workMode === 1) {
			buf[0] |= (this.mouse.workMode << 6);
		}
    }

	public open(): Observable<any> {
		return new Observable<any>((s) => {
			const init = async () => {			
				const { workMode, version } = this.mouse
				if (workMode === 1) {
					this.mouse.setTransceiver(new SerialTransceiver(this.mouse.hidRaw))
					const receiver = await firstValueFrom(this.getReceiverState());
					if (receiver?.state === 0) {
						return s.error({
							...receiver, 
							version: version, 
							workMode: workMode
						})
					}
					this.mouse.state = EDeviceConnectState.G;
					await firstValueFrom(this.getBaseInfo());
					await firstValueFrom(this.getReceiverVersion())
				} else {
					await firstValueFrom(this.getBaseInfo());
				}
				const protocol = await firstValueFrom(this.getPower());
				await firstValueFrom(this.getVersion());
				this.mouse.baseInfo.workMode = workMode
				this.mouse.baseInfo.profile = protocol.profile
				this.mouse.baseInfo.power = protocol.power
				this.mouse.baseInfo.reportRateMax = protocol.reportRateMax
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

	public getReceiverState(): Observable<{
		state: number;
		vid: string;
		pid: string;
		vpId: number;
	}> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x01
			buf[2] = 0x81
			buf[3] = 0x01
			const sub = this.mouse.report$
				.pipe(
					filter((v) => v[0] === 0x01 && v[3] === 0x01),
					map((v) => {
						const bits = ByteUtil.oct2Bin(v[4])
						const workMode = Number(bits[4])
						const state = workMode;
						const vid = `0x${ByteUtil.oct2Hex(v[6], 2, "")}${ByteUtil.oct2Hex(
							v[5],
							2,
							""
						)}`; 
						const pid = `0x${ByteUtil.oct2Hex(v[12], 2, "")}${ByteUtil.oct2Hex(
							v[11],
							2,
							""
						)}`;
						const newPid = productFirmware.find((item) => item.productID.toLowerCase() === pid.toLowerCase())?.PID
						const vpId = MouseDevice.vendorProductId(
							ByteUtil.hex2Oct(vid),
							ByteUtil.hex2Oct(newPid)
						);
						this.mouse.id = vpId
					
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
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe();
		});
	}

	public power: any
	public getPower(): Observable<{
		power: { state: number, value: number };
		workMode: number;
		profile: number;
		reportRateMax: number;
	}> {
		return new Observable<{ power: { state: number, value: number }; workMode: number; profile: number; reportRateMax: number;}>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x01
			buf[2] = 0x80 | 1
			buf[3] = 0x01
			const obj = this.mouse.report$
				.pipe(
					filter((v) => ( this.mouse.workMode === 1 ? v[0] === 0x41 : v[0] === 0x01 ) &&  v[3] === 0x01),
					map((v) => {
						const bits = ByteUtil.oct2Bin(v[4])
						const workMode = Number(bits[3])
						const power = {
							state: v[5],
							value: v[6]
						}
						this.power = power
						return {
							workMode,
							profile: v[7],
							power: power,
							reportRateMax: v[10],
						};
					})
				)
				.subscribe({
					next: (v) => {
						s.next(v);
						obj.unsubscribe()
					},
					error: () => {
						s.next({
							workMode: 0,
							profile: 0,
							power: {
								state: 0,
								value: 0
							},
							reportRateMax: 3
						})
					},
				});
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe();
		});
	}

	public getMouseBtnInfo(btn: number): Observable<any> {
		return new Observable(s => {
			const buf = MouseDevice.Buffer(64)
			buf[0] = 0x03
			buf[2] = 0x80|2
			buf[3] = 0x03
			buf[4] = btn & 0xFF
			const subj = this.mouse.report$
				.pipe(
					filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 3 && v[4] === btn),
					map(v => {
						const data = getMouseButtonInfo(Array.from(v.slice(5, 9)))
						const { EMouseBtn, ...filteredData } = data || {};
						return {
							type: data?.EMouseBtn,
							mouseKey: v[4],
							data: filteredData,
						}
					})
				)
				.subscribe(v => {
					s.next(v)
					subj.unsubscribe()
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		})
	}

	public getBaseInfo(): Observable<IBaseInfo> {
		return new Observable<IBaseInfo>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x04
			buf[2] = 0x80 | 1
			buf[3] = 0x01
			const sub = this.mouse.report$
				.pipe(
					filter((v) => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x01),
					map((v) => {
						
						const dpiPosition = Array.from({ length: 10 }, (_, i) => [i * 2 + 8, i * 2 + 9]);
						const dpiVal = dpiPosition.map((i) => {
							return (v[i[1]] << 8) | v[i[0]]
						  });
						return {
							dpiConf: {
								levelVal: dpiVal,
								levelEnable: v[6].toString(2).split('1').length - 1
							},
							sleep: (v[53] << 8) | v[52],
							delay: v[54],
							gears: v[6].toString(2).split('1').length - 1,
							sys: {
								lod:  v[43] ,
								wave: (v[4] >> 4) & 0x01, 
								line: v[4] & 0x01, 
								motion:  (v[4] >> 5) & 0x01,
								scroll: (v[4] >> 7) & 0x01,
								eSports: (v[4] >> 6) & 0x01,
							},
							usb: {
								dpi: v[7],
								reportRate: v[5] > 1 ? v[5] -1 : 0,
							},
							rf: {
								dpi: v[7],
								reportRate: v[5] > 1 ? v[5] -1 : 0,
							},
							bt: {
								dpi: v[7],
								reportRate: v[5] > 1 ? v[5] -1 : 0,
							},
							power: this.power,
							profile: this.mouse.baseInfo?.profile || 0,
							workMode: this.mouse.baseInfo?.workMode !== undefined ? this.mouse.baseInfo.workMode : null,
							reportRateMax: this.mouse.baseInfo?.reportRateMax || 3,
						};
					})
				)
				.subscribe({
					next: (v) => {
						this.mouse.baseInfo = v
						s.next(v)
						sub.unsubscribe()
					}
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			
			this.mouse.write(0, buf).subscribe()
		});
	}

	public getLight() {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x05
			buf[2] = 0x80|1
			buf[3] = 0x01
			const subj = this.mouse.report$
			.pipe(filter(v => v[0] === 0x1F ||(v[0] === 0x05 || v[0] === 0x45) && v[3] === 0x01))
			.subscribe((v: any) => {
				if (v[0] === 0x1F){
					s.next(false); 
				}
				if (v[0] === 0x05 || v[0] === 0x45) {
					const data = {
						lightMode: v[5],
						brightness: v[7],
						speed: v[9],
						rgbArr: [v[14], v[15], v[16]],
						currentColor: `rgb(${v[14]},${v[15]},${v[16]})`
					}
					s.next(data); 
				}
				subj.unsubscribe();
			});
			this.setbuf0(buf);
			this.setbuf63(buf);
			this.mouse.write(0, buf).subscribe();
		});
	}

	public getVersion(): Observable<{
		firmwareVersion: string;
	}> {
		return new Observable<{  firmwareVersion: string}>((s) => {
			const formatVersion = (highByte: number, lowByte: number): string => {
				const major = highByte;
				const minor = (lowByte & 0xF0) >> 4;
				const patch = lowByte & 0x0F;
				return `${major}.${minor}.${patch}`;
			};
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x00;
			buf[2] = 0x81;
			buf[3] = 0x00
			this.mouse.report$
				.pipe(
					filter((v) => (v[0] === 0 || v[0] === 0x40) && v[3] === 0),
					map((v) => {
						return {
							firmwareVersion:formatVersion(v[9],v[8]),//固件版本
						};
					})
				)
				.subscribe({
					next: (v) => {
						this.mouse.firmware.mouse = v.firmwareVersion
						s.next(v);
					},
					error: () => {
						s.next({
							firmwareVersion: '1.0.0'
						})
					},
				});
			this.setbuf0(buf);
			this.setbuf63(buf);
			this.mouse.write(0, buf).subscribe();
		});
	}
	public getReceiverVersion(): Observable<{
		receiverVersion: string;
	}> {
		return new Observable<{receiverVersion: string; }>((s) => {
			const formatVersion = (highByte: number, lowByte: number): string => {
				const major = highByte;
				const minor = (lowByte & 0xF0) >> 4;
				const patch = lowByte & 0x0F;
				return `${major}.${minor}.${patch}`;
			};
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0;
			buf[2] = 0x80 | 1;
			buf[3] = 0
			this.mouse.report$
				.pipe(
					filter((v) => v[0] === 0  && v[3] === 0),
					map((v) => {
						return {
							receiverVersion:formatVersion(v[9],v[8]),//接收器版本
						};
					})
				)
				.subscribe({
					next: (v) => {
						this.mouse.firmware.receiver = v.receiverVersion
						s.next(v);
					},
					error: () => {
						s.next({
							receiverVersion: '0.0.0'   
						})
					},
				});
			this.setbuf63(buf);
			this.mouse.write(0, buf).subscribe();
		});
	}
	public handleUpdate(bufs: Uint8Array) {
		return new Observable((s) => {
			const buf = bufs
			if (this.mouse.workMode === 1 && this.mouse.loaded && buf[0] === 0x01 && buf[2] === 0x8c && buf[3] === 0x01) {
				if(!((buf[4] >> 3) & 0x01)) {
					this.mouse.update$.next({
						type: EEventEnum.DISCONNECT,
						data: this
					});
					s.next(true);
				}                                                          
			} else {
				s.next(false);
			}
		});
	}
	public setMouseBtn(
		action: EMouseBtn,
		mouseKey: number,
		buffer: number[] = []
	): Observable<any> {
		return new Observable<any>((s) => {
			if(action === 0) {
				this.recovery({tagVal: 2, value: mouseKey}).subscribe(() => {s.next()});
				return
			}
			const buf = MouseDevice.Buffer(64)
			buf[0] = 0x03
			buf[2] = 0x80 | (buffer.length +1)
			buf[3] = 0x04
			buf[4] = mouseKey
			buffer.forEach((n: number, i: number) => (buf[i + 5] = n & 0xff))
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 0x04))
				.subscribe((v) => {
					this.saveData().subscribe((r) => {
						s.next(r)
						subj.unsubscribe()
					})
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		});
	}

	public setMacro(data: {
		mouseKey: number;
		loopType: EDmsMacroLoopKey;
		loopCount?: number;
		macro: Array<number[]>;
		delay: number;
	}): Observable<any> {
		return new Observable((s) => {
			const section: Observable<Result>[] = [];
			let isFirstChunk = true;  // 用来判断是否是第一个封包
			let offset = 45; // 从这里开始添加宏数据
			const maxBufSize = 63;
			let remainingMacroData = data.macro.flat();  // 将二维数组展平为一维
			const currentDataLength = remainingMacroData.length;
			let chunks = [];
			let packetSequence = 0; 
			// 拆分宏数据到多个包
			while (remainingMacroData.length > 0) {
				let chunkBuf = MouseDevice.Buffer(64);
				
				// 如果是第一个封包，填充所有固定字段
				if (isFirstChunk) {
					chunkBuf[0] = 7;
					chunkBuf[3] = 2; // 设置宏
					chunkBuf[4] = 0; // 宏序号
					chunkBuf[5] = data.loopType;
					chunkBuf[6] = data.loopCount;
					chunkBuf[41] = data.delay & 0xFF;
					chunkBuf[42] = (data.delay >> 8) & 0xFF;
					chunkBuf[43] = (remainingMacroData.length / 4) & 0xFF;
					chunkBuf[44] = ((remainingMacroData.length / 4) >> 8) & 0xFF;
					isFirstChunk = false;  // 设置为非第一个封包
				} else {
					// 如果不是第一个封包，只需要填充宏数据
					chunkBuf[0] = 7;
					chunkBuf[3] = 2;
					chunkBuf[4] = 0;
					offset = 5;  // 后续的封包从第5个字节开始填充宏数据
				}
	
				// 判断是否是最后一包abc
				const isLastChunk = remainingMacroData.length <= (maxBufSize - offset);
	
				// 将当前宏数据部分添加到 chunkBuf 中
				let currentChunk = remainingMacroData.splice(0, maxBufSize - offset); // 剩余的宏数据
				currentChunk.forEach((num, index) => {
					chunkBuf[offset + index] = num;
				});
	
				// 设置chunkBuf[1]为封包序号
				chunkBuf[1] = packetSequence;  // 赋值封包序号
				// 根据数据长度设置 chunkBuf[2]
				if (currentDataLength < 18) {
					chunkBuf[2] = 0x80 | (42 + currentDataLength);
				} else {
					chunkBuf[2] = remainingMacroData.length !== 0 ? 0xbc : 0x80 | (currentChunk.length + 2);
				}
	
				// 设置封包序号和校验和
				this.setbuf0(chunkBuf);
				this.setbuf63(chunkBuf);
				
				section.push(this.mouse.write(0, chunkBuf));
				chunks.push(chunkBuf);
	
				// 增加封包序号
				packetSequence++;
	
				// 如果当前包是最后一个包，剩余的数据就已处理完毕
				if (isLastChunk) {
					break;
				}
				const run = () => {
					const dataArr = section.shift();
					dataArr.subscribe();
					const subj = this.mouse.report$.subscribe(() => {
						if (section.length) {
							run();
						} else {
							this.setMouseMacro(data.mouseKey).subscribe(() => s.next())
						}
						subj.unsubscribe();
					});
				};
				run();
			}
		});
	}
	public setMouseMacro (
		mouseKey: number,
	): Observable<any> {
		return new Observable<any>((s) => {
			const buf = MouseDevice.Buffer(64)
			buf[0] = 0x03
			buf[2] = 0x88
			buf[3] = 0x04
			buf[4] = mouseKey
			buf[5] = 0x09
			buf[6] = 0x01
			buf[7] = 0x00
			buf[8] = 0x00
			this.setbuf0(buf)
			this.setbuf63(buf)
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 0x04))
				.subscribe(() => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.mouse.write(0, buf).subscribe()
		});
	}
	public setDpi(data: {
		current: number;
		level: number;
		gears: number;
		values: number[][];
	}){
		return new Observable<any>((s) => {
			let configByte = 0x00;
			const bitMasks = [
				{ bitPosition: 0, value: this.mouse.baseInfo.sys.line },
				{ bitPosition: 4, value: this.mouse.baseInfo.sys.wave },
				{ bitPosition: 5, value: this.mouse.baseInfo.sys.motion },
				{ bitPosition: 6, value: this.mouse.baseInfo.sys.eSports },
				{ bitPosition: 7, value: this.mouse.baseInfo.sys.scroll }
			];
			const levelCountMap = [1,3,7,15,31];
			// 遍历并设置每个位
			bitMasks.forEach(mask => {
				configByte = mask.value ? (configByte | (1 << mask.bitPosition)) : (configByte & ~(1 << mask.bitPosition));
			});
			
			let dpiList: number[] = []
			data.values.forEach((e) => {
				const lowHigh1 = ByteUtil.numToHighLow(e[0], 2, 8, "LowToHigh");
				const lowHigh2 = ByteUtil.numToHighLow(e[1], 2, 8, "LowToHigh");
				dpiList.push(...lowHigh1, ...lowHigh2);
			});
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x04;
			buf[2] = 0x80 | 53
			buf[3] = 0x02
			buf[4] = configByte & 0xff
			buf[5] = this.mouse.baseInfo.usb.reportRate + 1
			buf[6] = levelCountMap[data.gears-1] & 0xFF
			buf[7] = data.current
			dpiList.forEach((n: number, i: number) => (buf[i + 8] = n));
			buf[43] = this.mouse.baseInfo.sys.lod
			buf[50] = (this.mouse.baseInfo.sleep) & 0xFF;
			buf[51] = ((this.mouse.baseInfo.sleep) >> 8) & 0xFF;
			buf[52] = (this.mouse.baseInfo.sleep) & 0xFF;
			buf[53] = ((this.mouse.baseInfo.sleep) >> 8) & 0xFF;
			buf[54] = (this.mouse.baseInfo.delay) & 0xFF;
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 2))
				.subscribe(() => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.setbuf0(buf);
			this.setbuf63(buf);
			this.mouse.write(0, buf).subscribe();
		})
	}

	public setReportRate(data: {
		level: number;
		values: number[];
	}): Observable<any> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x04
			buf[2] = 0x84
			buf[3] = 0x04 
			buf[4] = data.level > 0 ? data.level + 1 : 0
			this.setbuf0(buf)
			this.setbuf63(buf)
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x04))
				.subscribe(() => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.mouse.write(0, buf).subscribe()
		});
	}

	public setExtConf(data: {
		lod: number
		wave: number
		line: number
		motion: number
		scroll: number
		eSports: number
	}, stop: boolean) {
		return new Observable((s) => {
			data.wave = data.wave
			data.line = data.line
			data.motion = data.motion
			data.scroll = data.scroll
			data.eSports = data.eSports
			let configByte = 0x00;
			const bitMasks = [
				{ bitPosition: 0, value: data.line },
				{ bitPosition: 4, value: data.wave },
				{ bitPosition: 5, value: data.motion },
				{ bitPosition: 6, value: data.eSports },
				{ bitPosition: 7, value: data.scroll }
			];
			
			bitMasks.forEach(mask => {
				configByte = mask.value ? (configByte | (1 << mask.bitPosition)) : (configByte & ~(1 << mask.bitPosition));
			});
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x04;
			buf[2] = 0x80 | 4
			buf[3] = 0x0a
			buf[4] = configByte & 0xff
			buf[5] = data.lod
			this.setbuf0(buf)
			this.setbuf63(buf)
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x0a))
				.subscribe(() => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.mouse.write(0, buf).subscribe()
		});
	}
	
	public getProtocolVersion(): Observable<{
		version: number;
		workMode: number;
		profile: number;
	}> {
		return new Observable<{ version: number; workMode: number; profile: number;}>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x01
			buf[2] = 0x81
			buf[3] = 0x01
			const obj = this.mouse.report$
				.pipe(
					filter((v) => (v[0] === 0x01 || v[0] === 0x41) && v[3] === 0x01),
					map((v) => {
						const bits = ByteUtil.oct2Bin(v[4])
						const workMode = Number(bits[4])
						const power = {
							state: v[5],
							value: v[6]
						}
						this.power = power || this.power
						// this.mouse.protocolVersion = 
						this.mouse.baseInfo.power = power
						this.mouse.baseInfo.profile = v[7]
						return {
							workMode,
							version: null,
							profile: v[7],
						};
					})
				)
				.subscribe({
					next: (v) => {
						obj.unsubscribe()
						s.next(v);
					},
					error: () => {
						s.next({
							version: 1,
							workMode: 0,
							profile: 0
						})
					},
				});
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe();
		});
	}
	public setDebounce(v: number) {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 4;
			buf[2] = 0x80 | 6
			buf[3] = 0x0E
			buf[4] = 60 & 0xFF
			buf[5] = 60 & 0xFF
			buf[6] = 60 & 0xFF
			buf[7] = 60 & 0xFF
			buf[8] = v & 0xFF
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		});
	}
	public recovery(opt: {profile?:number, tagVal?: any, value?:number}) {
		return new Observable<any>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x09
			buf[2] = (opt.value || opt.profile) ? 0x82 : 0x81
			buf[3] = opt.tagVal & 0xff
			buf[4] = (opt.value || opt.profile) & 0xff
			const subj = this.mouse.report$
				.pipe(
					filter(v => (v[0] === 0x09 || v[0] === 0x49) && v[3] === opt.tagVal && ((opt.value || opt.profile) ? v[4] === (opt.value || opt.profile) : v[4] === 0)), take(1))
				.subscribe((v) => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next()
					})
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		});
	}

	public resetToFactory() {
		return new Observable((s) => {
			this.recovery({value: 0xff}).subscribe(() => {
				const sub = this.mouse.getBaseInfo().subscribe(v => {
					this.mouse.event$.next({type: HidDeviceEventType.ProfileChange, data: null})
					sub.unsubscribe()
					s.next()
				})
			});
		});
	}
	public saveData () {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x0a;
			buf[2] = 0x80 | 1
			buf[3] = 0x01
			const subj = this.mouse.report$
				.pipe(filter(v => v[0] === 0x0a || v[0] === 0x4a))
				.subscribe((v) => {
					subj.unsubscribe()
					s.next()
				});
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		});
	}
	public setLight(data:{
		i: number
		l: number, 
		s: number, 
		r: number, 
		g: number, 
		b: number, 
	}){ 
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x05
			buf[2] = 0x80 | 17
			buf[3] = 0x02
			buf[4] = 0x01
			buf[5] = data.i
			buf[6] = 0x07
			buf[7] = data.l & 0xff
			buf[8] = 0x01
			buf[9] = data.s 
			buf[10] = 0x01
			buf[11] = data.r
			buf[12] = data.g
			buf[13] = data.b
			buf[14] = data.r
			buf[15] = data.g
			buf[16] = data.b
			buf[17] = data.r
			buf[18] = data.g
			buf[19] = data.b
			const subj = this.mouse.report$
			.pipe(
				filter(v => (v[0] === 0x05 || v[0] === 0x45) && v[3] === 0x02))
				.subscribe((v) => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.setbuf0(buf);
			this.setbuf63(buf);
			this.mouse.write(0, buf).subscribe();
		})
	}

	public setBtnTime(data: {
		btnRespondTime: number
		sleepTime:number
	}) {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 4;
			buf[2] = 0x80 | 6
			buf[3] = 0x0E
			buf[4] = (data.sleepTime) & 0xFF
			buf[5] = ((data.sleepTime) >> 8) & 0xFF
			buf[6] = (data.sleepTime) & 0xFF
			buf[7] = ((data.sleepTime) >> 8) & 0xFF
			buf[8] = (data.btnRespondTime) & 0xFF
			const subj = this.mouse.report$
				.pipe(filter(v => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x0E))
				.subscribe(() => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		});
	}
	public switchProfile(index: number) {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 2;
			buf[2] = 0x80 | 2
			buf[3] = 0x01
			buf[4] = index
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x02 || v[0] === 0x42) && v[3] === 1))
				.subscribe((v) => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		});
	}
	

	public sendUpdateRequest() {
		return new Observable((s) => {
			const hexStr = this.mouse.pid.replace(/^0x/, '').padStart(4, '0');
			const pidBuf = ByteUtil.hexSplit(hexStr)
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x1d;
			buf[2] = 0x80 | 11
			buf[3] = 0x01
			buf[4] = parseInt(pidBuf[1], 16)
			buf[5] = parseInt(pidBuf[0], 16)
			this.setbuf63(buf)
			const sub = this.mouse.report$
				.pipe(
					filter((v) => (v[0] === 0x1d) && v[3] === 0x01),
					map((v) => {
						const mac = [v[5], v[6], v[7], v[8], v[9]]
						return mac
					})
				).subscribe((v) => {
					s.next(v)       
					sub.unsubscribe()
				})
			this.mouse.write(0, buf).subscribe()
		})
	} 
}
