import {BaseBootLoader, BootloaderFactory} from ".";
import {IBootLoader, IBootLoaderEvent, IBootLoaderEventType} from "./types";
import {Observable, Subject} from "rxjs";
import {KeyboardDevice} from "../index";
import {ByteUtil} from "../../../../../utils";

export class WestBerry extends BaseBootLoader {
	private address = 0x08000000;

	constructor(hid: any, k : KeyboardDevice) {
		super(hid,k);
		this.hid = hid;
		this.init()
	}

	private async init() {
		await this.hid.open();
		await this.hid.selectConfiguration(1);
		await this.hid.claimInterface(0);
	}

	public override event$: Subject<IBootLoaderEvent> = new Subject<IBootLoaderEvent>()

	private async send(data: Uint8Array) {
		const endpointNumber = 1;
		const result = await this.hid.transferOut(endpointNumber, data);
	}

	private async receive(length: number = 64): Promise<Uint8Array> {
		const endpointNumber = 1;  // IN 端点号
		const result = await this.hid.transferIn(endpointNumber, length);  // 接收最多 64 字节的数据
		return new Uint8Array(result.data.buffer)
	}

	private splitAndPadArrayBuffer(buffer: any, chunkSize: number) {
		const byteArray = new Uint8Array(buffer);
		const result: any[] = [];
		const totalChunks = Math.ceil(byteArray.length / chunkSize);

		for (let i = 0; i < totalChunks; i++) {
			const start = i * chunkSize;
			const end = start + chunkSize;
			const chunk = byteArray.slice(start, end);

			if (chunk.length < chunkSize) {
				const paddedChunk = new Uint8Array(chunkSize);
				paddedChunk.set(chunk);
				result.push(paddedChunk);
			} else {
				result.push(chunk);
			}
		}

		return result;
	}

	public override close(): void {
		this.hid.close();
	}

	public override validation(f: File): Observable<boolean> {
		return new Observable<boolean>(s => {
				s.next(true)
		})
	}

	public override flash(f: File): void {
		this.erase().subscribe(() => {
			this.write(f)
		})
	}

	private erase(): Observable<any> {
		return new Observable<any>(s => {
			this.send(new Uint8Array([0x5e, 0xf0]))
				.then(() => {
					this.receive().then(r => {
						s.next()
					})
				})
		})
	}

	private write(f: File): void {
		const reader = new FileReader();
		this.event$.next({type: IBootLoaderEventType.Flashing, data: 0})
		reader.onload = async (e) => {
			const arrayBuffer = e.target.result;
			const chunks = this.splitAndPadArrayBuffer(arrayBuffer, 0x00000100)
			const addressIncrement = 256;
			for (let i = 0; i < chunks.length; i++) {
				let result = new Uint8Array(268);
				let currentAddress = this.address + (i * addressIncrement);
				result[0] = 0x6a
				result[1] = 0
				result[2] = 0
				result[3] = 0

				result[4] = currentAddress & 0xFF;
				result[5] = (currentAddress >> 8) & 0xFF;
				result[6] = (currentAddress >> 16) & 0xFF;
				result[7] = (currentAddress >> 24) & 0xFF;

				result[8] = 0x0
				result[9] = 0x1
				result[10] = 0x0
				result[11] = 0x0

				for (let j = 0; j < chunks[i].length; j++) {
					result[12 + j] = chunks[i][j];
				}

				await this.send(result)
				await this.receive(64)
				this.event$.next({
					type: IBootLoaderEventType.Flashing,
					data: Number(i / chunks.length * 100).toFixed(2) + '%'
				})
			}
			this.event$.next({type: IBootLoaderEventType.Complete, data: null})
		};
		reader.readAsArrayBuffer(f);
	}
}

BootloaderFactory.inject(
	(s: string) => s.includes('WB'),
	(hid: any, keyboard: KeyboardDevice) => new WestBerry(hid, keyboard)
)
