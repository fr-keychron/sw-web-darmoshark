import {Observable, Subject} from "rxjs";
import {KeyboardDevice} from "../index";
import {ByteUtil} from "../../../../../utils";

export interface IBootLoader {
	flash(f: File): void

	validation(f: File): Observable<boolean>

	close(): void

	event$: Subject<IBootLoaderEvent>;
}

export abstract class BaseBootLoader implements IBootLoader {
	protected hid: any
	protected keyboardDevice: KeyboardDevice

	protected constructor(h: any, k: KeyboardDevice) {
		this.hid = h;
		this.keyboardDevice = k
	}

	public event$: Subject<IBootLoaderEvent>;

	public close(): void {
	}

	public flash(f: File): void {
	}

	public validation(f: File): Observable<boolean> {
		const vid = ByteUtil.hexSplit(this.keyboardDevice.vid, 2)
		const pid = ByteUtil.hexSplit(this.keyboardDevice.pid, 2)
		return new Observable<boolean>(s => {
			const asciiArray = [
				ByteUtil.hex2Oct(vid[1]),
				ByteUtil.hex2Oct(vid[0]),
				ByteUtil.hex2Oct(pid[1]),
				ByteUtil.hex2Oct(pid[0]),
			]
			const fr = new FileReader()
			fr.onload = e => {
				const buffer = e.target.result as ArrayBuffer
				const result = this.findInArrayBuffer(buffer, asciiArray)
				s.next(result)
			}
			fr.readAsArrayBuffer(f)
		})
	}

	public findInArrayBuffer(buffer: ArrayBuffer, asciiArray: Array<number>): boolean {
		let view = new Uint8Array(buffer);
		for (let i = 0; i <= view.length - asciiArray.length; i++) {
			let found = true;
			for (let j = 0; j < asciiArray.length; j++) {
				if (view[i + j] !== asciiArray[j]) {
					found = false;
					break;
				}
			}
			if (found) {
				return true;
			}
		}
		return false;
	}
}

export enum IBootLoaderEventType {
	Erase,
	Flashing,
	Complete,
	Error
}

export interface IBootLoaderEvent {
	type: IBootLoaderEventType
	data: any
}
