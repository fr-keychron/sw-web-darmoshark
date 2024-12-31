import { Component, HostListener, OnInit} from "@angular/core";
import {filter, map} from "rxjs/operators";
import {MerchandiseService} from "../../../service/merchandise/merchandise.service";
import {MsgService} from "../../../service/msg/msg.service";
import {TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {
	EEventEnum,
	MouseDevice,
} from "../../../common/hid-collection";
import {
	MouseDeviceDFU,
} from "../../../common/hid-collection/hid-device/device-dfu/mouse-device";
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";
import { Router } from "@angular/router";
import { GLOBAL_CONFIG } from "src/app/config";

@Component({
	selector: 'firmware-update',
	templateUrl: './update.component.html',
	styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
	constructor(
		private readonly merchandiseService: MerchandiseService,
		private readonly service: DeviceConnectService,
		private readonly msg: MsgService,
		private readonly i18n: TranslateService,
		private readonly http: HttpClient,
		private readonly router: Router,
	) {
	}

	public waiting = false
	public percent: number = null
	public device: MouseDevice
	public deviceDFU: MouseDeviceDFU
	ngOnInit() {
		const device = this.service.getCurrentHidDevice() as MouseDevice
		this.device = device 
		if (device) {
			this.getFirmwareInfo()
			this.version = this.device.firmware.mouse
		}
		this.service.event$
			.pipe(filter(v => v.type === EEventEnum.DISCONNECT))
			.subscribe(() => this.device = undefined)
	}

	public loading = false
	public step = 0;
	public version: string
	public firmwareInfo: any = {
		path: '',
		size: '',
		file: null,
		productName: '',
		lastedVersion: '',
		lastedCreateTime: '',
		desc: ''
	}



	public nextStep() {
		if (this.device) {
			this.enterDFU();
			return this.step = 1
		}
	}
	// 下载固件
	public downloadFirmware(callback: (success: boolean) => void) {
		const path = "https://192.168.31.92:23333/api/upload/bin/27/1735628244872.bin";
		this.loading = true;
		const httpOptions = {
			responseType: 'blob' as 'json'
		};
		this.http.get(path, httpOptions).subscribe({
			next: (r: any) => {
				const file = new File([r], "firmware.bin")
				this.firmwareInfo.file = file
				this.firmwareInfo.size = Number(file.size / 1024).toFixed(2)
				this.loading = false
				callback(true)
			},
			error: () => {
				this.loading = false;
				this.msg.error(this.i18n.instant('firmware.firmwareFail'))
				callback(false)
			}
		});
	}

	public connect() {
		//@ts-ignore
		const requestedDevice = navigator.hid.requestDevice({
			filters: [{
				usagePage: 0xff0a,
				usage: 0x01,
			}]
		}).then((r: any) => {
			const deviceDFU = MouseDeviceDFU.Build(r[0], this.i18n)
			deviceDFU.open().subscribe(() => {
				this.isRecording = false;
				this.deviceDFU = deviceDFU
				this.sendUpdateRequest()
			})
		})
	}
	//进入升级模式
    public enterDFU() {
		if (!this.device) return;
		this.device.sendUpdateRequest().subscribe({
			next: (res: any) => {
				this.isRecording = true;
				this.service.disconnect()
			}, error: (err: any) => {
				this.msg.error(err)
			}
		})
	}

	public sendUpdateRequest () {
		if (this.waiting || !this.firmwareInfo.file) return;
		this.waiting = true
		this.deviceDFU.sendUpdateRequest(this.firmwareInfo.file).subscribe({
			next: (res: any) => {
				if (res) {
					this.percent = res.progress
					if(res.status === 'error'){
						this.msg.error(this.i18n.instant('firmware.flashError'))
						this.waiting = false
					}
					if (res.status === 'done') {
						this.msg.success(this.i18n.instant('firmware.flashSuccess'))
						this.waiting = false
						this.deviceDFU.disconnect()
						setTimeout(() => {
							this.router.navigate(['/mouse/home'])
						}, 1000)
					}
				}
			}, 
			error: (err: any) => {
				this.waiting = false
				this.percent = null
				this.msg.error(err)
			}
		});
	}
 

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
						this.firmwareInfo.lastedVersion = r.firmware.lasted?.version
						this.firmwareInfo.lastedCreateTime = r.firmware.lasted?.update_time
						this.firmwareInfo.path = r.firmware.lasted.path
						const locale = GLOBAL_CONFIG.lang;
						this.firmwareInfo.desc = r.firmware.lasted.desc ? r.firmware.lasted.desc[locale] : ''
						if (!this.firmwareInfo.file && this.firmwareInfo.path) {
							this.downloadFirmware((success: boolean) => {
								if (!success) {
									this.msg.error(this.i18n.instant('firmware.firmwareFail'));
									this.router.navigate(['/mouse/sys'])
								}
							});
							return;
						}
					} else {
						this.msg.error(this.i18n.instant('firmware.productNotExist'))
					}
				}, error: () => {
					this.msg.error(this.i18n.instant('firmware.productNotExist'))
				},
				complete: () => {
					this.loading = false
				}
			})
	}

	private keySequence: string[] = [];
  
	private expectedSequence: string[] = ['d', 'm', 's'];
   
	private isRecording: boolean = false;
	@HostListener('document:keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		if (this.isRecording && this.expectedSequence.includes(key)) {
			this.keySequence.push(key);
			if (this.keySequence.length === this.expectedSequence.length) {
				if (this.keySequence.join('') === this.expectedSequence.join('')) {
					this.connect();
				}
				this.keySequence = [];
			}
		}else{
			this.keySequence = [];
		}
	}
}
