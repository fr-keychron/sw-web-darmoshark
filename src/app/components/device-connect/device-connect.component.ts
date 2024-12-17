import {Component, EventEmitter, OnInit, Output, ViewChild} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {MsgService} from "../../service/msg/msg.service";
import BuildInfo from 'src/app/version.json'
import {Subscription} from "rxjs";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {DeviceConnectService} from "../../service/device-conncet/device-connect.service";
import {BaseKeyboard, EEventEnum, MouseDevice, HidDeviceEventType} from "../../common/hid-collection";
import {ActivatedRoute, Route, Router} from "@angular/router";
import {BridgeDevice} from "src/app/common/hid-collection/hid-device/device-dfu/bridge-device";
import {filter, map} from "rxjs/operators";
@Component({
	selector: 'common-connect-devices',
	templateUrl: './device-connect.component.html',
	styleUrls: ['./device-connect.component.scss']
})
export class DeviceConnectComponent implements OnInit {
	public env = BuildInfo.env;
	private routeConf: {
		keep: boolean
	} = {
		keep: false
	}

	constructor(
		private i18n: TranslateService,
		private msg: MsgService,
		private notification: NzNotificationService,
		private service: DeviceConnectService,
		private router: Router,
		private activeRoute: ActivatedRoute
	) {
	}
	public hidDevices: Array<MouseDevice> = []
	ngOnInit() {
		this.watch()
		this.activeRoute.queryParams.subscribe((s: Record<string, any>) => {
			if (s['keep']) {
				this.routeConf.keep = s['keep']
			}
		})
		if (this.hidDevices) {
			this.hidDeviceInit()
		}
		this.hidConnectEvent()
	}

	public currentDevice: BaseKeyboard | MouseDevice | BridgeDevice // 当前设备信息
	public loading = false // 加载状态
	public devices: Array<BaseKeyboard | MouseDevice> = []  // 已连接的设备信息

	// 初始化设备
	public switchType() {
		let t: 'mouse' | 'keyboard' | 'bridge';
		if (this.currentDevice instanceof MouseDevice) {
			t = 'mouse'
			this.router.navigate(['/mouse/home'])
		} else if (this.currentDevice instanceof BaseKeyboard) {
			return this.msg.error(this.i18n.instant('notify.hidConfNotFound'))
		} else if (this.currentDevice instanceof BridgeDevice) {
			t = "bridge";
			this.router.navigate(['/mouse/home'])
		}
		this.type.next('mouse')
	}

	// 类型上传
	@Output() type = new EventEmitter<"keyboard" | "mouse" | "bridge">()
	/**监听设备 */
	public deviceEvent: Subscription;

	private watch() {
		// 初始化设备订阅状态
		this.devices = [];
		this.deviceEvent?.unsubscribe();
		this.devices = this.service.getHidDevices();
		const device = this.service.getCurrentHidDevice();
		if (device) this.switchType()
		this.deviceEvent = this.service.event$
			.subscribe((r: { type: EEventEnum; }) => {
				if (r.type === EEventEnum.CONNECT) {
					this.currentDevice = this.service.getCurrentHidDevice()
					this.devices = this.service.getHidDevices();
					this.switchType()
				}
				if ([EEventEnum.DISCONNECT].includes(r.type)) {
					this.currentDevice = null
					this.loading = false
				}
			})
	}

	/**更换连接设备 */
	public switchDevice(i: BaseKeyboard | MouseDevice) {
		// if (i.id === this.currentDevice.id) return
		// this.service.swithDevice(i.id);
	}

	/**设备连接 */
	public choseDevice() {
		const s = this.i18n.instant('notify.notSupportHid')
		if (!this.service.support) return this.msg.error(s)
		this.loading = true
		this.service.requestDevice()
			.subscribe(
				(r: any) => {
					setTimeout(() => this.loading = false, 1000)
				},
				(err: any) => {
					this.loading = false
					this.msg.error(err)
				}
			)
	}

	/**断开连接 */
	public disconnect() {
		this.currentDevice = undefined;
		this.loading = false;
		this.service.disconnect()
	}

	@ViewChild('template', {static: true}) template!: any;

	public version: any;

	private updateSub: Subscription;
	public power = 0;
	public powerState = 0;
	public workMode: number;
	public hibernate: boolean = false;

	private hidDeviceInit() {
		const hidDevice = this.service.getCurrentHidDevice() as MouseDevice
		if (!hidDevice) return
		if (this.updateSub) this.updateSub.unsubscribe();
		this.updateSub = hidDevice.update$
			.pipe(filter(v => v.type === 'base'))
			.subscribe(v => {
				this.hibernate = v.data
			})
		const getHidConf = (h: MouseDevice) => {
			this.powerState = h.baseInfo.power.state
			this.power = h.baseInfo.power.value
			this.workMode = h.baseInfo.workMode
		}
		if (hidDevice.loaded) {
			getHidConf(hidDevice)
		} else {
			hidDevice.event$
			.pipe(
				filter(v => v.type === HidDeviceEventType.Complete)
			)
			.subscribe(r => {
				getHidConf(hidDevice)
			})
		}
		
	}

	private hidConnectEvent() {
		this.service.event$
		.pipe(
			filter(v => v.type === EEventEnum.CONNECT)
		)
		.subscribe(() => {
			this.hidDevices = this.service.getHidDevices()
			this.hidDeviceInit()
		})
	}
}
