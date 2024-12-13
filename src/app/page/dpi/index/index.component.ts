import {Component, OnInit} from "@angular/core";
import {Subscription} from "rxjs";
import {filter} from 'rxjs/operators';
import {MsgService} from "src/app/service/msg/msg.service";
import {TranslateService} from "@ngx-translate/core";
import {EEventEnum, HidDeviceEventType, IMouseJson, MouseDevice} from "../../../common/hid-collection";
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";


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
	) {
	}

	public jsonConf: IMouseJson;
	public hidDevices: Array<MouseDevice> = [];
	public currentHidDevice?: MouseDevice;
	public  dpiValues: number[][] = [[0, 0]]
	public oldLevelVal: number[]= []
	public dpiGears:number = 5
	public dpiColors = ['#ff3643', '#003cb8', '#00f78c', '#8726f1', '#fe7f3e', '#e218ff']
	public currentProfile = 0
	public scaleArr = Array(10);
	public dpiLevel = 0 // 当前DPI层级
	public dpiValueX = 0 // 当前DPI值X
	public dpiValueY = 0 // 当前DPI值Y
	public minDpi = 100 // 刻度尺最小DPI
	public maxDpi = 30000 // 刻度尺最大DPI
	public reportRateVal = 0; // 当前回报率
	public reportRate = [
		{value: 125, color: '#ff3643'},
		{value: 500, color: '#003cb8'},
		{value: 1000, color: '#00f78c'},
		{value: 2000, color: '#8726f1'},
		{value: 4000, color: '#fe7f3e'},
		{value: 8000, color: '#fff'},
	]

	ngOnInit() {
		this.hidDevices = this.service.getHidDevices()
		if (this.hidDevices.length) {
			this.init()
		}
		this.hidConnectEvent()
	}

	private deviceSub: Subscription;
	private updateSub: Subscription;

	ngOnDestroy() {
		if (this.deviceSub) this.deviceSub.unsubscribe()
		if (this.updateSub) this.updateSub.unsubscribe()
	}

	// /**触发hid事件，筛选信息并获取 */
	private hidConnectEvent() {
		const {CONNECT, DISCONNECT, CLOSED} = EEventEnum
		this.service.event$.subscribe((v) => {
			switch (v.type) {
				case CONNECT:
					this.hidDevices = this.service.getHidDevices()
					this.init()
					break;
				case DISCONNECT:
					this.currentHidDevice = undefined
					break;
				case CLOSED:
					this.currentHidDevice = this.service.getCurrentHidDevice() as MouseDevice
					break;
				default:
					return;
			}
		})
	}

	public load($e: number) {
		if (this.deviceSub) this.deviceSub.unsubscribe()
		this.init()
	}

	/**连接初始化 */
	private init() {
		this.currentHidDevice = this.service.getCurrentHidDevice() as MouseDevice

		const getHidConf = (h: MouseDevice) => {
			const {json, baseInfo: {
				gears,
				dpiConf, 
				workMode, 
				usb, rf, bt, 
				profile
			}} = h
			
			const drValue = [usb, rf, bt]
			const value = drValue[workMode]
			console.log(h);
			
			this.jsonConf = json; // 鼠标json信息（鼠标名、键位标识。。）
			this.reportRateVal = value?.reportRate;
			this.dpiLevel = value.dpi;
			if (Array.isArray(dpiConf.levelVal) && dpiConf.levelVal.length > 0 && Array.isArray(dpiConf.levelVal[0])) {
				console.log(dpiConf.levelVal[0][0]);
			} else {
				console.log('Invalid dpiConf.levelVal structure');
			}
			
			this.dpiValueX = dpiConf.levelVal[value.dpi];
			this.dpiValueY = dpiConf.levelVal[value.dpi + 1];
			this.currentProfile = profile;
			this.oldLevelVal = JSON.parse(JSON.stringify(json.dpi.level));
			const convertedLevelVal = dpiConf.levelVal.reduce((acc, value, index, array) => {
				if (index % 2 === 0) {
				  acc.push([array[index], array[index + 1]]);
				}
				return acc;
			  }, []);
			this.dpiValues = convertedLevelVal.slice(0, gears)
			
			this.dpiGears = gears || json.dpi.level.length
			if (json?.dpi) {
				const {dpi} = json
				this.minDpi = dpi.limit[0] || 100
				this.maxDpi = dpi.limit[1] || 26000

				if (dpi.colors) {
					this.dpiColors = dpi.colors
				}

				if (Object.keys(dpi.reportRate).length > 0) {
					this.reportRate = dpi.reportRate
						.filter(r => r.type ? r.type.includes(workMode) : true)
						.map(r => ({
							...r,
							color: Array.isArray(r.color) ? 'linear-gradient(' + r.color + ')' : r.color
						}))
				}
			}
		}
		
		const sub = this.currentHidDevice?.getBaseInfo().subscribe(v => {
			if (this.currentHidDevice.loaded) {
				getHidConf(this.currentHidDevice)
			} else {
				this.currentHidDevice.event$
					.pipe(
						filter(v => v.type === HidDeviceEventType.Complete)
					)
					.subscribe(r => {
						getHidConf(this.currentHidDevice)
					})
			}
			sub.unsubscribe()
		})
	}

	// 切换dpi层数的回调
	public changeLevel(level: number) {
		this.dpiLevel = level
		// @ts-ignore
		this.dpiValue = this.dpiValues[level]
	}

	// 刻度改变更新当前层dpi数值
	public changeScale() {
		// @ts-ignore
		this.dpiValues[this.dpiLevel] = this.dpiValue
	} 

	// public handleDpiValue(type: string, val: number) {
	// 	let dpiValue = this.dpiValue
	// 	if (type === 'add') {
	// 		dpiValue += 50
	// 	} else if (type === 'sub') {
	// 		dpiValue -= 50
	// 	} else {
	// 		dpiValue = val
	// 	}
	// 	if (dpiValue >= this.maxDpi) {
	// 		this.dpiValue = this.maxDpi
	// 	} else if (dpiValue <= this.minDpi) {
	// 		this.dpiValue = this.minDpi
	// 	} else {
	// 		this.dpiValue = dpiValue
	// 	}
	// }

	// 提交
	public loading = {
		dpi: false,
		reportRate: false
	}

	// 设置DPI
	public setDpi() {
		if (this.loading.dpi) return;
		this.loading.dpi = true;
		this.currentHidDevice.setDpi({
			current: this.dpiLevel,
			level: null,
			gears: this.dpiGears,
			values: this.dpiValues,
		}).subscribe(() => {
			this.loading.dpi = false;
			this.msgService.success(this.i18n.instant('notify.success'));
			this.init()
		})
	}
	
	public levelCount() {
		if (this.loading.dpi) return;
		this.loading.dpi = true;
		this.currentHidDevice.setDpi({
			current: 0,
			level: null,
			gears: this.dpiGears,
			values: this.oldLevelVal,
		}).subscribe(() => {
			this.loading.dpi = false;
			this.msgService.success(this.i18n.instant('notify.success'));
			this.init()
		})
	}

	// 设置回报率
	public setReportRate(i: number) {
		if (this.loading.reportRate) return;
		this.loading.reportRate = true
		return this.currentHidDevice.setReportRate({
			level: i,
			values: this.reportRate.map(i => i.value)
		}).subscribe(() => {
			this.loading.reportRate = false
			const m = this.i18n.instant('notify.success')
			this.msgService.success(m)
			this.init()
		})
	}
	
	// 恢复出厂设置
	public reset() {
		const device = this.service.getCurrentHidDevice() as MouseDevice
		device.recovery({profile: this.currentProfile, tagVal: 0x22}).subscribe(() => {
			device.getBaseInfo().subscribe(() => {
				this.init()
				this.msgService.success(this.i18n.instant('notify.success'))
			})
		})
	}
}
