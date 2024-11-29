import { Component, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import {ISelectEnums} from "../../../model";
import {GLOBAL_CONFIG, setConfVal} from 'src/app/config';
import { MsgService } from "src/app/service/msg/msg.service";
import { TranslateService } from "@ngx-translate/core";
import {ILog, LogService} from "../../../service/log/log.service";
import {HidDeviceEventType, MouseDevice, EEventEnum} from "../../../common/hid-collection";
import {DeviceConnectService} from "../../../common/device-conncet/device-connect.service";
@Component({
	selector: "mouse-sys-index",
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	constructor(
		private readonly i18n: TranslateService,
		private readonly service: DeviceConnectService,
		private readonly msg: MsgService,
	) {
	}
	public device:  MouseDevice
	public activeLng = GLOBAL_CONFIG.lang
	public lngEnum: ISelectEnums = GLOBAL_CONFIG.langs;
	public resetModal = false
	public leftLock: string|null = '1'
	public isStartUp: string = '1'
	public mouseInfo = {
		mouse: '',//鼠标固件版本
		receiver: '',//接收器固件版本
		launcher: '1.0.0-beta' //launcher版本
	}
	ngOnInit(){
		this.initMouse()
		this.leftLock = localStorage.getItem('leftLock')
	}
	private initMouse() {
		const device = this.service.getCurrentHidDevice() as MouseDevice
		const parseInfo = (d: MouseDevice) => {
			this.mouseInfo.mouse = d.firmware.mouse
			this.mouseInfo.receiver = d.firmware.receiver
			this.device = d;
		}

		if (device instanceof MouseDevice) {
			parseInfo(device)
		}

		this.service.event$.subscribe(r => {
			if ([EEventEnum.CONNECT].includes(r.type)) {
				const device = this.service.getCurrentHidDevice() as MouseDevice
				if (device instanceof MouseDevice) {
					parseInfo(device)
				}
			} else {
				this.mouseInfo.mouse = ''
			}
		})
	}

	public changeLang(v: string) {
		this.i18n.use(v)
		this.activeLng = v;
		setConfVal('lang', v);
		localStorage.setItem('lang', v)
		this.i18n.get('setting.title')
	}

	public reset(){
		const device = this.service.getCurrentHidDevice<MouseDevice>();
		device.recovery({value: 255})
			.subscribe( () => {
				localStorage.setItem('leftLock', '1')
				this.msg.success(this.i18n.instant('notify.success'))
				this.resetModal = false
				this.leftLock = "1"
			})
		localStorage.removeItem('macroList')
	}
	public setLeftLock(){
		localStorage.setItem('leftLock', this.leftLock)
	}
}
