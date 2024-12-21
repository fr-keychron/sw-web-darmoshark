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
@Component({
	selector: "mouse-sys-index",
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	loading: boolean;
	support: any;
	constructor(
		private readonly i18n: TranslateService,
		private readonly service: DeviceConnectService,
		private readonly msg: MsgService,
		private readonly http: HttpClient,
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
	public dfuVersion: number
	public connectFlag: boolean = false
	public rate: number = null
	ngOnDestroy() {
		if (this.deviceSub) this.deviceSub.unsubscribe();
	} 

	ngOnInit(){
		this.init()
	}
	private init() {
		const device = this.service.getCurrentHidDevice() as MouseDevice
			console.log(this.service);
		this.device = device
		const parseInfo = (d: MouseDevice) => {
			this.mouseInfo.mouse = d.firmware.mouse
			this.mouseInfo.receiver = d.firmware.receiver
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
		// this.getUpdataInfo()
	}

	// private getUpdataInfo() {
	// 	const hidCollection = this.deviceConnect.getCollectionAt(0)
	// 	if (!hidCollection) return;
	// 	this.device = hidCollection.getBridgeDevice(0)
	// 	if(!this.device){ 
	// 		console.error('固件升级接口类未创建');
	// 		return;
	// 	}

	// 	const init = () => {
	// 		if(!this.device?.getBluetoothDfuVersion) return;
	// 		this.device.getBluetoothDfuVersion()
	// 			.pipe(
	// 				tap((v: any) => this.versionInfo = v),
	// 				concatMap(() => this.device.getDFUVersion())
	// 			)
	// 			.subscribe({
	// 				next: (v: any) => {
	// 					this.dfuVersion = v;
	// 					if (v === 2) {
	// 						// 预留位
	// 					} else {
	// 						this.connectFlag = this.device.openFlag
	// 						this.getFirmwareInfo()
	// 					}
	// 				}, error: () => {
	// 					this.msg.error(this.i18n.instant('firmware.productNotExist'))
	// 				}
	// 			})
	// 	}
	// 	init()
	// 	if(!this.device?.openFlag){
	// 		this.device.open().subscribe(() => {
	// 			init()
	// 		})
	// 	} else {
	// 		init()
	// 	}

	// 	this.deviceConnect.event$
	// 		.pipe(filter(v => v.type === EEventEnum.CONNECT))
	// 		.subscribe(s => {
	// 			init()
	// 		})
	// 	this.deviceConnect.event$
	// 		.pipe(filter(v => v.type === EEventEnum.DISCONNECT))
	// 		.subscribe(s => {
	// 			this.device = null
	// 		})
	// }
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
		console.log(this.device);
		
		this.loading = true
		this.merchandiseService.info({
			variable: { id: this.device.id }
		})
			.pipe(map((v: any) => v.data))
			.subscribe({
				next: (r: any) => {
					if (r.product && r.firmware.lasted) {
						this.firmwareInfo['productName'] = r.product.name;
						this.support = r.product.support_update
						this.firmwareInfo.lastedVersion = r.firmware.lasted?.version
						this.firmwareInfo.lastedCreateTime = r.firmware.lasted?.update_time
						this.firmwareInfo.path = r.firmware.lasted.path
						if (!this.firmwareInfo.file && this.firmwareInfo.path) {
							this.downloadFirmware()
						}
					} else {
						this.msg.error(this.i18n.instant('firmware.productNotExist'))
						this.connectFlag = false
					}
				}, error: () => {
					this.msg.error(this.i18n.instant('firmware.productNotExist'))
					this.connectFlag = false
				},
				complete: () => {
					this.loading = false
				}
			})
	}

	// 下载固件
	public downloadFirmware() {
		const path = this.firmwareInfo.path;
		// if (!this.support) return window.open(this.firmwareInfo.path)
		this.loading = true
		const httpOptions = {
			responseType: 'blob' as 'json'
		};
		this.http.get(path, httpOptions)
			.subscribe((r: any) => {
				const file = new File([r], "firmware.bin");
				this.firmwareInfo.file = file
				this.firmwareInfo.size = Number(file.size / 1024).toFixed(2)
				this.loading = false
			})
	}

	// 更新固件
	public isVisible: boolean = false

	public onUpload() {
		if (this.loading) return;
		this.loading = true
		const file = this.firmwareInfo.file
		const reader = new FileReader();
		reader.readAsArrayBuffer(file);
		reader.onload = () => {
			// const arrayBuffer = reader.result as ArrayBuffer;
			// const originData = new Uint8Array(arrayBuffer);
			// const verifyKey = this.versionInfo.moduleModel
			// const originL = originData.length;
			// const verifyL = verifyKey.length;
			let flag = true

			// for (let i = 0; i <= originL - verifyL; i++) {
			// 	let j;
			// 	for (j = 0; j < verifyL; j++) {
			// 		if (originData[i + j] !== verifyKey[j]) {
			// 			break;
			// 		}
			// 	}
			// 	if (j === verifyL) {
			// 		flag = true
			// 	}
			// }
			this.isVisible = true
			if (flag) {
				console.log(this.device);
				
				this.device.sendUpdateRequest(file).subscribe({next: (res: any) => {
					if (res) {
						this.rate = res.data
						if(!res.data){
							this.loading = false
							this.isVisible = false
						}
						if (res.status === 'done') {
							this.msg.success(this.i18n.instant('notify.success'))
							this.loading = false
							this.isVisible = false
							this.device.disconnect()
							this.connectFlag = false
						}
					}
				}, error: (err: any) => {
					this.loading = false
					this.isVisible = false
					this.rate = null
					this.msg.error(err)
				}})
			} else {
				this.loading = false
				this.isVisible = false
				this.msg.error(this.i18n.instant('The firmware model is different！'))
			}
		};
	}

	public get sameversion () {
		if (["QA","DEV"].includes(BuildInfo.env)) return false;
		return this.versionInfo?.fwVersion === this.firmwareInfo?.lastedVersion
	}
}
