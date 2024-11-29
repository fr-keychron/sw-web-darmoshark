import {Transceiver} from "./transceiver";
import {Observable} from "rxjs";

export class SerialTransceiver extends Transceiver {

	constructor(hid: any) {
		super(hid)
	}

	private commands: Array<[number, Uint8Array | Uint32Array]> = []
	private isSend = false;

	public override write(reportId: number, data: Uint32Array | Uint8Array) {
		return new Observable(s => {
			this.commands.push([reportId, data])
			this.next()
			s.next()
		})
	}

	protected override handleReport($event: any) {
		super.handleReport($event)
		this.isSend = false;
		this.next()
	}

	public override next() {
		if (this.isSend || !this.commands.length) return
		this.isSend = true
		const cmd = this.commands.shift()
		this.sendReport(cmd[0], cmd[1]).subscribe()
	}

	public override setNext() {
		this.isSend = false;
		this.next()
	}

	public override clear() {
		this.commands = []
	}
}
