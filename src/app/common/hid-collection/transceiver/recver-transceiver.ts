import {Transceiver} from "./transceiver";
import {fromEvent, Observable, Subscription} from "rxjs";

export class RecverTransceiver extends Transceiver {
	constructor(hid: any) {
		super(hid)
	}

	private commands: Array<[number, Uint8Array | Uint32Array, any]> = []
	private sendFlag: boolean // 单线程控制状态
	private receive: Subscription
	public override write(
		reportId: number,
		data: Uint32Array | Uint8Array,
		receiveWay?: boolean | number
	) {
		return new Observable(s => {
			this.commands.push([reportId, data, receiveWay])
			if(!this.sendFlag){
				this.sendFlag = true
				this.featureNext(s)
			}
		})
	}

	protected override sendReport(reportId: number, data: Uint32Array | Uint8Array): Observable<any> {
		return new Observable(s => {
			this.hid.sendFeatureReport(reportId, data).then(() => {
				s.next(data)
			})
		})
	}

	protected receiveReport(reportId: number): Observable<any> {
		return new Observable(s => {
			this.hid.receiveFeatureReport(reportId).then((r: any) => {
				const newArr = new Uint8Array(r.buffer)
				this.report$.next(newArr)
				s.next(newArr)
				// console.log('in:',newArr);
				this.featureNext(s)
			})
		})
	}

	public featureNext(s: any) {
		if (!this.commands.length){
			this.sendFlag = false
			return
		}
		let time: string | number | NodeJS.Timeout
		const [reportId, data, receiveWay] = this.commands.shift()
		
		switch(receiveWay){
			case 0: // 无监听，获取
			case 1: // 无监听，无获取
				this.sendReport(reportId, data).subscribe((r) => {
					if(receiveWay===0){
							this.receiveReport(reportId).subscribe((r)=>{
								s.next(r)
							})
					} else {
						this.report$.next(r)
						this.featureNext(s)
						s.next()
					}
				})
				break;
			case 2: // e4状态监听，获取
			case 3: // e4状态监听，无获取
				let finishFlag = false
				if(receiveWay===2){
					if(this.receive){
						this.receive.unsubscribe()
					}
					this.receive = fromEvent(this.hid, 'inputreport').subscribe((r:any)=> {
						const state = new Uint8Array(r.data.buffer)
						if(state[0]===0xe4){
	
							// const stateStr =['0 发送成功','1 接收成功','2 未连接','3 发送失败','4 busy','5 参数错误','6 flash空间不足']
							// console.log('Report Flag:', stateStr[state[1]]);
							// console.log(state);
							if (state[1] === 0){
								clearTimeout(time)
								time = setTimeout(()=> {
									this.sendReport(reportId, data).subscribe(()=>{})
								}, 1000)
							}
							if (state[1] === 1) {
								clearTimeout(time)
								this.receiveReport(reportId).subscribe(() => {
									s.next()
								})
								this.receive.unsubscribe()
							} else if(state[1] === 4) {
								clearTimeout(time)
								time = setTimeout(()=> {
									this.sendReport(reportId, data).subscribe(()=>{})
								}, 1000)
							}
						}
					})
				}
				
				this.sendReport(reportId, data).subscribe((r)=>{
					if(receiveWay === 3 && !finishFlag){
						setTimeout(()=>{
							this.report$.next(r)
							this.featureNext(s)
							s.next()
						}, 1000)
					}
				})
				break;
			default: break;
		}
	}
}
