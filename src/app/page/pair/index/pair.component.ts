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

@Component({
	selector: 'mouse-pair',
	templateUrl: './pair.component.html',
	styleUrls: ['./pair.component.scss']
})
export class PairComponent implements OnInit {
	constructor(
		private readonly merchandiseService: MerchandiseService,
		private readonly service: DeviceConnectService,
		private readonly msg: MsgService,
		private readonly i18n: TranslateService,
		private readonly http: HttpClient,
		private readonly router: Router,
	) {
	}
	public tipModal:boolean = false
	public waiting = false
	public percent: number = null
	public device: MouseDevice
	public deviceDFU: MouseDeviceDFU
	ngOnInit() {
		const device = this.service.getCurrentHidDevice() as MouseDevice
		this.device = device 
		if (device) {
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
			this.connect();
			return 
		}
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
				if(deviceDFU.id === this.device.id){
					this.msg.error(this.i18n.instant('mouse.pair.tip'))
					return
				}
				this.step = 1
				this.deviceDFU = deviceDFU
			})
			
		})
	}
	//进入配对模式
    public enterPair() {
		if (!this.device) return;
		this.device.sendPair().subscribe({
			next: (res: any) => {
				if (!this.deviceDFU) return;
				this.deviceDFU.sendPair(res).subscribe({
					next: () => {
						this.tipModal = true
					}, error: (err: any) => {
						this.msg.error(err)
					}
				})
			}, error: (err: any) => {
				this.msg.error(err)
			}
		})
		
	}

	public goHome() {
		this.router.navigate(['/mouse/home'])
	}
}
