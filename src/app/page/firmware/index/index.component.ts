import { Component } from "@angular/core";
import { concatMap, filter, map, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { MsgService } from "src/app/service/msg/msg.service";
import { MerchandiseService } from "src/app/service/merchandise/merchandise.service";
import { EEventEnum } from "src/app/common/hid-collection";
import { DeviceConnectService } from "src/app/common/device-conncet/device-connect.service";
import { BridgeDevice } from "src/app/common/hid-collection/hid-device/device-dfu/bridge-device";

@Component({
	selector: "mouse-dpi-index",
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent {
	constructor(
		private readonly merchandiseService: MerchandiseService,
		private readonly deviceConnect: DeviceConnectService,
		private readonly i18n: TranslateService,
		private readonly msg: MsgService,
		private readonly http: HttpClient
	) {
	}

	public device: BridgeDevice
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
	public connectFlag: boolean = false
	public rate: number = null
	public nextFlag: boolean = false
	public loading = false
	public support: number
	public dfuVersion: number

	ngOnInit() {
		const hidCollection = this.deviceConnect.getCollectionAt(0)
		if (!hidCollection) return;
		this.device = hidCollection.getBridgeDevice(0)

		const init = () => {
			if(!this.device?.getBluetoothDfuVersion) return;
			this.device.getBluetoothDfuVersion()
				.pipe(
					tap((v: any) => this.versionInfo = v),
					concatMap(() => this.device.getDFUVersion())
				)
				.subscribe({
					next: (v: any) => {
						this.dfuVersion = v;
						if (v === 2) {
							// 预留位
						} else {
							this.connectFlag = this.device.openFlag
							this.getFirmwareInfo()
						}
					}, error: () => {
						this.msg.error(this.i18n.instant('firmware.productNotExist'))
					}
				})
		}
		init()
		if(!this.device.openFlag){
			this.device.open().subscribe(() => {
				init()
			})
		} else {
			init()
		}

		this.deviceConnect.event$
			.pipe(filter(v => v.type === EEventEnum.CONNECT))
			.subscribe(s => {
				init()
			})
		this.deviceConnect.event$
			.pipe(filter(v => v.type === EEventEnum.DISCONNECT))
			.subscribe(s => {
				this.device = null
			})
	}

	// 连接
	// public onConnect() {
	// 	this.device.connect().subscribe(r => {
	// 		if (r.opened) {
	// 			this.getFirmwareInfo(r)
	// 		}
	// 	}, (err) => {
	// 		this.msg.error(err)
	// 	})
	// }

	// 获取固件信息
	public getFirmwareInfo() {
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

	// 页面切换
	public handleStep() {
		if (this.loading) return;
		if (!this.nextFlag && !this.firmwareInfo.file) {
			this.downloadFirmware()
		} else {
			this.nextFlag = !this.nextFlag
		}
	}

	// 下载固件
	public downloadFirmware() {
		const path = this.firmwareInfo.path;
		if (!this.support) return window.open(this.firmwareInfo.path)
		this.loading = true
		const httpOptions = {
			responseType: 'blob' as 'json'
		};
		this.http.get(path, httpOptions)
			.subscribe((r: any) => {
				const file = new File([r], "firmware.bin");
				this.firmwareInfo.file = file
				this.firmwareInfo.size = Number(file.size / 1024).toFixed(2)
				this.nextFlag = true
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
			const arrayBuffer = reader.result as ArrayBuffer;
			const originData = new Uint8Array(arrayBuffer);
			const verifyKey = this.versionInfo.moduleModel
			const originL = originData.length;
			const verifyL = verifyKey.length;
			let flag = false

			for (let i = 0; i <= originL - verifyL; i++) {
				let j;
				for (j = 0; j < verifyL; j++) {
					if (originData[i + j] !== verifyKey[j]) {
						break;
					}
				}
				if (j === verifyL) {
					flag = true
				}
			}
			this.isVisible = true
			if (flag) {
				this.device.bluetoothUpdate(file).subscribe({next: (res: any) => {
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
}
