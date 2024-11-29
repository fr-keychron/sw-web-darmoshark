import { TranslateService } from "@ngx-translate/core";
import { Observable, Subject, Subscription, fromEvent } from "rxjs";
import { EBluetooth, EBluetoothState, Result } from "src/app/model";
import { filter, map, timeout } from "rxjs/operators";
import { ByteUtil } from "src/app/utils";

export class BluetoothModule {

	public readonly id;
	public reportId = 0;

	constructor(
		private hidRaw: any,
		private i18n: TranslateService,
	) {
		this.openFlag = hidRaw.opened;
		this.id = BluetoothModule.vendorProductId(hidRaw.vendorId, hidRaw.productId)
		hidRaw.addEventListener('inputreport', (event: any) => this.handleReport(event.data))
	}

	static Build(hid: any, i18n: TranslateService) {
		return new BluetoothModule(hid, i18n)
	}

	static Buffer = (len = 32) => new Uint8Array(len)

	public openFlag = false;

	public report$: Subject<Uint8Array> = new Subject<Uint8Array>()

	static vendorProductId(vendorId: number, productId: number) {
		return vendorId * 65536 + productId;
	}

	public closeDevice() {
		this.hidRaw.close()
	}

	// 连接设备
	public inputreport: Subscription

	public connect(): Observable<any> {
		return new Observable<any>(s => {
			// @ts-ignore
			navigator.hid.requestDevice({
				filters: [{
					usage: 0x01,
					usagePage: 0x8c,
				}]
			}).then((r: any) => {
				if (!r.length || !r) return s.error(this.i18n.instant('notify.emptyHid'))
				const hid = r instanceof Array ? r[0] : r;
				this.hidRaw = hid
				const { productId, vendorId } = hid
				const id = BluetoothModule.vendorProductId(vendorId, productId)

				if (this.inputreport) {
					this.inputreport.unsubscribe()
				}
				const init = () => {
					this.inputreport = fromEvent(hid, "inputreport")
						.subscribe((event: any) => this.handleReport(event.data))
					this.openFlag = hid.opened
					s.next({ opened: hid.opened, id })
				}

				if (hid.opened) {
					init()
				} else {
					hid.open().then(() => {
						init()
					})
				}
			})
		})
	}

	public version = {
		firmware: '',
		hardware: '',
		moduleModel: ''
	}

	public getBluetoothDfuVersion() {
		return new Observable(s => {
			const buf = BluetoothModule.Buffer()
			buf[0] = EBluetooth.PacketType_Header;
			buf[1] = EBluetooth.PacketType_Send_NoAck;
			buf[2] = 0x03
			buf[3] = ByteUtil.byteNor(0x03);
			buf[4] = 0x01;
			buf[5] = 0x60;
			buf[6] = 0x60;
			let state: EBluetoothState = EBluetoothState.Init;
			const result: number | number[] = [];
			let remain = 0;
			const subj = this.report$
				.pipe(
					filter(v => v[0] === 0x03),
					map(v => v.slice(1)),
					filter(v => {
						const [b1, b2] = v;
						if (state === EBluetoothState.Init) return b1 === 0xAA && b2 === 0x57
						if (state === EBluetoothState.Pending) return true
					}),
					map(v => {
						return v
					})
				)
				.subscribe(v => {
					if (state === EBluetoothState.Init) {
						remain = v[2];
						const payload = v.slice(5);
						payload.forEach(k => result.push(k))
						remain -= payload.length
						state = EBluetoothState.Pending;
					} else {
						let d: Uint8Array;
						if (remain > v.length) {
							d = v;
							remain -= v.length;
						} else {
							d = v.slice(0, remain);
							remain = 0;
						}
						d.forEach(k => result.push(k))
						if (remain === 0) {
							const str: string[] = []
							const moduleModel = result.slice(4, 14).filter(i => i != 0)
							moduleModel.forEach(k => str.push(String.fromCharCode(k)))

							const fwStr: string[] = []
							const fwVersion = result.slice(16, 25).filter(i => i !== 0);
							fwVersion.forEach(k => fwStr.push(String.fromCharCode(k)))

							const hwStr: string[] = []
							const hwVersion = result.slice(26, 36).filter(i => i !== 0);
							hwVersion.forEach(k => hwStr.push(String.fromCharCode(k)))
							this.version.firmware = fwStr.join('')
							this.version.hardware = hwStr.join('')
							s.next({
								moduleModel: str.join(''),
								fwVersion: fwStr.join(''),
								hwVersion: hwStr.join('')
							})
							subj.unsubscribe()
						}
					}
				})
			this.write(this.reportId, buf).subscribe()
		})
	}

	/**
	 * 获取DFU版本信息
	 * @returns Observable
	 */
	public DFUVersion: number

	public getDFUVersion() {
		return new Observable(s => {
			const buf = BluetoothModule.Buffer()
			buf[0] = EBluetooth.PacketType_Header;
			buf[1] = EBluetooth.PacketType_Send_NoAck;
			buf[2] = 0x03
			buf[3] = ByteUtil.byteNor(0x03)
			buf[4] = 0x02
			buf[5] = 0x61
			buf[6] = 0x61
			const subj = this.report$.subscribe(v => {
				const payload = v.slice(9); // 参数字节
				this.DFUVersion = payload[1]
				s.next(v)
				subj.unsubscribe()
			})
			this.write(this.reportId, buf).subscribe()
		})
	}

	// 设置加密模式
	public bluetoothUpdate(file: File) {
		return new Observable(s => {
			const buf = BluetoothModule.Buffer()
			buf[0] = EBluetooth.PacketType_Header;
			buf[1] = EBluetooth.PacketType_Send_NoAck;
			buf[2] = 0x04
			buf[3] = ByteUtil.byteNor(0x04)
			buf[4] = 0x02
			buf[5] = 0x62
			buf[6] = 0
			buf[7] = 0x62
			const subj = this.report$.subscribe(r => {
				this.bluetoothStartUpdate(file)
					.subscribe(
						(r) => s.next(r),
						err => {
							s.error(err)
						}
					)
				subj.unsubscribe()
			})
			this.write(this.reportId, buf).subscribe()
		})
	}

	// 开启升级流程
	public bluetoothStartUpdate(file: File) {
		return new Observable(s => {
			const buf = BluetoothModule.Buffer()
			buf[0] = EBluetooth.PacketType_Header;
			buf[1] = EBluetooth.PacketType_Send_Ack;
			buf[2] = 0x04
			buf[3] = ByteUtil.byteNor(0x04)
			buf[4] = 0x03
			buf[5] = 0x63
			buf[6] = this.DFUVersion
			buf[7] = 0x63 + this.DFUVersion
			const subj = this.report$.subscribe(r => {
				subj.unsubscribe()
				this.bluetoothWriteFile(file).subscribe((r) => {
					s.next(r)
				}, err => {
					s.error(err)
				})
			})
			this.write(this.reportId, buf).subscribe()
		})
	}

	private bluetoothWriteFile(file: File): Observable<any> {
		return new Observable(s => {
			const fr = new FileReader()
			fr.readAsArrayBuffer(file)
			fr.onload = e => {
				const arrayBuffer = e.target.result as ArrayBuffer
				const uint8 = new Uint8Array(arrayBuffer);
				let remain = uint8.length;
				let i = 0;
				const bufArr: { payload: number[], buf: Uint8Array }[] = [];
				const sendFirmware = (firmwareData: Uint8Array, sn: number, index: number) => {
					const buf = BluetoothModule.Buffer()
					buf[0] = EBluetooth.PacketType_Header
					buf[1] = EBluetooth.PacketType_Send_Ack
					const payloadLen = firmwareData.length + 1 + 2 + 2
					const payload: number[] = []
					buf[2] = payloadLen
					buf[3] = ByteUtil.byteNor(payloadLen)
					buf[4] = sn
					buf[5] = 0x64
					buf[6] = 0
					buf[7] = sn
					firmwareData.forEach((k, j) => {
						buf[8 + j] = k
						payload.push(k)
					});

					const checkSum = 0x64 + sn + firmwareData.reduce((x, y) => x + y);
					const checkSum_low = checkSum & 0xFF
					const checkSum_high = checkSum >> 8;
					buf[8 + firmwareData.length] = checkSum_low;
					buf[8 + firmwareData.length + 1] = checkSum_high;
					return { payload, buf }
				}
				let sn = 0x01;
				while (remain > 0) {
					let payload: Uint8Array;
					if (remain >= 16) {
						payload = uint8.slice(16 * i, 16 * i + 16);
						remain -= 16;
						bufArr.push(sendFirmware(payload, sn, i))
					} else {
						payload = uint8.slice(16 * i, 16 * i + remain);
						remain -= uint8.length;
						bufArr.push(sendFirmware(payload, sn, i))
					}
					i++;
					sn++
					if (sn > 0xFF) sn = 0x00;
				}

				let k = 0;
				let total = bufArr.length;
				let time = 0
				const run = () => {
					const bufItem = bufArr.shift();
					const buf = bufItem.buf
					const sub = this.report$
						.pipe(timeout(1500))
						.subscribe({next: r => {
							// console.log(bufArr.length, total);
							if (bufArr.length) {
								run()
								s.next({ status: 'writing', data: Number(k / total * 100).toFixed(2) })
								k++
								time = 0
							} else {
								this.bluetoothVerify(uint8).subscribe((ver) => {
									s.next(ver)
								}, err => {
									s.error(err)
								})
							}
							sub.unsubscribe()
						}, error: (e: any) => {
							if (time < 5) {
								bufArr.unshift(bufItem)
								time++
								run()
							} else {
								s.error(this.i18n.instant('firmware.flashError'))
								return
							}
						}})
					this.write(this.reportId, buf).subscribe()
				}
				run()
			}
		})
	}

	private bluetoothVerify(d: Uint8Array) {
		return new Observable(s => {
			const a: number[] = []
			d.forEach(k => a.push(k))
			const result = ByteUtil.crc32(a)
			const crc = result >= 0xFFFFFFFF ? 0x00000000 : result;
			const hexStr = ByteUtil.oct2Hex(crc, 8, '');
			const hexArr = ByteUtil.hexSplit(hexStr, 2);
			const buf = BluetoothModule.Buffer()
			buf[0] = EBluetooth.PacketType_Header;
			buf[1] = EBluetooth.PacketType_Send_NoAck;
			buf[2] = 0x0b
			buf[3] = ByteUtil.byteNor(0x0b)
			buf[4] = 0x01
			buf[5] = 0x65

			buf[6] = parseInt(hexArr[3], 16)
			buf[7] = parseInt(hexArr[2], 16)
			buf[8] = parseInt(hexArr[1], 16)
			buf[9] = parseInt(hexArr[0], 16)

			buf[10] = parseInt(hexArr[3], 16)
			buf[11] = parseInt(hexArr[2], 16)
			buf[12] = parseInt(hexArr[1], 16)
			buf[13] = parseInt(hexArr[0], 16)
			let sumDec: any = buf[5] + buf[6] + buf[7] + buf[8] + buf[9] + buf[10] + buf[11] + buf[12] + buf[13];
			sumDec = sumDec.toString(16).toUpperCase();
			const splitTwo = (hexString: string) => {
				if (hexString.length <= 2) {
					hexString = "00" + hexString;
				}
				if (hexString.length % 2 !== 0) {
					hexString = "0" + hexString;
				}
				// 拆分成两个字节
				let byte1 = hexString.substring(0, 2);
				let byte2 = hexString.substring(2, 4);
				// 将字节转换为十进制数
				return [parseInt(byte1, 16), parseInt(byte2, 16)]
			}
			sumDec = splitTwo(sumDec)
			buf[14] = sumDec[1]
			buf[15] = sumDec[0]

			const subj = this.report$
				.pipe(timeout(500))
				.subscribe({
					next: r => {
						subj.unsubscribe()
						if(r[9] > 0){
							s.error('(CRC32)' + this.i18n.instant('firmware.flashError'))
							return
						}
						this.bluetoothSwitch().subscribe((r) => s.next(r))
						s.next({ status: 'verified', data: null })
					}, error: err => {
						s.error('(CRC32)' + this.i18n.instant('firmware.flashError'))
					}
				})
			this.write(this.reportId, buf).subscribe()
		})
	}

	// 切换firmware
	private bluetoothSwitch() {
		return new Observable(s => {
			const buf = BluetoothModule.Buffer()
			buf[0] = EBluetooth.PacketType_Header;
			buf[1] = EBluetooth.PacketType_Send_NoAck;
			buf[2] = 0x03
			buf[3] = ByteUtil.byteNor(0x03)
			buf[4] = 0x01
			buf[5] = 0x66
			buf[6] = 0x66
			this.write(this.reportId, buf).subscribe(() => {
				s.next({ status: 'done', data: null })
			})
		})
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
					// console.error(e);
					s.error(result.error(this.i18n.instant('notify.unknownErr')))
				})
		})
	}

	private handleReport(buf: DataView) {
		const uint8Arr = new Uint8Array(buf.buffer, 0, buf.byteLength);
		this.report$.next(uint8Arr)
	}
}
