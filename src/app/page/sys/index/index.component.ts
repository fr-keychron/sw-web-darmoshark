import { Component, OnInit, } from "@angular/core";
import { Subscription } from "rxjs";
import {ISelectEnums} from "../../../model";
import {GLOBAL_CONFIG, setConfVal} from 'src/app/config';
import { MsgService } from "src/app/service/msg/msg.service";
import { TranslateService } from "@ngx-translate/core";
import { MouseDevice, EEventEnum} from "../../../common/hid-collection";
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";
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
	public activeLng = GLOBAL_CONFIG.lang
	public lngEnum: ISelectEnums = GLOBAL_CONFIG.langs;
	public resetModal = false
	public profile = 0
	public leftLock: string|null = '1'
	public isStartUp: string = '1'
	public mouseInfo = {
		mouse: '',//鼠标固件版本
		receiver: '',//接收器固件版本
		launcher: '1.0.0-beta' //launcher版本
	}
	private deviceSub: Subscription;

	ngOnDestroy() {
		if (this.deviceSub) this.deviceSub.unsubscribe();
	} 

	ngOnInit(){
		this.init()
	}
	private init() {
		const device = this.service.getCurrentHidDevice() as MouseDevice
		const parseInfo = (d: MouseDevice) => {
			this.mouseInfo.mouse = d.firmware.mouse
			this.mouseInfo.receiver = d.firmware.receiver
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
				const leftLockList = localStorage.getItem('leftLockList')
				const parsedList = JSON.parse(leftLockList)
				parsedList[this.profile].leftLock = '1'
				localStorage.setItem('leftLockList', JSON.stringify(parsedList));
				this.leftLock = "1"
				this.msg.success(this.i18n.instant('notify.success'))
				this.resetModal = false
			})
		localStorage.removeItem('macroList')
	}
	public setLeftLock(){
		const leftLockList = localStorage.getItem('leftLockList')
		const parsedList = JSON.parse(leftLockList)
		parsedList[this.profile].leftLock = this.leftLock
		localStorage.setItem('leftLockList', JSON.stringify(parsedList));
	}
	
	/**父组件传递方法：鼠标值变化时执行 */
	public load($e: number) {
		if (this.deviceSub) this.deviceSub.unsubscribe()
		this.profile = $e
		const leftLockList = localStorage.getItem('leftLockList')
		const parsedList = JSON.parse(leftLockList)
		if (Array.isArray(parsedList) && parsedList[$e]) {
			this.leftLock = parsedList[$e].leftLock
		}
	}
}
