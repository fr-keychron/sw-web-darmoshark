import {Observable, Subject} from "rxjs";

export abstract class Transceiver {
	protected hid: any;

	public report$: Subject<Uint8Array> = new Subject<Uint8Array>()

	protected constructor(hid: any) {
		this.hid = hid
		this.hid.addEventListener('inputreport', this.handleReport.bind(this))
	}

	protected sendReport(reportId: number, data: Uint32Array | Uint8Array): Observable<any> {
		return new Observable(s => {
			this.hid.sendReport(reportId, data).then()
		})
	}


	public next() {
	}

	public write(reportId: number, data: Uint32Array | Uint8Array, cb?: any): Observable<any> {
		return new Observable<any>(s => s.next())
	}
	
	protected handleReport($event: any) {
		const buf = $event.data;
		const uint8Arr = new Uint8Array(buf.buffer, 0, buf.byteLength);
		this.report$.next(uint8Arr)
	}

	public destroy() {
		this.hid.removeEventListener('inputreport', this.handleReport.bind(this))
	}

	public setNext () {
	}

	public clear() {}
}
