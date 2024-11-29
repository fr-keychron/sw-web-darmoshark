import {BaseBootLoader, BootloaderFactory} from ".";
import {IBootLoader, IBootLoaderEvent, IBootLoaderEventType} from "./types";
import {Observable, Subject} from "rxjs";
import {ByteUtil} from "src/app/utils";
import JSZip from 'jszip';
import {KeyboardDevice} from "../index";

export class PCA extends BaseBootLoader {
	static Buffer = (len = 32) => new Uint8Array(len)

	constructor(port: any, k: KeyboardDevice) {
		super(port, k);
		this.init()
	}

	private async init() {
		await this.hid.open({baudRate: 115200});
	}

	public override event$: Subject<IBootLoaderEvent> = new Subject<IBootLoaderEvent>()

	/** custom⬇️ */

		// 读取文件
	public datBufs: Uint8Array
	public binBufs: Uint8Array
	public manifest: any

	public override flash(file: any) {
		return new Observable<any>(s => {
			JSZip.loadAsync(file).then(zip => {
				zip.forEach((relativePath, zipEntry) => {
					if (relativePath.indexOf('dat') > 0) {
						zipEntry.async('uint8array').then((content: Uint8Array) => {
							// bat文件
							this.datBufs = content
							// console.log('datBufs', this.datBufs);
						});
					} else if (relativePath.indexOf('bin') > 0) {
						zipEntry.async('uint8array').then(content => {
							// bin文件
							this.binBufs = content
							// console.log('binBufs', this.binBufs);
							s.next()
							this.startDfu()
						});
					} else {
						zipEntry.async('string').then((content) => {
							const json = JSON.parse(content)
							this.manifest = json.manifest
						})
					}
				});
			})
		}).subscribe()
	}

	// 开始发送
	// send_start_dfu
	private startDfu() {
		if (!this.manifest.application) {
			console.error('only support application!');
			return
		}
		const buf = PCA.Buffer(20)
		buf.set(this.int32ToBytes(3), 0)
		buf.set(this.int32ToBytes(4), 4)
		buf.set(this.int32ToBytes(0), 8)
		buf.set(this.int32ToBytes(0), 12)
		buf.set(this.int32ToBytes(this.binBufs.length), 16)
		this.HciPacket(buf).subscribe((r) => {
			this.sendInitPacket()
		})
	}

	// send_init_packet
	private sendInitPacket() {
		const buf = PCA.Buffer(this.datBufs.length + 6)
		buf.set(this.int32ToBytes(1), 0)
		buf.set(this.datBufs, 4)
		buf.set(this.int16ToBytes(0x0000), this.datBufs.length + 4)
		this.HciPacket(buf)
			.subscribe({
				next: (r) => {
					this.sendFirmware()
				}, error: err => {
					console.error(err);
				}
			})
	}

	// send_firmware: 开始发送文件
	private sendFirmware() {
		const maxSize = 512
		let frames: Observable<any>[] = []
		for (let i = 0; i < this.binBufs.length; i += maxSize) {
			if ((this.binBufs.length / maxSize) < frames.length + 1) {
				const buf = PCA.Buffer(this.binBufs.length % maxSize + 4)
				buf.set(this.int32ToBytes(4), 0)
				buf.set(this.binBufs.slice(i), 4)
				frames.push(this.HciPacket(buf))
			} else {
				const buf = PCA.Buffer(maxSize + 4)
				buf.set(this.int32ToBytes(4), 0)
				buf.set(this.binBufs.slice(i, i + maxSize), 4)
				frames.push(this.HciPacket(buf))
			}
		}
		const len = frames.length
		const send = (packet: any) => {
			packet.subscribe(() => {
				this.event$.next({
					type: IBootLoaderEventType.Flashing,
					data: ((len - frames.length) / len * 100).toFixed(2) + '%'
				})
				if (frames.length) {
					setTimeout(() => {
						send(frames.shift())
					}, 200)
				} else {
					this.validateFirmware()
				}
			})
		}
		send(frames.shift())
	}

	// send_validate_firmware
	private validateFirmware() {
		const buf = PCA.Buffer(4)
		buf.set(this.int32ToBytes(5), 0)
		this.HciPacket(buf).subscribe((r) => {
			this.activateFirmware()
		})
	}

	// send_activate_firmware
	private activateFirmware() {
		this.event$.next({type: IBootLoaderEventType.Complete, data: null})
		this.close()
	}

	// close
	public override close() {
		this.event$.unsubscribe()
	}

	public int32ToBytes(v: number) {
		const bytes = PCA.Buffer(4)
		bytes[0] = (v & 0x000000FF)
		bytes[1] = (v & 0x0000FF00) >> 8
		bytes[2] = (v & 0x00FF0000) >> 16
		bytes[3] = (v & 0xFF000000) >> 24
		return bytes
	}

	public int16ToBytes(v: number) {
		const bytes = PCA.Buffer(2)
		bytes[0] = (v & 0x00FF)
		bytes[1] = (v & 0xFF00) >> 8
		return bytes
	}

	private sequenceNumber = 0

	public HciPacket(data: Uint8Array) {
		this.sequenceNumber = (this.sequenceNumber + 1) % 8
		const tempData = PCA.Buffer(data.length + 7)
		const slipBytes = ByteUtil.slipPartsToFourBytes(this.sequenceNumber, 1, 1, 14, data.length) // len 4

		tempData.set(slipBytes, 0)
		tempData.set(data, slipBytes.length)

		const crc = ByteUtil.calcCrc16(tempData.slice(0, data.length + 4)); // len 2
		tempData[slipBytes.length + data.length] = (crc & 0xFF)
		tempData[slipBytes.length + data.length + 1] = (crc & 0xFF00) >> 8

		const len = data.length + slipBytes.length + 2
		const encoded = ByteUtil.slipEncodeEscChars(tempData, len) // len <=tempData.length*2

		const endData = PCA.Buffer(encoded.length + 1)
		endData.set(encoded, 0)
		endData[encoded.length] = 0xc0

		return this.write(0xc0, endData)
	}

	private writer: any;

	// 写入
	private write(reportId: number, buf: Uint8Array): Observable<any> {
		let payload = PCA.Buffer(buf.length + 1)
		payload[0] = reportId
		payload.set(buf, 1)
		return new Observable<any>((s) => {
			if (!this.writer) {
				this.writer = this.hid.writable!.getWriter() as WritableStreamDefaultWriter<Uint8Array>;
			}
			this.writer.write(payload).then((r: any) => {
				s.next(r)
			})
		})
	}

	public override validation(f: File): Observable<boolean> {
		return new Observable<boolean>(s => {
			const vid = ByteUtil.hexSplit(this.keyboardDevice.vid, 2)
			const pid = ByteUtil.hexSplit(this.keyboardDevice.pid, 2)
			JSZip.loadAsync(f).then(zip => {
				zip.forEach((relativePath, zipEntry) => {
					if (relativePath.indexOf('bin') > 0) {
						zipEntry.async('uint8array').then(content => {
							const asciiArray = [
								ByteUtil.hex2Oct(vid[1]),
								ByteUtil.hex2Oct(vid[0]),
								ByteUtil.hex2Oct(pid[1]),
								ByteUtil.hex2Oct(pid[0]),
							]
							const result = this.findInArrayBuffer(content, asciiArray)
							s.next(result)
						}).catch( () => {
							s.next(false)
						})
					}
				});
			})
		})
	}
}

BootloaderFactory.inject(
	(s: string) => s.includes('PCA'),
	(hid: any, keyboard: KeyboardDevice) => new PCA(hid, keyboard)
)
