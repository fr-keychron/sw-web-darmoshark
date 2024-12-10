import {filter, map, Observable, Subject, Subscription, switchMap, timeout} from "rxjs";
import {HidDeviceEventType, IHidDeviceEvent, IHidOpen, IKeyBufferResult} from "./types";
import {TranslateService} from "@ngx-translate/core";
import {
	EHECommand,
	EKeyboardCommand,
	EKnobDirection,
	IKeyBoardDef,
	IKeycode,
	IKeyConf,
	IKeyMacros,
	Result
} from "src/app/model";
import {keycodeService} from "src/app/service/keycode/keycode.service";
import {ByteUtil} from "src/app/utils/byte.util";
import {commonMenus, getLightingDefinition} from '@the-via/reader';
import {BacklightControls, UnderglowControls} from './general'
import {GLOBAL_CONFIG} from "src/app/config";
import KeyCover from 'src/assets/json/key-cover.json'
import lodash from 'lodash';
import {Transceiver} from "../../transceiver/transceiver";
import {EDeviceConnectState} from "../../enum";
import {BaseCommand, IBaseCommand} from "./command/base.command";
import {IRgbCommand, RGB_V1} from "./command/rgb";
import {IMixRgb, MixRgbV1} from "./command/mixRgb";
import {tap} from "rxjs/operators";
import {ISleep} from "./command/sleep";
import {Sleep_V1} from "./command/sleep/V1";

export interface ISupportFeature {
	Get_Default_Layer: boolean,
	Support_Le: boolean,
	Support_Rf: boolean,
	Support_Mock_Key: boolean,
	Upload_Default_Layer: boolean
}

export class BaseKeyboard {
	public name = ''
	public id = 0
	public pid: string
	public vid: string
	public layerCount = 0
	public macroCount = 0
	public selectLayer = 0
	public currentLayer = -1
	public currentProfile = 0
	public macroSize = 0
	public protocol = 0
	public firmwareVersion: string
	public productInfo: any
	public kcVersion: any
	public state: EDeviceConnectState = EDeviceConnectState.USB;
	public feature: { rgb: IRgbCommand, mixRgb: IMixRgb, sleep: ISleep } = {
		rgb: null, mixRgb: null, sleep: null
	}
	private baseCommand: IBaseCommand;
	public transceiver: Transceiver;
	public instruction_set: number;

	public get version() {
		return this.protocol >= 11 ? 'v3' : 'v2';
	}

	public definition?: IKeyBoardDef
	public keyBufferResult: Array<IKeyBufferResult> = []

	public opened = false

	public hidDeviceRaw: any;
	i18n: TranslateService;

	public report$: Subject<Uint8Array> = new Subject<Uint8Array>()
	public event$: Subject<IHidDeviceEvent> = new Subject<IHidDeviceEvent>();


	static build(
		s: any,
		i18n: TranslateService,
		protocol: number,
		definition: IKeyBoardDef
	) {
		return new BaseKeyboard(s, i18n, protocol, definition)
	}

	constructor(
		s: any,
		i18n: TranslateService,
		protocol: number,
		definition: IKeyBoardDef
	) {
		this.id = BaseKeyboard.vendorProductId(s.vendorId, s.productId)
		this.pid = ByteUtil.oct2Hex(s.productId, 4)
		this.vid = ByteUtil.oct2Hex(s.vendorId, 4)
		this.opened = s.opened;
		this.hidDeviceRaw = s;
		this.i18n = i18n
		this.name = s.productName
		this.protocol = protocol
		this.definition = definition
		this.baseCommand = new BaseCommand(this)

	}

	public monkeyPatch(force: boolean = false) {
		return new Observable(s => {
			if (this.vid === "0x3434" && this.pid === "0x0a35") {
				const keys = [
					{
						layer: 0,
						source: {
							"val": 82,
							"code": "KC_UP",
							"hex": "52",
							"name": "↑",
							"longName": "Up",
							"col": 13,
							"row": 5,
							"title": ""
						},
						target: {
							name: "Left",
							code: "KC_LEFT"
						}
					},
					{
						"source": {
							"val": 80,
							"code": "KC_LEFT",
							"hex": "50",
							"name": "←",
							"longName": "Left",
							"col": 12,
							"row": 5,
							"title": ""
						},
						"target": {
							"name": "Right Ctrl",
							"code": "KC_RCTL",
							"width": 1250,
							"shortName": "Ctrl",
							"capName": "RCtrl",
						},
						layer: 0
					}, {
						"source": {
							"val": 229,
							"code": "KC_RSFT",
							"hex": "e5",
							"name": "Shift",
							"longName": "Right Shift",
							"capName": "RShift",
							"col": 14,
							"row": 4,
							title: ''
						},
						"target": {
							"name": "Up",
							"code": "KC_UP",
							"keys": "up",
							"shortName": "↑",
							"event": {
								"isTrusted": true
							}
						},
						layer: 0
					}, {
						"source": {
							"val": 0,
							"code": "KC_NO",
							"hex": "0",
							"name": " ",
							"longName": " ",
							"title": "Nothing",
							"col": 14,
							"row": 4
						},
						"target": {
							"name": "Right Shift",
							"code": "KC_RSFT",
							"width": 2750,
							"shortName": "Shift",
							"capName": "RShift",
							"event": {
								"isTrusted": true
							}
						},
						layer: 1
					},
					{
						"source": {
							"val": 229,
							"code": "KC_RSFT",
							"hex": "e5",
							"name": "Shift",
							"longName": "Right Shift",
							"title": '',
							"capName": "RShift",
							"col": 14,
							"row": 4
						},
						"target": {
							"name": "Up",
							"code": "KC_UP",
							"keys": "up",
							"shortName": "↑",
							"event": {
								"isTrusted": true
							}
						},
						layer: 2
					}, {
						"source": {
							"val": 82,
							"code": "KC_UP",
							"hex": "52",
							"name": "↑",
							"title": '',
							"longName": "Up",
							"col": 13,
							"row": 5
						},
						"target": {
							"name": "Left",
							"code": "KC_LEFT",
							"keys": "left",
							"shortName": "←",
							"event": {
								"isTrusted": true
							}
						},
						layer: 2
					},
					{
						"source": {
							"val": 80,
							"code": "KC_LEFT",
							"hex": "50",
							"title": '',
							"name": "←",
							"longName": "Left",
							"col": 12,
							"row": 5
						},
						"target": {
							"name": "Right Ctrl",
							"code": "KC_RCTL",
							"width": 1250,
							"shortName": "Ctrl",
							"capName": "RCtrl",
							"event": {
								"isTrusted": true
							}
						},
						layer: 2
					},
					{
						"source": {
							"val": 1,
							"code": "KC_TRNS",
							"hex": "1",
							"name": "▽",
							"longName": "▽",
							"title": "Pass-through",
							"col": 14,
							"row": 4
						},
						"target": {
							"name": "Right Shift",
							"code": "KC_RSFT",
							"width": 2750,
							"shortName": "Shift",
							"capName": "RShift",
							"event": {
								"isTrusted": true
							}
						},
						layer: 3
					}
				]

				const run = () => {
					if (keys.length) {
						const conf = keys.shift();
						this.exchangeKeys(conf)
							.subscribe(() => {
								run()
							})
					} else {
						s.next()
					}
				}
				const v = window.localStorage.getItem(this.id + 'monkey');
				if (!v || force) {
					window.localStorage.setItem(this.id + 'monkey', 'true')
					run()
				} else {
					s.next()
				}
			} else {
				s.next()
			}
		})
	}

	static vendorProductId(vendorId: number, productId: number) {
		return vendorId * 65536 + productId;
	}

	public macroDelaySupport(): boolean {
		return this.protocol >= 11
	}

	public open(): Observable<IHidOpen> {
		return this.getHidDeviceConf()
	}

	public changeLayer(layer: number, fn?: () => void) {
		this.selectLayer = layer;
		this.baseCommand.loadKeyMapBuffer().subscribe(() => {
			if (fn) {
				fn()
			}
		})
	}

	public keymapReset() {
		return this.baseCommand.keymapReset();
	}

	private transceiverSub: Subscription;

	public setTransceiver(t: Transceiver) {
		if (this.transceiver && this.transceiverSub) {
			this.transceiver.destroy()
			this.transceiverSub.unsubscribe()
		}
		this.transceiver = t
		this.transceiverSub = this.transceiver.report$
			.subscribe(v => {
				const command = v[0];
				if (this.supportFeature.Upload_Default_Layer &&
					command === EKeyboardCommand.KC_GET_CURRENT_LAYER
				) {
					this.event$.next({
						type: HidDeviceEventType.LayerChange,
						data: v[1]
					})
					this.report$.next(v)
				} else {
					this.report$.next(v)
				}
			});
	}

	public write(buf: Uint8Array): Observable<Result> {
		return this.transceiver.write(0, buf)
	}

	public getLightEffectList(): any {
		if (this.version === 'v3') {
			const menuCode = ['qmk_backlight', 'qmk_backlight_rgblight', 'qmk_rgb_matrix', 'qmk_rgblight']
			let lightMenu: any = {}
			if (this.definition.menus && this.definition.menus.length) {
				this.definition.menus.forEach(i => {
					if (typeof i === 'string' && menuCode.includes(i)) {
						lightMenu = Reflect.get(commonMenus, i)[0]
					} else if (i.label === 'Lighting') {
						lightMenu = i;
					}
				})
			}
			const result: any[] = []
			const generateMenu = (i: any) => {
				const map: any = {'Brightness': 'bright', "Effect": 'effect', 'Effect Speed': 'speed', 'Color': 'color'}
				const effect2Enum = (i: string[]) => i.map((j, i) => {
					if (j === 'string') {
						return {
							label: j,
							value: i
						}
					} else {
						const label = /\d+\./gi.test(j[0]) ? j[0] : `${i}. ${j[0]}`
						return {label, value: j[1]}
					}
				})
				const type = i.type
				return {
					label: i.label.toLowerCase(),
					showIf: i.showIf || true,
					bufferVal: this.lightConf(map[i.label]),
					valKey: i.content[0],
					valType: map[i.label],
					conf: {
						type: type,
						val: type === 'dropdown' ? effect2Enum(i.options) : type === 'range' ? {
							min: i.options[0],
							max: i.options[1]
						} : {}
					}
				}
			};
			(lightMenu.content || []).forEach((i: any) => {
				(i.content || []).forEach((j: any) => {
					result.push(generateMenu(j))
				});
			})

			return result
		} else {
			const {supportedLightingValues} = getLightingDefinition(this.definition?.lighting)
			const effect2Enum = (i: string[]) => i.map((j, i) => {
				return {label: j, value: i}
			})
			const generateVal = (i: any) => {
				const type = i[2].type
				const map: any = {
					'Brightness': "bright",
					'Effect': "effect",
					'Effect Speed': "speed",
					"Color": "color",
					'Underglow Brightness': "uBright",
					'Underglow Effect': "uEffect",
					'Underglow Effect Speed': "uSpeed"
				}
				return {
					showIf: i[3] || true,
					bufferVal: i[0],
					label: i[1].toLowerCase(),
					valType: map[i[1]],
					valKey: i[1],
					conf: {
						type,
						val: type === 'select' ? effect2Enum(i[2].getOptions(this.definition)) : type === 'range' ? {
							min: i[2].min,
							max: i[2].max
						} : {}
					}
				}
			}

			const underglow = UnderglowControls
				.filter(i => supportedLightingValues.includes(i[0]))
				.map(generateVal)
			const backlight = BacklightControls
				.filter(i => supportedLightingValues.includes(i[0]))
				.map(generateVal)
			return [...underglow, ...backlight]
		}
	}


	private detect(): Observable<any> {
		const sleepDetect = () => {
			return new Observable((s) => {
				const cmd = new Sleep_V1(this);
				const sub = cmd.getSleep().subscribe((v) => {
					this.feature.sleep = cmd
					s.next()
					sub.unsubscribe()
				}, () => {
					s.next()
					sub.unsubscribe()
				})
			})
		}
		return new Observable(s => {
			sleepDetect().subscribe(() => {
				s.next()
			})
		})
	}

	protected onGetConf(): Observable<any> {
		return new Observable(s => {
			this.detect().subscribe(() => {
				s.next()
			})
		})
	}

	public supportFeature: ISupportFeature = {
		Get_Default_Layer: false,
		Support_Le: false,
		Support_Rf: false,
		Support_Mock_Key: false,
		Upload_Default_Layer: false
	}

	public getSupportFeat() {
		return this.baseCommand.getSupportFeat()
	}

	private getHidDeviceConf(): Observable<IHidOpen> {
		const hidOpen = {success: true, msg: '', hidDevice: this};
		return new Observable<IHidOpen>(s => {
			const subj = this.loadLayerCount()
				.pipe(
					switchMap(v => this.getSupportFeat()),
					switchMap(v => this.getCurrentLayer(true)),
					switchMap(v => this.monkeyPatch()),
					switchMap(v => this.loadFirmwareVersion()),
					switchMap(v => this.loadKeyMapBuffer()),
					switchMap(() => this.getKeychronProtocolVersion()),
					switchMap(() => this.onGetConf())
				)
				.subscribe(() => {
					this.event$.next({type: HidDeviceEventType.Complete, data: ''})
					this.featureDetect()
					s.next(hidOpen)
					subj.unsubscribe()
				}, err => {
					hidOpen.success = false;
					hidOpen.msg = err
					s.error(hidOpen)
				})
		})
	}

	private loadLayerCount(): Observable<boolean> {
		return this.baseCommand.loadLayerCount();
	}

	private loadFirmwareVersion(): Observable<boolean> {
		return this.baseCommand.loadFirmwareVersion()
	}

	public loadKeyMapBuffer(layer?: number): Observable<Array<IKeyBufferResult>> {
		return this.baseCommand.loadKeyMapBuffer(layer);
	}

	static Buffer = (len = 32) => new Uint8Array(len)

	static BufferGenerate(v: number[]) {
		const buf = BaseKeyboard.Buffer()
		v.forEach((v, i) => buf[i] = v)
		return buf
	}

	static getKeyCover(conf: IKeyConf, jsonBase: any = {}, keycode = '') {
		let u = 'keycap';
		if (conf.w >= 3) u = 'space';
		if (conf.w > 1 && conf.w <= 1.5) u = 'tab';
		if (conf.w > 1.5 && conf.w < 3) u = 'enter';
		if (keycode) u = keycode in KeyCover ? Reflect.get(KeyCover, keycode) : u;
		const s = conf.w2 ? 'en' : u;
		const f = conf.ei !== undefined ? 'rotate' : s;
		return conf.bg ? GLOBAL_CONFIG.STATIC + conf.bg : jsonBase[f] ? GLOBAL_CONFIG.STATIC + jsonBase[f] : `/assets/keyboard/${f}.png`;
	}

	public setLightSpeed(speed: number, valType: any): Observable<Result> {
		return this.baseCommand.setLightSpeed(speed, valType)
	}


	public getLightSpeed(): Observable<number> {
		return this.baseCommand.getLightSpeed()
	}

	public setLightEffect(effect: number, valType: any): Observable<Result> {
		return this.baseCommand.setLightEffect(effect, valType)
	}

	public getLightEffect(): Observable<number> {
		return this.baseCommand.getLightEffect();
	}

	public getLightBrightness(): Observable<number> {
		return this.baseCommand.getLightBrightness();
	}

	public setLightBrightness(brightness: number, valType: any): Observable<Result> {
		return this.baseCommand.setLightBrightness(brightness, valType)
	}

	lightConf(
		e: "bright" | 'effect' | 'speed' | 'color' | "uBright" | 'uEffect' | 'uSpeed'
	) {
		const protocol = this.protocol;
		if (protocol >= 11) {
			return {
				bright: [0x03, 0x01],
				effect: [0x03, 0x02],
				speed: [0x03, 0x03],
				color: [0x03, 0x04],
				uBright: [0x03, 0x01],
				uEffect: [0x03, 0x02],
				uSpeed: [0x03, 0x03],
			}[e]
		} else {
			const {supportedLightingValues} = getLightingDefinition(this.definition?.lighting)
			return {
				bright: [supportedLightingValues[0]],
				effect: [supportedLightingValues[1]],
				speed: [supportedLightingValues[2]],
				color: [supportedLightingValues[3]],
				uBright: [supportedLightingValues[0]],
				uEffect: [supportedLightingValues[1]],
				uSpeed: [supportedLightingValues[2]],
			}[e]
		}
	}


	public setLightRgb(hs: { h: number, s: number }): Observable<Result> {
		return this.baseCommand.setLightRgb(hs);
	}

	public getLightRgb(): Observable<any> {
		return this.baseCommand.getLightRgb();
	}

	public getKeychronProtocolVersion(): Observable<number> {
		return this.baseCommand.getKeychronProtocolVersion();
	}

	public getCurrentLayer(setSelect?: boolean): Observable<number> {
		return this.baseCommand.getCurrentLayer(setSelect);
	}

	public setKeyMap(layer: number, keyConfig: { col: number, row: number, code: number }): Observable<boolean> {
		return this.baseCommand.setKeyMap(layer, keyConfig)
	}

	public exchangeKeys(data: {
		source: IKeyBufferResult,
		target: IKeycode
	}): Observable<Result> {
		return this.baseCommand.exchangeKeys(data)
	}

	public getMacroByte(): Observable<IKeyMacros> {
		return this.baseCommand.getMacroByte();
	}

	public resetMarco() {
		return this.baseCommand.resetMarco()
	}

	public setMacro(data: Array<any>): Observable<Result> {
		return this.baseCommand.setMacro(data)
	}

	public disconnect() {
		this.opened = false;
		this.hidDeviceRaw.close()
	}

	public generateKeysTab() {
		const def = lodash.cloneDeep(this.definition) as IKeyBoardDef
		const defCode = this.definition?.keycodes as string[] ?? []
		const keycodes = ['basic', 'media', 'macro', 'layers', 'special', ...defCode]
		if (def.customKeycodes) {
			keycodes.push('custom');
			def.customKeycodes.push({
				"name": "Qmk Keycodes",
				"code": "Any",
				"keys": "Any",
				"shortName": "Any"
			})
		}
		let menus: any[] = []
		const version = this.protocol >= 11 ? 'v3' : 'v2';
		if (version === 'v3') {
			let light = false;
			if (this.definition.keycodes) {
				light = !!this.definition.keycodes.find(i => i === "qmk_lighting");
			}
			menus = keycodeService.getJson().filter(i => {
				if (i.id === 'qmk_lighting') {
					return !!light
				} else {
					return keycodes.includes(i['id'])
				}
			});
		} else {
			const light = this.definition.lighting
			menus = keycodeService.getJson().filter(i => {
				if (i.id === 'qmk_lighting') {
					return !!light
				} else {
					return keycodes.includes(i['id'])
				}
			});
		}
		if (def.customKeycodes && def.customKeycodes.length) {
			menus.find(i => i.id === 'custom').keycodes = def.customKeycodes.map((c, i) => {
				return {...c, code: `CUSTOM(${i})`}
			})
		}
		menus.push(keycodeService.buildLayerMenu(this.layerCount))
		return menus
	}

	public getKnobVal(knobId: number, direction: EKnobDirection, layer?: number): Observable<{
		keyCode: string,
		keyName: string,
		keyTitle: string,
		keyVal: number
		keyHex: string,
	}> {
		return this.baseCommand.getKnobVal(knobId, direction, layer)
	}

	public setKnobVal(knobId: number, direction: EKnobDirection, key: IKeycode, l?: number): Observable<Result> {
		return this.baseCommand.setKnobVal(knobId, direction, key, l)
	}


	public getKeyboardVal(): Observable<string[][]> {
		return this.baseCommand.getKeyboardVal()
			.pipe(tap((v) => {
				const keys = this.keyBufferResult.filter(k => k.code !== 'KC_NO')
				for (let i = 0; i < keys.length; i++) {
					const {row, col} = keys[i]
					if (v[row][col] === '1') {
						this.sendKey({...keys[i], length: keys.length})
					}
				}
			}))
	}

	public sendKey(data: any) {
		this.event$.next({type: HidDeviceEventType.matrix, data})
	}

	public getDeviceId(): Observable<any> {
		return new Observable<any>(s => {
			const buf = BaseKeyboard.Buffer(31)
			buf[0] = 0xab;
			buf[1] = 0x09;
			buf[30] = 0x09;
			const sub = this.report$
				.pipe(
					filter(v => v[0] === 0xab),
					timeout(500)
				).subscribe({
					next: d => {
						const length = d[2];
						const data = d.slice(3, 3 + length)

						let id = '';
						data.forEach(i => {
							id += ByteUtil.oct2Hex(i, 2, '');
						})

						s.next(id)

						sub.unsubscribe()
					}, error: err => {
						this.transceiver.setNext()
						sub.unsubscribe()
					}
				})

			this.write(buf).subscribe()
		})
	}

	private featureDetect() {
		this.rgbDetect()
		this.mixRgbDetect()
	}

	private rgbDetect() {
		const buf = BaseKeyboard.Buffer()
		buf[0] = EKeyboardCommand.KC_RGB;
		buf[1] = 0x1;
		const sub = this.report$
			.pipe(
				filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === 0x1),
				map(v => ByteUtil.byteToNum([v[4], v[3]])),
				timeout(500)
			)
			.subscribe(v => {
				if (v === 1) this.feature.rgb = new RGB_V1(this)
				sub.unsubscribe()
			}, err => {
				this.transceiver.setNext()
				sub.unsubscribe()
			})
		this.write(buf).subscribe()
	}

	private mixRgbDetect() {
		const buf = BaseKeyboard.Buffer()
		buf[0] = EKeyboardCommand.KC_RGB;
		buf[1] = 0x1;
		const sub = this.report$
			.pipe(
				filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === 0x1),
				map(v => ByteUtil.byteToNum([v[2], v[3]])),
				timeout(500)
			)
			.subscribe(v => {
				if (v === 1) this.feature.mixRgb = new MixRgbV1(this)
				sub.unsubscribe()
			}, () => {
				sub.unsubscribe()
			})
		this.write(buf).subscribe()
	}
}
