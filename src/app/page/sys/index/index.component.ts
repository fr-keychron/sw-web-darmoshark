import { Component, OnInit, } from "@angular/core";
import { concatMap, filter, map, Subscription, tap } from "rxjs";
import {ISelectEnums} from "../../../model";
import {GLOBAL_CONFIG, setConfVal} from 'src/app/config';
import { MsgService } from "src/app/service/msg/msg.service";
import { TranslateService } from "@ngx-translate/core";
import { MouseDevice, EEventEnum } from "../../../common/hid-collection";
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";
import { BridgeDevice } from "src/app/common/hid-collection/hid-device/device-dfu/bridge-device";
import { MerchandiseService } from "src/app/service/merchandise/merchandise.service";
import BuildInfo from "../../../version.json";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
@Component({
	selector: "mouse-sys-index",
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	public showUpdate: boolean = false
	constructor(
		private readonly i18n: TranslateService,
		private readonly service: DeviceConnectService,
		private readonly msg: MsgService,
		private readonly http: HttpClient,
		private readonly router: Router,
		private readonly merchandiseService: MerchandiseService
	) {
	}
	public activeLng = GLOBAL_CONFIG.lang
	public lngEnum: ISelectEnums = GLOBAL_CONFIG.langs;
	public resetModal = false
	public updataModal = false
	public profile = 0
	public leftLock: string|null = '1'
	public mouseInfo = {
		mouse: '',//鼠标固件版本
		receiver: '',//接收器固件版本
		launcher: '1.0.0-beta' //launcher版本
	}
	private deviceSub: Subscription;
	public device: MouseDevice
	public versionInfo: {
		fwVersion: string,
		moduleModel: Array<number>,
		hwVersion: string,
		moduleVersion: string,
	}
	public firmwareInfo: any = {
		path: '',
		size: '',
		file: null,
		productName: '',
		lastedVersion: '',
		lastedCreateTime: '',
	}
	ngOnDestroy() {
		if (this.deviceSub) this.deviceSub.unsubscribe();
	} 

	ngOnInit(){
		this.init()
	}
	private init() {
		const device = this.service.getCurrentHidDevice() as MouseDevice
		this.device = device
		const parseInfo = (d: MouseDevice) => {
			this.mouseInfo.mouse = d.firmware.mouse || '0.0.0'
			this.mouseInfo.receiver = d.firmware.receiver || '0.0.0'
		}
		if (device instanceof MouseDevice) {
			parseInfo(device)
			
			this.getFirmwareInfo()
			if(!this.device){ 
				console.error('固件升级接口类未创建');
				return;
			}
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
		device.recovery({tagVal: 255})
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

	// 获取固件信息
	public getFirmwareInfo() {
		this.merchandiseService.info({
			variable: { id: this.device.id }
		})
			.pipe(map((v: any) => v.data))
			.subscribe({
				next: (r: any) => {
					if (r.product && r.firmware.lasted) {
						this.firmwareInfo['productName'] = r.product.name;
						this.firmwareInfo.lastedVersion = r.firmware.lasted?.version
						this.firmwareInfo.lastedCreateTime = r.firmware.lasted?.update_time
						this.firmwareInfo.path = r.firmware.lasted.path
						this.showUpdate =  this.compareVersions(this.mouseInfo.mouse, this.firmwareInfo.lastedVersion) < 0 && r.product.support_update
					}
				}, error: () => {
					this.msg.error(this.i18n.instant('firmware.productNotExist'))
				}
			})
	}

	public goUpdate(){
		this.router.navigate(['/update'])
	}

	public goPair(){
		this.router.navigate(['/pair'])
	}

	private compareVersions(v1: string, v2: string) {
		const arr1 = v1.split('.').map(Number);
		const arr2 = v2.split('.').map(Number);
	
		const len = Math.max(arr1.length, arr2.length);
		for (let i = 0; i < len; i++) {
			const num1 = arr1[i] || 0; 
			const num2 = arr2[i] || 0;
	
			if (num1 > num2) return 1;
			if (num1 < num2) return -1;
		}
	
		return 0;
	}
}
