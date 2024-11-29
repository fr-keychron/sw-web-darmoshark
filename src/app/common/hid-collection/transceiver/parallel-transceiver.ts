import {Observable} from "rxjs";
import {Transceiver} from "./transceiver";

export class ParallelTransceiver extends Transceiver {
	constructor(hid: any) {
		super(hid);
	}

	public override write(reportId: number, data: Uint32Array | Uint8Array) {
		return new Observable(s => {
			this.sendReport(reportId, data).subscribe()
			s.next()
		})
	}
}
