import {Component, OnInit} from "@angular/core";
import BuildInfo from 'src/app/version.json'
import {MenuService} from "../../service/menu/index.service";
import {TaskQueueService} from "../../service/task-queue/task-queue.service";
import {NavigationEnd, Router} from "@angular/router";
import {GLOBAL_CONFIG} from "src/app/config";
import {Subscription} from "rxjs";
import { EDeviceConnectState, EEventEnum, MouseDevice} from "src/app/common/hid-collection";
import {DeviceConnectService} from "../../service/device-conncet/device-connect.service";

interface Menu {
	i18n: string,
	path: string,
}

@Component({
	selector: 'layout-aside',
	templateUrl: './aside.component.html',
	styleUrls: ['./aside.component.scss']
})
export class AsideComponent implements OnInit {
	public currentDevice:  MouseDevice = undefined

	constructor(
		private readonly menuService: MenuService,
		private readonly service: DeviceConnectService,
		private readonly task: TaskQueueService,
		private readonly router: Router,
	) {
	}

	public ngOnInit() {
		this.env = BuildInfo.env
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				const url = event.urlAfterRedirects;
				this.currentRoutePath = url.replace('/', '')
			}
		})

		this.deviceEvent = this.service.event$
			.subscribe(r => {
				if ([EEventEnum.DISCONNECT].includes(r.type)) {
					this.currentDevice = undefined
					this.menus = []
					// this.router.navigate(['/waiting'])
				}
			})
		this.currentDevice = undefined
		this.menus = []
		
	}

	public env = '';
	public showLogo = false
	public menus: Array<Menu>
	public currentRoutePath = ''

	public nav(u: string): void {
		this.task.confirm()
			.subscribe(() => {
				this.currentRoutePath = u
				this.router.navigate([u])
			})
	}

	public version = GLOBAL_CONFIG.version

	public showMenu(p: string) {
		let condition: any = {}
		if (this.connectType === 'mouse') {
			const d = this.currentDevice as MouseDevice
			if (!d) return false
			condition = { 
				'mouse/light': () => [875876426, 875876403, 198901714].includes(d.id), // M3灯效
				'mouse/bluetooth': () => d.state === EDeviceConnectState.USB,
				'firmware/frequency': () => d.state === EDeviceConnectState.G,
			}
		}

		if (p in condition) {
			return Reflect.get(condition, p).call(this)
		} else {
			return true
		}
	}


	private connectType: 'mouse'

	public deviceEvent: Subscription;

	public switchType(t: 'mouse') {
		this.connectType = t;
		this.currentDevice = this.service.getCurrentHidDevice();
		this.menus = this.menuService.get("mouse").map((item)=>{
			return {...item,isHovered: false}
		})
		this.menus = this.menuService.get(t)
	}
}
