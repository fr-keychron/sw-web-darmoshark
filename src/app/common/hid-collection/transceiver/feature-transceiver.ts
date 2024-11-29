import {Transceiver} from "./transceiver";
import {Observable} from "rxjs";

export class FeatureTransceiver extends Transceiver {
	constructor(hid: any) {
		super(hid)
	}

	private commands: Array<[number, Uint8Array | Uint32Array, any]> = []
	private sendFlag: boolean // 单线程控制状态
	public override write(
		reportId: number,
		data: Uint32Array | Uint8Array,
		unIn?: boolean
	) {
		return new Observable(s => {
			this.commands.push([reportId, data, unIn])
			if(!this.sendFlag){
				this.sendFlag = true
				this.featureNext(s)
			}
		})
	}

	protected override sendReport(reportId: number, data: Uint32Array | Uint8Array): Observable<any> {
		return new Observable(s => {
			this.hid.sendFeatureReport(reportId, data).then(() => {
				s.next()
			})
		})
	}

	protected receiveReport(reportId: number): Observable<any> {
		return new Observable(s => {
			this.hid.receiveFeatureReport(reportId).then((r: any) => {
				const newArr = new Uint8Array(r.buffer)
				this.report$.next(newArr)
				// console.log('in:',newArr);
				this.sendFlag = false
				this.featureNext(s)
			})
		})
	}

	public featureNext(s: any) {s
		if (!this.commands.length) return
		const [reportId, data, unIn] = this.commands.shift()
		this.sendReport(reportId, data).subscribe(() => {
			if ([1, 3].includes(unIn)) {
				this.report$.next(data as Uint8Array)
				this.sendFlag = false
				this.featureNext(s)
				s.next()
				// this.sendReport(cmd[2][0], cmd[2][1]).subscribe(()=>{
				// 	this.receiveReport(cmd[0]).subscribe(()=>{
				// 		s.next()
				// 	})
				// })
			} else {
				this.receiveReport(reportId).subscribe(() => {
					s.next()
				})
			}
		})
	}
}
