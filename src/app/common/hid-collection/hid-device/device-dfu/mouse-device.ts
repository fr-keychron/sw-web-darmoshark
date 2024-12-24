import {TranslateService} from "@ngx-translate/core";
import {Observable, Subject, Subscription, fromEvent} from "rxjs";
import {Result} from "src/app/model";
import {filter, map, timeout} from "rxjs/operators";
import {ByteUtil} from "src/app/utils";

export enum EMouseDeviceEventType {
	update
}

export interface IMouseDeviceEvent {
	type: EMouseDeviceEventType
	data: any
}

export class MouseDeviceDFU {
	public id: number
	public name: any;
	public event$: Subject<IMouseDeviceEvent> = new Subject<IMouseDeviceEvent>()

	constructor(
		private hidRaw: any,
		private i18n: TranslateService,
	) {
		this.openFlag = hidRaw.opened;
		this.name = hidRaw.productName
		this.id = MouseDeviceDFU.vendorProductId(hidRaw.vendorId, hidRaw.productId)
	}

	public open() {
		return new Observable(s => {
			if (this.hidRaw.opened) {
				this.openFlag = true
				this.inputreport = fromEvent(this.hidRaw, "inputreport")
					.subscribe((event: any) => this.handleReport(event.data))
				s.next()
			} else {
				this.hidRaw.open()
					.then(() => {
						this.openFlag = true
						this.inputreport = fromEvent(this.hidRaw, "inputreport")
							.subscribe((event: any) => this.handleReport(event.data))
						s.next()
					}, (err: any) => {
						s.error(this.i18n.instant('notify.hidAlreadyConnected'))
					})
			}
		})
	}

	static Build(hid: any, i18n: TranslateService) {
		return new MouseDeviceDFU(hid, i18n)
	}

	public openFlag = false;

	static Buffer = (len = 64) => new Uint8Array(len)
	public report$: Subject<Uint8Array> = new Subject<Uint8Array>()

	static vendorProductId(vendorId: number, productId: number) {
		return vendorId * 65536 + productId;
	}

	// 连接设备
	public inputreport: Subscription

	public disconnect() {
		if( this.inputreport) this.inputreport.unsubscribe()
		this.hidRaw.close()
	}

	// 写入
	private write(reportId: number, buf: Uint8Array): Observable<Result> {
		return new Observable<Result>(s => {
			const result = Result.build();
			if (!this.openFlag) {
				return s.error(result.error(this.i18n.instant('notify.hidUnconnected')))
			}
			this.hidRaw.sendReport(reportId, buf)
				.then((r: any) => {
					s.next(result.succeed())
				})
				.catch((e: any) => {
					s.error(result.error(this.i18n.instant('notify.unknownErr')))
				})
		})
	}

	private handleReport(buf: DataView) {
		const uint8Arr = new Uint8Array(buf.buffer, 0, buf.byteLength);
		this.handleUpdate(uint8Arr)
		this.report$.next(uint8Arr)
	}

	private handleUpdate(buf: Uint8Array) {
		if (buf[0] === 0xe2) {
			const obj = {
				connect: buf[2],
			}
			this.event$.next({type: EMouseDeviceEventType.update, data: obj})
		}
	}
    private bluetoothWriteFile(file: File): Observable<any> {
		return new Observable(s => {
			const fr = new FileReader();
			fr.readAsArrayBuffer(file);
			fr.onload = async e => {
				try {
					const arrayBuffer = e.target.result as ArrayBuffer;
					const uint8 = new Uint8Array(arrayBuffer);
	
					// 提取 app_size 并计算
					const app_size = [uint8[12], uint8[13], uint8[14], uint8[15]];
					const decimal_value = (app_size[3] << 24) | (app_size[2] << 16) | (app_size[1] << 8) | app_size[0];
	
					// 提取剩余数据
					const remainingData = uint8.slice(74, 74 + decimal_value);
					// 分块
					const chunkSize = 59;
					const chunks: Uint8Array[] = [];
					for (let i = 0; i < remainingData.length; i += chunkSize) {
						chunks.push(remainingData.slice(i, i + chunkSize));
					}
					let k = 0;
					const total = chunks.length;
					const maxRetries = 5;
	
					const sendFirmware = (chunk: Uint8Array, index: number): Promise<void> => {
						return new Promise((resolve, reject) => {
							const buf = MouseDeviceDFU.Buffer(64);
							buf[0] = 0x9e;
							buf[1] = index & 0xFF;
							buf[2] = (index >> 8) & 0xFF;
							buf[3] = chunk.length | (index === total - 1 ? 0x80 : 0x00);
	
							for (let i = 0; i < chunk.length; i++) {
								buf[4 + i] = chunk[i];
							}
	
							// 等待设备响应
							const sub = this.report$
								.pipe(
                                    timeout(500),
                                )
								.subscribe({
									next: (v) => {
                                        if(v[0] === 0x9e){
                                            s.next({ status: 'writing', progress: ((k / total) * 100).toFixed(2) });
                                            sub.unsubscribe();
                                            resolve();
                                        }else{
                                            sub.unsubscribe();
                                            reject();
                                        }
									}
								});
							this.setbuf63(buf);
							this.write(0, buf).subscribe();
						});
					};
	
					const processChunks = async (): Promise<void> => {
						for (let index = 0; index < chunks.length; index++) {
							let retries = 0;
	
							while (retries < maxRetries) {
								try {
									await sendFirmware(chunks[index], index);
									k++; // 成功发送后递增
									break; // 继续处理下一个块
								} catch (err) {
									retries++;
									console.warn(`Retrying chunk ${index + 1}/${total}, attempt ${retries}`);
								}
							}
	
							if (retries === maxRetries) {
								throw new Error(`Failed to send chunk ${index + 1} after ${maxRetries} attempts`);
							}
						}
					};
	
					// 开始发送固件
					await processChunks();
	
					// 确认发送完成
					this.updateSuccess().subscribe({
                        next(data) {
                            s.next(data)
                        },
                    });
				} catch (err) {
					s.error(err);
				}
			};
		});
	}
	
	

	public sendUpdateRequest(file: File) {
		return new Observable((s) => {
			const hexStr = '0x0710'.replace(/^0x/, '').padStart(4, '0');
			const pidBuf = ByteUtil.hexSplit(hexStr)
			const buf = MouseDeviceDFU.Buffer(64);
			buf[0] = 0x1d;
			buf[2] = 0x80 | 11
			buf[3] = 0x01
			buf[4] = parseInt(pidBuf[1], 16)
			buf[5] = parseInt(pidBuf[0], 16)
			this.setbuf63(buf)
			const sub = this.report$
				.pipe(
					filter((v) => (v[0] === 0x1d) && v[3] === 0x01),
					map((v) => {
						const mac = [v[5], v[6], v[7], v[8], v[9]]
						return mac
					})
				).subscribe((v) => {
                    this.sendBinRequest(file, v).subscribe(
                        (res: any) => {
                            s.next(res)
                            sub.unsubscribe()
                        }
                    )
				})
			this.write(0, buf).subscribe()
		})
	} 
	public sendBinRequest(file: File, mac: number[]) {
		return new Observable((s) => {
			const fr = new FileReader();
			fr.readAsArrayBuffer(file);
			fr.onload = async (e) => {
				const arrayBuffer = e.target.result as ArrayBuffer;
				const uint8 = new Uint8Array(arrayBuffer);
				
				let buf =  MouseDeviceDFU.Buffer(64);
				buf[0] = 0x1d;
				buf[2] = 0x80 | 13
				buf[3] = 0x02
				buf[4] = mac[0] & 0xff
				buf[5] = mac[1] & 0xff
				buf[6] = mac[2] & 0xff
				buf[7] = mac[3] & 0xff
				buf[8] = mac[4] & 0xff
				buf[9] = uint8[66]
				buf[10] = uint8[67]
				buf[11] = uint8[68]
				buf[12] = uint8[69]
				buf[13] = uint8[70]
				buf[14] = uint8[71]
				buf[15] = uint8[72]
				this.setbuf63(buf)
				const sub = this.report$
				.pipe(
					filter((v) => (v[0] === 0x1d) && v[3] === 0x02)
				).subscribe((v) => {
					this.sendAppRequest(file).subscribe(
                        (res: any) => {
                            s.next(res)
                            sub.unsubscribe()
                        }
                    )
				})
				this.write(0, buf).subscribe()
			}
		})
	}

	public appRNG: number[] = []
	public sendAppRequest(file: File) {
		return new Observable((s) => {
			const fr = new FileReader();
			fr.readAsArrayBuffer(file);
			fr.onload = async (e) => {
				const arrayBuffer = e.target.result as ArrayBuffer;
				const uint8 = new Uint8Array(arrayBuffer);
				
				let buf =  MouseDeviceDFU.Buffer(64);
				buf[0] = 0x1d;
				buf[2] = 0x80 | 13
				buf[3] = 0x06
				buf[4] = uint8[8]
				buf[5] = uint8[9]
				buf[6] = uint8[10]
				buf[7] = uint8[11]
				buf[8] = uint8[12]
				buf[9] = uint8[13]
				buf[10] = uint8[14]
				buf[11] = uint8[15]
				buf[12] = uint8[16]
				buf[13] = uint8[17]
				buf[14] = uint8[18]
				buf[15] = uint8[19]
				this.setbuf63(buf)
				const sub = this.report$
				.pipe(
					filter((v) => (v[0] === 0x1d) && v[3] === 0x06)
				).subscribe((v) => {
					this.appRNG = [v[4], v[5], v[6], v[7], v[8]]
					this.bluetoothWriteFile(file).subscribe(
                        (res: any) => {
                            s.next(res)
                            sub.unsubscribe()
                        }
                    )
				})
				this.write(0, buf).subscribe()
			}
		})        
	} 
	public updateSuccess() {
		return new Observable((s) => {
			let CheckData = new Array(4);
			const appRNG = this.appRNG
			CheckData[0] = (appRNG[0] + appRNG[1]) ^ appRNG[4]
			CheckData[1] = (appRNG[1] + appRNG[2]) ^ appRNG[3]
			CheckData[2] = (appRNG[4] + appRNG[3]) ^ appRNG[1]
			CheckData[3] = (appRNG[3] + appRNG[4]) ^ appRNG[0]  
			for (let i = 0; i < CheckData.length; i++) {
				CheckData[i] &= 0xff;
			}
			let buf =  MouseDeviceDFU.Buffer(64);
			buf[0] = 0x1d;
			buf[2] = 0x80 | 8
			buf[3] = 0x07
			buf[5] = CheckData[0]
			buf[6] = CheckData[1]
			buf[7] = CheckData[2]
			buf[8] = CheckData[3]
			buf[9] = 0x05
			buf[10] = 0x02
			this.setbuf63(buf)
			const sub = this.report$
			.pipe(
                map((v) => {
                    return v
                })
			).subscribe((v) => {
				if(v[0] === 0x1d && v[3] === 0x07){
                    s.next({ status: 'done', data: null });
					sub.unsubscribe()
				}else{
                    s.next({status: 'error', data: null})
					sub.unsubscribe()
                }
			})
			
			this.write(0, buf).subscribe()
		})
	}
    private setbuf63(buf: Uint8Array): void {
        let sum = 0;
        for (let i = 0; i < 63; i++) {
            sum += buf[i];
        }
        buf[63] = 0xA1 - (sum & 0xFF);
    }
}
