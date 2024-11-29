import {IEvent, EEventEnum, IHidCollection, IKeyboardOptions} from "./type";
import {HttpClient} from "@angular/common/http";
import {TranslateService} from "@ngx-translate/core";
import {FrequencyRadio, FrEventType} from "./hid-device/frequency-radio";
import {filter, tap} from "rxjs/operators";
import {BaseKeyboard, DebounceKeyboard, HeKeyBoard, KeyboardDevice} from "./hid-device/keyboard-device";
import {EKeyboardCommand, IKeyBoardDef} from "../../model";
import {Observable, Subject} from "rxjs";
import {KeycodeEnumService} from "src/app/common/keycode/keycode-enum.service";
import {GLOBAL_CONFIG} from "../../config";
import {keycodeService} from "src/app/common/keycode/keycode.service";
import {ByteUtil, ConsoleUtil} from "../../utils";
import {ParallelTransceiver, SerialTransceiver, FeatureTransceiver, RecverTransceiver} from "./transceiver";
import {MouseDevice, EMouseCommand} from "./hid-device/mouse-device";
import {BridgeDevice, EBridgeDeviceEventType} from "./hid-device/device-dfu/bridge-device";
import {EDeviceConnectState, EDeviceType} from "./enum";
import {setEMouseBtnAction, EMouseBtnActionKey} from '../hid-collection/hid-device/mouse-device/enum/mouse-button'

const staticPath = 'destination'
const staticPathCus = 'destination_custom'
const M_MousePvId = [
	875876405, // M1
	875876411, // M2
	875876413, // M2 Mini
	875876403, // M3
	875876406, // M3 Mini
	875876415, // M6
	875876420, // M7
]
const DMS_MousePvId = [
	613089082,
	613089042
]
export class HidCollection implements IHidCollection {
	private readonly http: HttpClient
	private readonly i18n: TranslateService
	public readonly event$: Subject<IEvent> = new Subject<IEvent>();

	constructor(
		http: HttpClient,
		i18n: TranslateService,
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
			// 接收器
			const device = BridgeDevice.Build(hid, this.i18n)
			const {vendorId, productId} = hid

			this.collection.bridge.push(device)
			let vpId = this.vendorProductId(vendorId, productId)
			let data: Uint8Array = null
			const getReceiverState = (r?: Uint8Array) => {
				if(r && r.length > 5){
					let v = r.slice(1)
					console.log(v[3]);
					const vid = `0x${ByteUtil.oct2Hex(v[3], 2, "")}${ByteUtil.oct2Hex(
						v[2],
						2,
						""
					)}`;
					const pid = `0x${ByteUtil.oct2Hex(v[5], 2, "")}${ByteUtil.oct2Hex(
						v[4],
						2,
						""
					)}`;
					
					vpId = BridgeDevice.vendorProductId(
						ByteUtil.hex2Oct(vid),
						ByteUtil.hex2Oct(pid)
					);
				}
				console.log(vpId);
				
				// M系列鼠标
				const m_Flag = M_MousePvId.includes(vpId)
				const dms_Flag = DMS_MousePvId.includes(vpId)
				if (m_Flag || dms_Flag) {
					const hidDevice = new MouseDevice({version: m_Flag ? 'M' : 'DMS'}, hid, this.i18n, this.http)
					if(r && r.length > 5){
						hidDevice.setTransceiver(new RecverTransceiver(hid));
					} else {
						hidDevice.setTransceiver(new FeatureTransceiver(hid));
					}
					// hidDevice.setTransceiver(new SerialTransceiver(hid));
					setEMouseBtnAction('button4Click', EMouseBtnActionKey.button4Click)
					setEMouseBtnAction('button5Click', EMouseBtnActionKey.button5Click)
					const host = GLOBAL_CONFIG.API + 'merchandise/product/vpId/' + vpId;
					this.http.get(host)
						.subscribe({
							next: (r: any) => {
								hidDevice.productInfo = {raw: r.data}
								hidDevice.open().subscribe({
									next: () => {
										this.currentHidDevice = hidDevice
										console.log(this.currentHidDevice);
										
										this.collection.mouse.push(hidDevice)
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
							},
							error: (error: any) => {
								if (error.status === 400) {
									s.error(error.error.message)
								} else {
									s.error(this.i18n.instant('mouse.tip.1'))
								}
							}
						})
				} else {
					device.open().subscribe(() => {
						this.currentHidDevice = device
						this.event$.next({type: EEventEnum.CONNECT, data: this})
						s.next(this)
					})
				}
			}

			const run = () => {
				return new Observable(s => {
					const m_Flag = M_MousePvId.includes(vpId)
					if(m_Flag) {
						getReceiverState()
					} else {
						const buf = BridgeDevice.Buffer(20);
						buf[0] = 0x3;
						hid.sendFeatureReport(0x51, buf).then(() => {
							hid.receiveFeatureReport(0x51).then((r: any) => {
								data = new Uint8Array(r.buffer)
								getReceiverState(data)
							})
						})
					}
				})
			}
			if(!hid.opened){
				hid.open().then(()=>{
					run().subscribe()
				})
			} else {
				run().subscribe()
			}

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
			const {productName, opened} = hid
			let id = BaseKeyboard.vendorProductId(hid.vendorId, hid.productId)
			let state = EDeviceConnectState.USB;
			const init = () => {
				if (productName.includes('Link')) {
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
					const host = GLOBAL_CONFIG.API + 'merchandise/product/vpId/' + id;
					this.http.get(host)
						.subscribe((r: any) => {
							loadJson(protocol, r.data.product.dest, r.data)
						}, err => {
							loadJson(protocol, false, {})
						})
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

	// public createMouse(hid: any): Observable<this> {
	// 	return new Observable<this>(s => {
	// 		let onceFlag = false
	// 		let recceiverFlag = false // 接收器标识

	// 		const handleEvent = ($event: any) => {
	// 			const v = new Uint8Array($event.data.buffer)
				
	// 			if (v[0] === EMouseCommand.CMD_BASE_GET_PROTOCOL) {
	// 				const bits = ByteUtil.oct2Bin(v[9])
	// 				// 0--USB   1--2.4G   2--BT
	// 				const workMode = ByteUtil.bin2Oct(bits.substring(5, bits.length))
	// 				// 接受器获取版本
	// 				if (workMode === 1 && !onceFlag) {
	// 					const buf = MouseDevice.Buffer(64)
	// 					buf[0] = EMouseCommand.CMD_BASE_GET_PROTOCOL;
	// 					buf[1] = workMode
	// 					onceFlag = true
	// 					recceiverFlag = true
	// 					hid.addEventListener('inputreport', handleEvent)
	// 					if (hid.opened) {
	// 						hid.sendReport(0xb5, buf)
	// 					} else {
	// 						hid.open().then(() => {
	// 							hid.sendReport(0xb5, buf)
	// 						})
	// 					}
	// 					return
	// 				}

	// 				const version = v[2] << 8 | v[1]
	// 				const hidDevice = new MouseDevice({version, workMode}, hid, this.i18n, this.http)
	// 				const getProducInfo = () => {
	// 					const host = GLOBAL_CONFIG.API + 'merchandise/product/vpId/' + hidDevice.id;
	// 					this.http.get(host)
	// 						.subscribe({
	// 							next: (r: any) => {
	// 								hidDevice.productInfo = {raw: r.data}
	// 								hidDevice.open().subscribe({
	// 									next: () => {
	// 										this.currentHidDevice = hidDevice
	// 										this.collection.mouse.push(hidDevice)
	// 										this.event$.next({type: EEventEnum.CONNECT, data: this})

	// 										s.next(this)
	// 									},
	// 									error: (err: { code: string; msg: any; }) => {
	// 										if (err?.code === 'noHid') {
	// 											s.error(err.msg)
	// 											return
	// 										}
	// 										s.error(this.i18n.instant('mouse.tip.1'))
	// 									}
	// 								})
	// 							}, error: err => {
	// 								s.error(this.i18n.instant('mouse.tip.1'))
	// 							}
	// 						})
	// 				}

	// 				if (recceiverFlag) {
	// 					hidDevice.getReceiverState().subscribe((r) => {
	// 						getProducInfo()
	// 					})
	// 				} else {
	// 					getProducInfo()
	// 				}
	// 			}

	// 			hid.removeEventListener('inputreport', handleEvent);
	// 		}
	// 		// 第一次获取版本
	// 		const buf = MouseDevice.Buffer(20)
	// 		buf[0] = EMouseCommand.CMD_BASE_GET_PROTOCOL;
	// 		hid.addEventListener('inputreport', handleEvent)
	// 		if (hid.opened) {
	// 			hid.sendReport(0xb5, buf)
	// 		} else {
	// 			hid.open().then(() => {
	// 				hid.sendReport(0xb5, buf)
	// 			})
	// 		}
	// 	})
	// }

	public getBridgeDevice(i: number): BridgeDevice {
		if (!this.collection.bridge.length) return undefined;
		return this.collection.bridge[i]
	}

	public getFrDevice(i: number): FrequencyRadio {
		if (!this.collection.fr.length) return undefined;
		return this.collection.fr[i]
	}
	public createMouse(hid: any): Observable<this> {
		return new Observable<this>(s => {
			let onceFlag = false
			let recceiverFlag = false
			const handleEvent = ($event: any) => {
				console.log($event);
				
				const v = new Uint8Array($event.data.buffer)
				const bits = ByteUtil.oct2Bin(v[4])
				const workMode = Number(bits[4])
				if (workMode === 1 && !onceFlag) {
					const buf = MouseDevice.Buffer(64)
					buf[0] = 1;
					buf[2] = 0x81
					buf[3] = 1
					buf[63] =  0xa1 - ( buf[0]  + buf[2] + buf[3])
					onceFlag = true
					recceiverFlag = true
					hid.addEventListener('inputreport', handleEvent)
					if (hid.opened) {
						hid.sendReport(0, buf)
					} else {
						hid.open().then(() => {
							hid.sendReport(0, buf)
						})
					}
					return
				}

				const hidDevice = new MouseDevice({version: "DMS", workMode}, hid, this.i18n, this.http)
				console.log(hidDevice);
				
				const getProducInfo = () => {
					const host = GLOBAL_CONFIG.API + 'merchandise/product/vpId/' + hidDevice.id;
					this.http.get(host)
						.subscribe({
							next: (r: any) => {
								hidDevice.productInfo = {raw: r.data}
								hidDevice.open().subscribe({
									next: () => {
										this.currentHidDevice = hidDevice
										this.collection.mouse.push(hidDevice)
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
							}, error: err => {
								s.error(this.i18n.instant('mouse.tip.1'))
							}
						})
				}
				console.log(recceiverFlag);
				
				if (recceiverFlag) {
					hidDevice.getReceiverState().subscribe((r) => {
						getProducInfo()
					})
				} else {
					getProducInfo()
				}
				hid.removeEventListener('inputreport', handleEvent);
			}
			// 第一次获取版本
			const buf = MouseDevice.Buffer(64)
			buf[0] = 1;
			buf[2] = 0x81
			buf[3] = 1
			buf[63] =  0xa1 - ( buf[0]  + buf[2] + buf[3])
			console.log(buf);
			
			hid.addEventListener('inputreport', handleEvent)
			if (hid.opened) {
				hid.sendReport(0, buf)
			} else {
				hid.open().then(() => {
					hid.sendReport(0, buf)
				})
			}
		})
	}
}
