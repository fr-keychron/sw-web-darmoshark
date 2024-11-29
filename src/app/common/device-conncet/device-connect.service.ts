import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {MsgService} from "../../service/msg/msg.service";
import {HttpClient} from "@angular/common/http";
import {
	BaseKeyboard, DebounceKeyboard,
	EDeviceType,
	EEventEnum,
	EFrConnectState,
	HidCollection,
	IEvent,
	KeyboardDevice,
	MouseDevice
} from "../../common/hid-collection";
import {Observable, Subject, zip} from "rxjs";
import {filter} from "rxjs/operators";
import {BridgeDevice} from "../../common/hid-collection/hid-device/device-dfu/bridge-device";
import {IKeyBoardDef} from "../../model";

interface HidUsage {
	usage: number,
	usagePage: number
}

@Injectable({providedIn: 'root'})
export class DeviceConnectService {
	constructor(
		private readonly i18n: TranslateService,
		private readonly msg: MsgService,
		private readonly http: HttpClient
	) {
		this.support = 'hid' in window.navigator;
		if ((<any>navigator).hid) {
			(<any>navigator).hid.addEventListener('disconnect', (e: any) => {
				this.event$.next({type: EEventEnum.DISCONNECT, data: null})
				this.hidCollection = []
			});
		}
	}

	public support: boolean;
	public loadByKeyboardDef = false;
	public keyboardDef: IKeyBoardDef

	static usages: { keyboard: HidUsage, mouse: HidUsage, dfu: HidUsage } = {
		keyboard: {
			usagePage: 0xff60,
			usage: 0x61, //QMK RAW HID(蓝牙模组升级自动转发)
		},
		dfu: {
			usagePage: 0x8c, // 接收器固件/鼠标(G1(8K),M3,M6,....1K Mouse) -> DFU
			usage: 0x01,
		},
		mouse: {
			usage: 0x01, //鼠标2 -> G1
			usagePage: 0xff0a,
		}
	}
	public event$: Subject<IEvent> = new Subject<IEvent>()

	public currentDevice: KeyboardDevice | MouseDevice | BridgeDevice;

	private hidCollection: Array<HidCollection> = [];

	public getCollection() {
		return this.hidCollection;
	}

	public getCollectionAt(i: number): HidCollection {
		if (!this.hidCollection.length) return undefined;
		return this.hidCollection[i]
	}

	public getHidDevices(): Array<any> {
		if (this.currentDevice) return [this.currentDevice]
		return []
	}

	public getCurrentHidDevice<T extends KeyboardDevice | MouseDevice>(): T {
		return this.currentDevice as T
	}

	requestDevice(filters?: any[]): Observable<any> {
		return new Observable(s => {
			const u = DeviceConnectService.usages;
			// @ts-ignore
			const requestedDevice = navigator.hid.requestDevice({
				filters: filters || [u.keyboard, u.mouse, u.dfu]
			}).then((r: any) => {
				console.log(r)
				if (!r.length) {
					s.error(this.i18n.instant('notify.emptyHid'))
					return
				}
				const v = (n1: number, n2: number) => n1 << 16 | n2;
				const keyboard = v(u.keyboard.usage, u.keyboard.usagePage);
				const mouse = v(u.mouse.usage, u.mouse.usagePage);
				const dfu = v(u.dfu.usage, u.dfu.usagePage);
				const hidCollection = new HidCollection(this.http, this.i18n)
				hidCollection.event$
					.pipe(filter(v => v.type === EEventEnum.Update && v.deviceType === EDeviceType.Bridge))
					.subscribe(v => {
						if (v.data.connect === EFrConnectState.disconnect) {
							this.disconnect()
							this.msg.error(this.i18n.instant('notify.fr_not_connect'))
						}
					})
				this.hidCollection[0] = hidCollection
				let fileDfu = true
				hidCollection.event$
					.pipe(
						filter(v => v.type === EEventEnum.CONNECT),
					)
					.subscribe(v => {
						const d = v.data.currentHidDevice;
						this.currentDevice = d;
						if (d instanceof BridgeDevice && fileDfu) {
							this.event$.next(v)
						} else if (d instanceof BaseKeyboard || d instanceof MouseDevice) {
							this.event$.next(v)
						}
					})

				const obs: Array<Observable<any>> = []
				
				r.forEach((hid: any) => {
					const {collections} = hid;
					collections.forEach((c: any) => {
						const {usage, usagePage} = c
						const deviceType = v(usage, usagePage);
						console.log(`检测到设备: ${hid.productName}, 类型: ${deviceType}`,keyboard,mouse,dfu);
						if (hid.productName.includes('Link')) {
							if (deviceType === dfu) {
								obs.push(hidCollection.createBridgeDevice(hid))
							}
						} else {
							if (deviceType === keyboard) {
								fileDfu = false
								obs.push(hidCollection.createKeyboard(hid, {
									json: this.keyboardDef, loadByJson: this.loadByKeyboardDef
								}))
							}

							if (deviceType === mouse) {
								fileDfu = false
								obs.push(hidCollection.createMouse(hid))
							}

							if (deviceType === dfu) {
								obs.push(hidCollection.createBridgeDevice(hid))
							}
						}
					})
				})
				zip(obs)
					.subscribe({
						next: r => {
							s.next(r)
						}, error: e => {
							this.msg.error(e)
							if (this.currentDevice instanceof BridgeDevice) {
								this.event$.next({
									type: EEventEnum.CONNECT,
									data: this,
									deviceType: EDeviceType.Bridge
								})
							} else {
								s.error(e)
							}
						}
					})
			}).catch(() => {
				s.error(this.i18n.instant('notify.hidAlreadyConnected'))
			})
		})
	}

	disconnect() {
		this.currentDevice.disconnect()
		this.currentDevice = undefined
		this.event$.next({type: EEventEnum.DISCONNECT, data: this})
	}

	public setLocalKeyboardJson(enable: boolean, json: IKeyBoardDef) {
		this.loadByKeyboardDef = enable;
		this.keyboardDef = json;
	}
}
