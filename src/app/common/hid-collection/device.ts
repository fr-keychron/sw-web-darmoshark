import {IEvent, EEventEnum, IHidCollection, IKeyboardOptions, IMouseOptions} from "./type";
import {HttpClient} from "@angular/common/http";
import {TranslateService} from "@ngx-translate/core";
import {FrequencyRadio, FrEventType} from "./hid-device/frequency-radio";
import {filter, tap} from "rxjs/operators";
import {BaseKeyboard, DebounceKeyboard, HeKeyBoard, KeyboardDevice} from "./hid-device/keyboard-device";
import {EKeyboardCommand, IKeyBoardDef} from "../../model";
import {fromEvent, Observable, Subject} from "rxjs";
import {KeycodeEnumService} from "../../service/keycode/keycode-enum.service";
import {GLOBAL_CONFIG} from "../../config";
import {keycodeService} from "../../service/keycode/keycode.service";
import {ByteUtil, ConsoleUtil} from "../../utils";
import {SerialTransceiver, FeatureTransceiver, RecverTransceiver} from "./transceiver";
import {convertMacroLoop, MouseDevice} from "./hid-device/mouse-device";
import {BridgeDevice, EBridgeDeviceEventType} from "./hid-device/device-dfu/bridge-device";
import {EDeviceConnectState, EDeviceType} from "./enum";
import {setEMouseBtnAction, EMouseBtnActionKey, convertMouseBtnActionEnum, convertMouseBtnMedia, convertMouseBtnDpi, convertMousseBtnShortcut } from '../hid-collection/hid-device/mouse-device/enum/mouse-button'
import {
	DecorateLightKeyboard
} from "./hid-device/keyboard-device/feature-keyboard/decorate-light/decorate-light-keyboard";
import {MerchandiseService} from 'src/app/service/merchandise/merchandise.service'

const staticPath = 'destination'
const staticPathCus = 'destination_custom'

export class HidCollection implements IHidCollection {
	public readonly event$: Subject<IEvent> = new Subject<IEvent>()
	private readonly merchandise: MerchandiseService

	constructor(
		private readonly http: HttpClient,
		private readonly i18n: TranslateService,
	) {
		this.http = http;
		this.i18n = i18n;
	}

	public collection: {
		keyboard: Array<BaseKeyboard | HeKeyBoard | DebounceKeyboard>,
		mouse: Array<MouseDevice>,
		bridge: Array<BridgeDevice>,
		fr: Array<FrequencyRadio>
	} = {
		keyboard: [],
		mouse: [],
		bridge: [],
		fr: [],
	}

	public vendorProductId(vendorId: number, productId: number) {
		return vendorId * 65536 + productId;
	}


	public createBridgeDevice(hid: any): Observable<this> {
		return new Observable(s => {
			const device = BridgeDevice.Build(hid, this.i18n)
			this.collection.bridge.push(device)
			
			device.open().subscribe(() => {
				this.currentHidDevice = device
				// this.event$.next({type: EEventEnum.CONNECT, data: this})
				s.next(this)
			})

			device.event$
				.pipe(filter(v => v.type === EBridgeDeviceEventType.update))
				.subscribe(v => {
					if (this.currentHidDevice instanceof BaseKeyboard) this.currentHidDevice.transceiver.clear()
					this.event$.next({type: EEventEnum.Update, deviceType: EDeviceType.Bridge, data: v.data})
				})
		})
	}

	private currentHidDevice: KeyboardDevice | MouseDevice | BridgeDevice

	public createKeyboard(hid: any, opt: IKeyboardOptions = {}): Observable<this> {
		return new Observable(s => {
			const {opened} = hid
			let id = BaseKeyboard.vendorProductId(hid.vendorId, hid.productId)
			let state = EDeviceConnectState.USB;
			const init = () => {
				if (opt.product?.workMode === 1) {
					const fr = new FrequencyRadio(hid, this.i18n)
					fr.event$
						.pipe(
							tap(v => {
								if (v.type === FrEventType.Error) {
									s.error(v.data)
								}
							}),
							filter(v => v.type === FrEventType.Ready)
						)
						.subscribe(() => {
							id = BaseKeyboard.vendorProductId(fr.connectDevice.vid, fr.connectDevice.pid)
							state = EDeviceConnectState.G;
							KeycodeEnumService.prototol = fr.viaVersion;
							fetchDeviceInfo(fr.viaVersion)
						})
					this.collection.fr.push(fr)
				} else {
					const buf = BaseKeyboard.Buffer()
					buf[0] = EKeyboardCommand.GET_PROTOCOL_VERSION
					hid.addEventListener("inputreport", handleEvent)
					hid.sendReport(0, buf).then()
				}
			}

			const handleEvent = ($event: any) => {
				const buf = $event.data;
				const uint8Arr = new Uint8Array(buf.buffer, 0, buf.byteLength);
				const cmd = uint8Arr[0]
				if (cmd === EKeyboardCommand.GET_PROTOCOL_VERSION) {
					const protocol = uint8Arr[2] || 5;
					KeycodeEnumService.prototol = protocol;
					fetchDeviceInfo(protocol)
				}
				hid.removeEventListener('inputreport', handleEvent);
			}

			const fetchDeviceInfo = (protocol: number) => {
				if (opt.loadByJson) {
					if (!opt.json) {
						s.error(this.i18n.instant('notify.hidConfNotFound'))
					} else {
						loadDevice(protocol, opt.json, {})
					}
				} else {
					if(opt.product){
						loadJson(protocol, opt.product.product.dest, opt.product)
					} else {
						loadJson(protocol, false, {})
					}
				}
			}

			const loadDevice = (protocol: number, r: IKeyBoardDef, info: any) => {
				const feature = (r['feature'] || [])[0] || 'Base';
				keycodeService.loadKeyJson(r['name'])
				let device: KeyboardDevice;
				if (feature === "HE") {
					device = HeKeyBoard.build(hid, this.i18n, protocol, r as IKeyBoardDef)
				} else if (feature === 'DEBOUNCE') {
					device = DebounceKeyboard.build(hid, this.i18n, protocol, r as IKeyBoardDef)
				} else if (feature === 'DECORATE_LIGHT') {
					device = DecorateLightKeyboard.build(hid, this.i18n, protocol, r as IKeyBoardDef)
				} else {
					device = BaseKeyboard.build(hid, this.i18n, protocol, r as IKeyBoardDef)
				}
				const firmware = info.firmware?.lasted?.version;
				let version = null;
				if (firmware) {
					version = firmware.replace(/v|\./gi, '').split('').join('.')
				}
				device.productInfo = {
					firmware: 'v' + version,
					raw: info
				};
				device.name = info.product ? info.product.name : r.name;
				device.state = state;
				if ([EDeviceConnectState.USB].includes(state)) {
					device.setTransceiver(new SerialTransceiver(hid))
				} else {
					device.setTransceiver(new SerialTransceiver(hid))
				}
				this.currentHidDevice = device;
				initialize()
			}
			const loadJson = (protocol: number, dest: boolean, info: any) => {
				hid.removeEventListener("inputreport", handleEvent)
				const version = protocol >= 11 ? 'v3' : 'v2';
				const path = dest ? GLOBAL_CONFIG.STATIC + staticPathCus : GLOBAL_CONFIG.STATIC + staticPath;
				this.http.get(`${path}/${version}/${id}.json`)
					.subscribe(
						(r: any) => loadDevice(protocol, r, info),
						err => {
							ConsoleUtil.colorfulLog(`${hid.productName} load json conf fail`)
							s.error(this.i18n.instant('notify.hidConfNotFound'))
						})
			}

			const initialize = () => {
				this.currentHidDevice.open()
					.subscribe(() => {
						this.event$.next({type: EEventEnum.CONNECT, data: this})
						const kb = this.currentHidDevice as BaseKeyboard
						this.collection.keyboard.push(kb)
						s.next(this)
					})
			}
			if (!opened) {
				hid.open()
					.then(() => init())
					.catch(() => s.error(this.i18n.instant('notify.hidAlreadyConnected')))
			} else {
				init()
			}
		})
	}

	public createMouse(hid: any, { product, json }: IMouseOptions = {}): Observable<this> {
		return new Observable<this>(s => {
			let hidDevice: MouseDevice
			const getDevice = ({version, workMode}: any) => {
				const v = { version, workMode }
				console.log(v);
				
				Object.keys(EMouseBtnActionKey).forEach(key => {
					const enumKey = key as keyof typeof EMouseBtnActionKey;
					setEMouseBtnAction(enumKey, EMouseBtnActionKey[enumKey]);
				});
				if (version === 'M') {
					setEMouseBtnAction('button4Click', EMouseBtnActionKey.button4Click)
					setEMouseBtnAction('button5Click', EMouseBtnActionKey.button5Click)
					hidDevice = new MouseDevice({
						product: {...product, ...v},
						json,
						hid,
						i18n: this.i18n,
						http: this.http,
						transceiver: workMode === 1 ? new RecverTransceiver(hid) : new FeatureTransceiver(hid)
					})
				} else if (version === 4) {
					convertMouseBtnMedia()
					convertMouseBtnActionEnum()
					convertMouseBtnDpi()
					convertMousseBtnShortcut()
					convertMacroLoop()
					hidDevice = new MouseDevice({
						product: {...product, ...v},
						json,
						hid,
						i18n: this.i18n,
						http: this.http
					})
				} else {
					hidDevice = new MouseDevice({
						product: {...product, ...v},
						json,
						hid,
						i18n: this.i18n,
						http: this.http
					})
				}
				
				hidDevice.productInfo = {raw: product}
				hidDevice?.open().subscribe({
					next: () => {
						this.currentHidDevice = hidDevice
						this.collection.mouse.push(hidDevice)
						console.log(this.currentHidDevice);
						
						this.event$.next({type: EEventEnum.CONNECT, data: this})
						s.next(this)
					},
					error: (err: { code: string; msg: any; }) => {
						if (err?.code === 'noHid') {
							s.error(err.msg)
							return
						}
						s.error(this.i18n.instant('mouse.tip.1'))
					}
				})
			} 
			if(product?.contract === 4){
				getDevice({version: product.contract, workMode: product.workMode || 0})
			} else{
				const report = fromEvent(hid, 'inputreport').subscribe(($event: any) => {
					const v = new Uint8Array($event.data.buffer)
					if (v[0] === 2) {
						const version = v[2] << 8 | v[1]
						const bits = ByteUtil.oct2Bin(v[8])
						const workMode = ByteUtil.bin2Oct(bits.substring(5, bits.length))
						getDevice({version, workMode})
						report.unsubscribe()
					}
				})
	
				const buf = MouseDevice.Buffer(20)
				buf[0] = 0x02;
				if(product?.contract){
					getDevice({version: product.contract, workMode: product.workMode || 0})
				} else if (hid.opened) {
					hid.sendReport(0xb5, buf)
				} else {
					hid.open().then(() => {
						hid.sendReport(0xb5, buf)
					})
				}
			}
		})
	}

	public getBridgeDevice(i: number): BridgeDevice {
		if (!this.collection.bridge.length) return undefined;
		return this.collection.bridge[i]
	}

	public getFrDevice(i: number): FrequencyRadio {
		if (!this.collection.fr.length) return undefined;
		return this.collection.fr[i]
	}
}
