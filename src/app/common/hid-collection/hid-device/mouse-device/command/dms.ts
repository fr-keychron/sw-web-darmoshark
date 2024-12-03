import {Observable, firstValueFrom} from "rxjs";
import {EDmsMacroLoopKey} from "../enum";
import {filter, map, take} from "rxjs/operators";
import {ByteUtil} from "src/app/utils";
import {getMouseButtonInfo,} from "../util";
import {HidDeviceEventType} from "../../keyboard-device";
import {MouseDevice} from "../base";
import {VersionFactory} from ".";
import {IBaseInfo} from "../types";
import {Result} from "src/app/model";

VersionFactory.inject(
	(s) => s === "DMS",
	(device: MouseDevice) => new MouseDeviceDMS(device)
);

export class MouseDeviceDMS {
	private readonly mouse: MouseDevice;
	constructor(mouse: MouseDevice) {
		this.mouse = mouse;
		this.mouse.profileCount = 0;
		this.mouse.baseInfo = {
			workMode: 0 ,
			dpiConf: {
				reportRate: 3,
				levelCount: 5,
				dpiCurrentLevel: 1,
				delay: 0,
				sleep: 0,
				levelList: [400, 800, 1600, 3200, 4800],
				sys: {
					lod: 1,
					wave: 0,
					line: 0,
					motion: 1,
					scroll: 1,
					eSports: 1
				},
			},
			lightConf: {
				lightMode: 0,
				brightness: 255,
				speed: 4,
				rgbArr: [255,255,255],
				currentColor: 'rgb(255,255,255)',
			},
			mousebtnConf: [],
			power:  { state: 0, value: 100 }, 
			profile: 0,
			
		};
	}

	private setbuf63(buf: Uint8Array): void {
        let sum = 0;
        for (let i = 0; i < 63; i++) {
            sum += buf[i];
        }
        buf[63] = 0xA1 - (sum & 0xFF);
    }

	public setbuf0(buf: Uint8Array): void {
		if(this.mouse.baseInfo.workMode === 2) {
			buf[0] |= (this.mouse.baseInfo.workMode << 5);
		}
    }

	public open(): Observable<any> {
		return new Observable<any>((s) => {
			const init = async () => {
				try {
					await firstValueFrom(this.getBaseInfo());
					await firstValueFrom(this.getVersion());
					await firstValueFrom(this.getBaseInfoDpi());
					await firstValueFrom(this.getMouseBtnsInfo());
					await firstValueFrom(this.getLight());
				
					await firstValueFrom(this.mouse.loadJson()).catch((err) => {
						s.error({code: "noHid", msg: err});
					});
					this.mouse.loaded = true;
					this.mouse.event$.next({
						type: HidDeviceEventType.JsonConf,
						data: this,
					});
				s.next();
				}catch(error){
					console.error('Error in init:', error);
 
				}
			};
			if (this.mouse.opened) {
				if (this.mouse.loaded) {
					s.next();
				} else {
					init();
				}
			} else {
				this.mouse.hidRaw.open().then((r: any) => {
					this.mouse.opened = true;
					init();
				});
			}
			(e:any)=>{
				console.log(e);
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
						console.log(v);
						
						const bits = ByteUtil.oct2Bin(v[4])
						const workMode = Number(bits[4])
						const state = workMode;
						const vid = `0x${ByteUtil.oct2Hex(v[6], 2, "")}${ByteUtil.oct2Hex(
							v[5],
							2,
							""
						)}`; 
						// const pid = `0x${ByteUtil.oct2Hex(v[12], 2, "")}${ByteUtil.oct2Hex(
						// 	v[11],
						// 	2,
						// 	""
						// )}`;
						const pid = '0x073a'
						const vpId = MouseDevice.vendorProductId(
							ByteUtil.hex2Oct(vid),
							ByteUtil.hex2Oct(pid)
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
					console.log(v);
					
					this.mouse.baseInfo.workMode = 2;
					s.next(v);
					sub.unsubscribe();
				});
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe();
		});
	}

	public feature: number
	
	public getVersion(): Observable<{
		version: number|string;
		firmwareVersion: string;
		receiverVersion: string;
	}> {
		return new Observable<{ version: number|string; firmwareVersion: string; receiverVersion: string; }>((s) => {
			const formatVersion = (highByte: number, lowByte: number): string => {
				const versionValue = (highByte << 8) | lowByte
				const versionMajor = (versionValue >> 8) & 0xFF
				const versionPatch = versionValue & 0xFF
				return `${versionMajor}.${0}.${versionPatch}`
			};
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x00;
			buf[2] = 0x81;
			buf[3] = 0x00
			this.mouse.report$
				.pipe(
					filter((v) => v[0] === 0  && v[3] === 0),
					map((v) => {
						return {
							version:'dms', //协议版本
							firmwareVersion:formatVersion(v[9],v[8]),//固件版本
							receiverVersion:formatVersion(v[21],v[20]),//接收器版本
						};
					})
				)
				.subscribe({
					next: (v) => {
						this.mouse.protocolVersion = 'dms'
						this.mouse.firmware.mouse = v.firmwareVersion
						this.mouse.firmware.receiver = v.receiverVersion
						s.next(v);
					},
					error: () => {
						s.next({
							version: 1,
							firmwareVersion: '1.0.0',
							receiverVersion: '1.0.0'   
						})
					},
				});
			this.setbuf63(buf);
			this.mouse.write(0, buf).subscribe();
		});
	}
	public getBaseInfo(): Observable<{
		workMode: number;
		power: {
			state: number,
			value: number
		};
		profile: number
	}> {
		return new Observable<{ workMode: number; power: { state: number, value: number }; profile: number}>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x01
			buf[2] = 0x81
			buf[3] = 0x01
			this.mouse.report$
				.pipe(
					filter((v) => (v[0] === 0x01 || v[0] === 0x41) && v[3] === 0x01),
					map((v) => {
						const bits = ByteUtil.oct2Bin(v[4])
						const workMode = Number(bits[4])
						const power = {
							state: v[5],
							value: v[6]
						}
						return {
							workMode,
							power: power,
							profile:  v[7]
						};
					}),
					take(1)
				)
				.subscribe({
					next: (v) => {
						this.mouse.baseInfo.power = v.power
						this.mouse.baseInfo.profile = v.profile
						if(!this.mouse.baseInfo.workMode){
							this.mouse.baseInfo.workMode = v.workMode
						}
						s.next(v)
					},
					error: (e) => {
						s.next({
							workMode: 0,
							power: {
								state: 0,
								value: 0
							},
							profile: 0
						})
					},
				});
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe();
		});
	}

	public getBaseInfoDpi() {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x04
			buf[2] = 0x820|2
			buf[3] = 0x01
			const sub = this.mouse.report$
				.pipe(
					filter((v) => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x01),
					map((v) => {
						const dpiPosition= [
							[8, 9],
							[12, 13],
							[16, 17],
							[20, 21],
							[24, 25],
						];
						const dpiVal = dpiPosition.map((i) => (v[i[1]] << 8) | v[i[0]]);
						return {
							levelList: dpiVal,
							delay:v[54],
							reportRate: v[5],
							levelCount: v[6].toString(2).split('1').length - 1,
							dpiCurrentLevel: 0x00,
							sleep:  (v[53] << 8) | v[52] ,
							sys: {
								lod:  v[43],
								wave: (v[4] >> 4) & 0x01, 
								line: v[4] & 0x01, 
								motion: (v[4] >> 5) & 0x01,
								scroll: (v[4] >> 7) & 0x01,
								eSports: (v[4] >> 6) & 0x01
							},
						};
					})
				)
				.subscribe((v) => {
					this.mouse.baseInfo.dpiConf = v
					sub.unsubscribe();
					s.next(v);
				});
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		});
	}

	public setDpi(data: {
		current: number;
		level: number;
		values: number[];
	}): Observable<any> {
		return new Observable((s) => {
			const bytes = ByteUtil.numToHighLow(data.level, 2, 8, "LowToHigh");
			const newBytes = [...bytes, ...bytes]
			const buf = MouseDevice.Buffer(64)
			buf[0] = 4
			buf[2] = 0x80 | (3 + bytes.length)
			buf[3] = 6 
			buf[4] = data.current  
			newBytes.forEach((n: number, i: number) => (buf[i + 6] = n))
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x06))
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

	public setDpiLevel(current: number): Observable<any> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x04
			buf[2] = 0x82
			buf[3] = 0x08
			buf[4] = current
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x08))
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

	public setReportRate(data: {
		level: number;
		values: number[];
	}): Observable<any> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x04
			buf[2] = 0x84
			buf[3] = 0x04 
			buf[4] = data.level
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
			this.mouse.write(0, buf).subscribe(() => s.next())
		});
	}

	public getMouseBtnsInfo(): Observable<any> {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 3
			buf[2] = 0x80|1
			buf[3] = 1
			const sub = this.mouse.report$
			.pipe(
				filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 1),
				map((v) => {
					const result: any[] = []
					const length= 9
					for (let i = 0; i < length; i++) { 
						const index = 4 + i * 4
						if (index + 3 < v.length) {
							const bufferArr = [v[index], v[index+1], v[index+2], v[index+3]]
							const data = getMouseButtonInfo(bufferArr)
							result.push({
								mouseKey: i,
								data: data,
							});
						}
					}
					result.splice(5, 2)
					return result; 
				}),
				take(1)
			)
			.subscribe((v) => {
				this.mouse.baseInfo.mousebtnConf = v
				sub.unsubscribe()
				s.next(v)
			});
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		});
	}
	
	public setMouseBtnGame (
		mouseKey: number,
		buffer: number[] 
	): Observable<any> {
		return new Observable<any>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 3
			buf[2] = 0x80 | (3+buffer.length)
			buf[3] = 4
			buf[4] = mouseKey
			if (buffer && buffer.length) buffer.forEach((k, i) => (buf[i + 5] = k))
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 0x04))
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

	public setMouseBtn(
		mouseKey: number,
		buffer: number[] = []
	): Observable<any> {
		return new Observable<any>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 3
			buf[2] = 0x80 | (buffer.length +1)
			buf[3] = 4
			buf[4] = mouseKey
			buffer.forEach((n: number, i: number) => (buf[i + 5] = n & 0xff))
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 0x04))
				.subscribe(() => {
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
	public setMouseBtn2KeyBoard(
		mouseKey: number,
		shiftKey: number,
		keycodes: number[]
	): Observable<any> {
		return new Observable<any>((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x03
			buf[2] = 0x80|6
			buf[3] = 0x04
			buf[4] = mouseKey
			buf[5] = 0x00
			buf[6] = shiftKey & 0xff
			buf[7] = keycodes[0] & 0xff
			buf[8] = 0x00
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 0x04))
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
			this.setbuf63(buf)
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 0x04))
				.subscribe(() => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe();
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
				console.log(currentChunk.length);
	
				// 设置chunkBuf[1]为封包序号
				chunkBuf[1] = packetSequence;  // 赋值封包序号
				// 根据数据长度设置 chunkBuf[2]
				if (currentDataLength < 18) {
					chunkBuf[2] = 0x80 | (42 + currentDataLength);
				} else {
					chunkBuf[2] = remainingMacroData.length !== 0 ? 0xbc : 0x80 | (currentChunk.length + 2);
				}
	
				// 设置封包序号和校验和
				this.setbuf63(chunkBuf);
	
				// 输出调试信息并发送数据包
				console.log(chunkBuf);
				
				section.push(this.mouse.write(0, chunkBuf));
				chunks.push(chunkBuf);
	
				// 增加封包序号
				packetSequence++;
	
				// 如果当前包是最后一个包，剩余的数据就已处理完毕
				if (isLastChunk) {
					break;
				}
				const run = () => {
					const data = section.shift();
					data.subscribe();
					const subj = this.mouse.report$.subscribe(() => {
						if (section.length) {
							run();
						} else {
							this.saveData().subscribe(() => {
								s.next()
							})
						}
						subj.unsubscribe();
					});
				};
				run();
			}
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
			let configByte = 0x00;
			const bitMasks = [
				{ bitPosition: 0, value: data.line },
				{ bitPosition: 4, value: data.wave },
				{ bitPosition: 5, value: data.motion },
				{ bitPosition: 6, value: data.eSports },
				{ bitPosition: 7, value: data.scroll }
			];
			
			// 遍历并设置每个位
			bitMasks.forEach(mask => {
				configByte = mask.value ? (configByte | (1 << mask.bitPosition)) : (configByte & ~(1 << mask.bitPosition));
			});
			const buf = MouseDevice.Buffer(64);
			buf[0] = 4;
			buf[2] = 0x80 | 4
			buf[3] = 10
			buf[4] = configByte & 0xff
			buf[5] = data.lod
			const subj = this.mouse.report$
				.pipe(filter(v => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x0a))
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
	// 恢复出厂设置
	public recovery({value,options}: any)  {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x09
			buf[2] = options ? 0x82 : 0x81
			buf[3] = value
			buf[4] = options & 0xff
			const subj = this.mouse.report$
				.pipe(filter(v => (v[0] === 0x09 || v[0] === 0x49) && v[3] === value))
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

	public resetToDpi(array:number[]) {
		return new Observable((s) => {
			const section: Observable<Result>[] = [];
			array.forEach((e,index)=>{
				const data ={
					current: index,
					level: e,
					values: array
				}
				section.push(this.setDpi(data))
			})
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
	public getLight() {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x05
			buf[2] = 0x80|1
			buf[3] = 0x01
			const subj = this.mouse.report$
			.pipe(filter(v => (v[0] === 0x05 || v[0] === 0x45) && v[3] === 0x01))
			.subscribe((v: any) => {
				if (v) {
					const data = {
						lightMode: v[5],
						brightness: v[7],
						speed: v[9],
						rgbArr: [v[14], v[15], v[16]],
						currentColor: `rgb(${v[14]},${v[15]},${v[16]})`
					}
					this.mouse.baseInfo.lightConf = data
					s.next(data); 
				}
				subj.unsubscribe();
			});
			this.setbuf0(buf);
			this.setbuf63(buf);
			this.mouse.write(0, buf).subscribe();
		});
	}

	public setLight(data:{
		type: number
		brightness: number, 
		speed: number, 
		r: number, 
		g: number, 
		b: number, 
	}){
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x05
			buf[2] = 0x80 | 14
			buf[3] = 0x02
			buf[4] = 0x01
			buf[5] = data.type
			buf[6] = 0x07
			buf[7] = data.brightness & 0xff
			buf[8] = 0x01
			buf[9] = data.speed 
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
			.pipe(filter(v => (v[0] === 0x05 || v[0] === 0x45) && v[3] === 0x02))
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
 
	public setLevelCount(
		levelCount:number
	){
		return new Observable((s) => {
			let configByte = 0x00;
			const bitMasks = [
				{ bitPosition: 0, value: this.mouse.baseInfo.dpiConf.sys.line },
				{ bitPosition: 4, value: this.mouse.baseInfo.dpiConf.sys.wave },
				{ bitPosition: 5, value: this.mouse.baseInfo.dpiConf.sys.motion },
				{ bitPosition: 6, value: this.mouse.baseInfo.dpiConf.sys.eSports },
				{ bitPosition: 7, value: this.mouse.baseInfo.dpiConf.sys.scroll }
			];
			const levelCountMap = [1,3,7,15,31];
			// 遍历并设置每个位
			bitMasks.forEach(mask => {
				configByte = mask.value ? (configByte | (1 << mask.bitPosition)) : (configByte & ~(1 << mask.bitPosition));
			});
			
			let dpiList: number[] = []
			this.mouse.baseInfo.dpiConf.levelList.forEach((e)=>{
				const bytes = ByteUtil.numToHighLow(e, 2, 8, "LowToHigh"); 
				dpiList.push(...bytes, ...bytes);
			})
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x04;
			buf[2] = 0x80 | 53
			buf[3] = 0x02
			buf[4] = configByte & 0xff
			buf[5] = this.mouse.baseInfo.dpiConf.reportRate
			buf[6] = levelCountMap[levelCount-1] & 0xFF
			buf[7] = this.mouse.baseInfo.dpiConf.dpiCurrentLevel
			dpiList.forEach((n: number, i: number) => (buf[i + 8] = n));
			buf[43] = this.mouse.baseInfo.dpiConf.sys.lod
			buf[50] = (this.mouse.baseInfo.dpiConf.sleep) & 0xFF;
			buf[51] = ((this.mouse.baseInfo.dpiConf.sleep) >> 8) & 0xFF;
			buf[52] = (this.mouse.baseInfo.dpiConf.sleep) & 0xFF;
			buf[53] = ((this.mouse.baseInfo.dpiConf.sleep) >> 8) & 0xFF;
			buf[54] = (this.mouse.baseInfo.dpiConf.dpiCurrentLevel) & 0xFF;
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

	public switchConfig(index: number) {
		return new Observable((s) => {
			const buf = MouseDevice.Buffer(64);
			buf[0] = 2;
			buf[2] = 0x80 | 2
			buf[3] = 0x01
			buf[4] = index
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x02 || v[0] === 0x42) && v[3] === 1))
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

	public setMouseBtnAll(){
		return new Observable((s) => {
			const mousebtnConf = this.mouse.baseInfo.mousebtnConf
			const buf = MouseDevice.Buffer(64);
			buf[0] = 3
			buf[2] = 0x80 | 37
			buf[3] = 2
			mousebtnConf.forEach((e) => {
				const bytes = ByteUtil.numberToArray(e.data.value)
				bytes.forEach((n: number, i: number) => (buf[i + (4 * (e.mouseKey +1))] = n))
			})
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x03 || v[0] === 0x43) && v[3] === 2))
				.subscribe((v) => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		})
	}

	public setMouseDpiAll(){
		return new Observable((s) => {
			let configByte = 0x00;
			const bitMasks = [
				{ bitPosition: 0, value: this.mouse.baseInfo.dpiConf.sys.line },
				{ bitPosition: 4, value: this.mouse.baseInfo.dpiConf.sys.wave },
				{ bitPosition: 5, value: this.mouse.baseInfo.dpiConf.sys.motion },
				{ bitPosition: 6, value: this.mouse.baseInfo.dpiConf.sys.eSports },
				{ bitPosition: 7, value: this.mouse.baseInfo.dpiConf.sys.scroll }
			];
			const levelCountMap = [1,3,7,15,31]
			bitMasks.forEach(mask => {
				configByte = mask.value ? (configByte | (1 << mask.bitPosition)) : (configByte & ~(1 << mask.bitPosition))
			});
			
			let dpiList: number[] = []
			this.mouse.baseInfo.dpiConf.levelList.forEach((e)=>{
				const bytes = ByteUtil.numToHighLow(e, 2, 8, "LowToHigh")
				dpiList.push(...bytes, ...bytes);
			})
			const buf = MouseDevice.Buffer(64)
			buf[0] = 0x04;
			buf[2] = 0x80 | 53
			buf[3] = 0x02
			buf[4] = configByte & 0xff
			buf[5] = this.mouse.baseInfo.dpiConf.reportRate
			buf[6] = levelCountMap[ this.mouse.baseInfo.dpiConf.levelCount-1] & 0xFF
			buf[7] = this.mouse.baseInfo.dpiConf.dpiCurrentLevel
			dpiList.forEach((n: number, i: number) => (buf[i + 8] = n));
			buf[43] = this.mouse.baseInfo.dpiConf.sys.lod
			buf[50] = (this.mouse.baseInfo.dpiConf.sleep) & 0xFF;
			buf[51] = ((this.mouse.baseInfo.dpiConf.sleep) >> 8) & 0xFF;
			buf[52] = (this.mouse.baseInfo.dpiConf.sleep) & 0xFF;
			buf[53] = ((this.mouse.baseInfo.dpiConf.sleep) >> 8) & 0xFF;
			buf[54] = (this.mouse.baseInfo.dpiConf.dpiCurrentLevel) & 0xFF;
			const subj = this.mouse.report$
				.pipe(filter((v) => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 2))
				.subscribe((v) => {
					this.saveData().subscribe((r) => {
						subj.unsubscribe()
						s.next(r)
					})
				})
			this.setbuf0(buf)
			this.setbuf63(buf)
			this.mouse.write(0, buf).subscribe()
		})
	}

	public setLightAll(){
		return new Observable((s) => {
			const {lightMode, brightness, speed, rgbArr} = this.mouse.baseInfo.lightConf
			const buf = MouseDevice.Buffer(64);
			buf[0] = 0x05
			buf[2] = 0x80 | 14
			buf[3] = 0x02
			buf[4] = 0x01
			buf[5] = lightMode
			buf[6] = 0x07
			buf[7] = brightness & 0xff
			buf[8] = 0x01
			buf[9] = speed 
			buf[10] = 0x01
			buf[11] = rgbArr[0]
			buf[12] = rgbArr[1]
			buf[13] = rgbArr[2]
			buf[14] = rgbArr[0]
			buf[15] = rgbArr[1]
			buf[16] = rgbArr[2]
			buf[17] = rgbArr[0]
			buf[18] = rgbArr[1]
			buf[19] = rgbArr[2]
			const subj = this.mouse.report$
			.pipe(filter(v => (v[0] === 0x05 || v[0] === 0x45) && v[3] === 0x02))
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

	public setExtConfAll() {
		return new Observable((s) => {
			const {line, wave, motion, eSports, scroll, lod} = this.mouse.baseInfo.dpiConf.sys
			let configByte = 0x00;
			const bitMasks = [
				{ bitPosition: 0, value: line },
				{ bitPosition: 4, value: wave },
				{ bitPosition: 5, value: motion },
				{ bitPosition: 6, value: eSports },
				{ bitPosition: 7, value: scroll }
			];
			
			// 遍历并设置每个位
			bitMasks.forEach(mask => {
				configByte = mask.value ? (configByte | (1 << mask.bitPosition)) : (configByte & ~(1 << mask.bitPosition));
			});
			const buf = MouseDevice.Buffer(64);
			buf[0] = 4;
			buf[2] = 0x80 | 4
			buf[3] = 10
			buf[4] = configByte & 0xff
			buf[5] = lod
			const subj = this.mouse.report$
				.pipe(filter(v => (v[0] === 0x04 || v[0] === 0x44) && v[3] === 0x0a))
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
}
