import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { MsgService } from "src/app/service/msg/msg.service";
import { TranslateService } from "@ngx-translate/core";
import { MouseDevice } from "../../../common/hid-collection";
import { DeviceConnectService } from "../../../common/device-conncet/device-connect.service";

@Component({
	selector: "mouse-dpi-index",
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	constructor(
		private readonly service: DeviceConnectService,
		private readonly msgService: MsgService,
		private readonly i18n: TranslateService,
	) {}

	@ViewChild('sysBaseLayout') sysBaseLayout: ElementRef<HTMLImageElement>
	private deviceSub: Subscription;
	ngOnInit(): void {
			
	}

	ngOnDestroy() {
		if (this.deviceSub) this.deviceSub.unsubscribe()
	}

	
	
	public lodList = [
		{
			"index": 1,
			"value": "1.0mm"
		},
		{
			"index": 2,
			"value": "2.0mm"
		}
	]
	public lodValue: number
	public scrollValue: number
	public sensorValue: Array<boolean> = [false, false, false]
	public eSports: number = 0
	public sleepTime: number = 60
	public dalayTime: number = 10;
	public mouseSleep: number = 15
	public scrollType: number = 0
	public dpiValues: Array<[]> = []
	public load($e: number) {
		if (this.deviceSub) this.deviceSub.unsubscribe()
		this.init()
	}

	public init() {
		const device = this.service.getCurrentHidDevice<MouseDevice>()
		device.getBaseInfoDpi().subscribe(()=>{
			const {lod, motion, line, wave, scroll, eSports} = device.baseInfo.dpiConf.sys
			const {sys} = device.json as any
				
			this.lodValue = lod
			this.eSports = eSports
			this.scrollValue =  scroll
			this.sensorValue = [!!wave, !!line, !!motion]
			this.dalayTime = device.baseInfo.dpiConf.delay
			this.sleepTime = device.baseInfo.dpiConf.sleep
			this.lodList = sys.lod
		})
	}

	public submit() {
    	const { lodValue, scrollValue, sensorValue, eSports  } = this
		const device = this.service.getCurrentHidDevice<MouseDevice>()
		device.setExtConf({
			lod: lodValue,
			wave: sensorValue[0] ? 1 : 0 ,
			line: sensorValue[1] ? 1 : 0 ,
			motion: sensorValue[2] ? 1 : 0 ,
			scroll: scrollValue,
			eSports: eSports,
		}).subscribe()
	}
	public submitTime() {
		const device = this.service.getCurrentHidDevice<MouseDevice>()
		device.setBtnTime({
			btnRespondTime: Math.min(Math.max(this.dalayTime, 0), 255),
			sleepTime: this.sleepTime
		}).subscribe()
	}
	public increment() {  
		this.dalayTime++
		this.submitTime()
	}
	
	public decrement() {
		if (this.dalayTime > 0) {
		  	this.dalayTime--
			  this.submitTime()
		}
	}

	public mouseSleepChange() {
		
	}
}
