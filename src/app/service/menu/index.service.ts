import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {AppInitService} from "../../app-init.service";
import {DeviceConnectService} from "../../service/device-conncet/device-connect.service";

@Injectable({providedIn: 'root'})
export class MenuService {

	public event$: Subject<null> = new Subject()
	

	private mouseMenu: Array<any> = [
		{
			i18n: 'mouse.menu.home',
			path: 'mouse/home',
			icon: 'assets/menu/home.png',
			id: 'mouse_home'
		}, {
			i18n: 'mouse.menu.setKey',
			path: 'mouse/key',
			icon: 'assets/menu/setKey.png',
			id: 'mouse_setKey'
		}, {
			i18n: 'mouse.menu.pointer',
			path: 'mouse/dpi',
			icon: 'assets/menu/pointer.png',
			id: 'mouse_pointer'
		}, {
			i18n: 'mouse.menu.setMacro',
			path: 'mouse/macro',
			icon: 'assets/menu/setMacro.png',
			id: 'mouse_setMacro'
		}, {
			i18n: 'mouse.menu.setLight',
			path: 'mouse/light',
			icon: 'assets/menu/setLight.png',
			id: 'mouse_setLight'
		}, {
			i18n: 'mouse.menu.ability',
			path: 'mouse/ability',
			icon: 'assets/menu/ability.png',
			id: 'mouse_ability'
		}, {
			i18n: 'mouse.menu.setSys',
			path: 'mouse/sys',
			icon: 'assets/menu/setSys.png',
			id: 'mouse_setSys'
		}
	]


	public get(t: "mouse") {
		const device = this.connect.getCurrentHidDevice();
		const map = {
			mouse: this.mouseMenu,
		}
		const feat = this.appInit.getFeat();
		const m = map[t];
		const productInfo: any = {}
		if (device.productInfo && device.productInfo.raw) {
			const {product} = device.productInfo.raw
			if (product) productInfo['keyboard_bluetooth_firmware'] = product.support_bluetooth_update === 1
		}
		
		if (Object.keys(feat).length) {
			return m.filter(i => {
				let mark = this.appInit.find(i.id);
				if (mark) return mark;
				return !!productInfo[i.id]
			})
		} else {
			return map[t]
		}
	}

	constructor(
		private readonly appInit: AppInitService,
		private readonly connect: DeviceConnectService,
	) {
	}

	public add(m: any) {
		// if (m instanceof Array) {
		// 	this.keyboardMenu = this.keyboardMenu.concat(m)
		// } else {
		// 	this.keyboardMenu.push(m)
		// }
		this.event$.next(null)
	}
}
