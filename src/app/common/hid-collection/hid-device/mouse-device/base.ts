import {TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {
	EDmsMousseBtnLightKey,
	EMacroLoopKey,
	EMouseBtn,
	EMouseBtnActionKey,
	EMouseBtnDpiKey,
	EMouseBtnGameKey,
	EMouseBtnMediaKey,
	EMousseBtnShortcutKey
} from "./enum";
import {Result} from "src/app/model";
import {IBaseInfo, IMouseJson, Light, MouseBase} from "./types";
import {ByteUtil, ConsoleUtil} from "src/app/utils";
import {GLOBAL_CONFIG} from "src/app/config";
import {Transceiver} from "../../transceiver/transceiver";
import {FeatureTransceiver, ParallelTransceiver, RecverTransceiver} from "../../transceiver";
import {HidDeviceEventType} from "../keyboard-device";
import {versionFactory} from './command'
import {Mouse} from './mouse'

export class MouseDevice extends Mouse {
	constructor({product, json, hid, i18n, http, transceiver}: MouseBase) {
		super();
		this.hidRaw = hid
		this.i18n = i18n
		this.http = http
		this.name = hid.productName || json.name
		this.version = product.version
		this.workMode = product.workMode || 0
		this.pid = ByteUtil.oct2Hex(hid.productId)
		this.vid = ByteUtil.oct2Hex(hid.vendorId)
		this.id = MouseDevice.vendorProductId(hid.vendorId, hid.productId)
		
		this.productInfo = product
		this.opened = hid.opened;
		this.setTransceiver(transceiver ? transceiver : new ParallelTransceiver(hid))
		this.commands = versionFactory.get(this.version, this)
		
		if(json){
			this.json = json
		} else {
			this.loadJson().subscribe()
		}
	}
	static Buffer = (len = 32) => new Uint8Array(len)
	static vendorProductId(vendorId: number, productId: number) {
		return vendorId * 65536 + productId;
	}

	loadJson() {
		return new Observable(s => {
			const host = GLOBAL_CONFIG.API + `mouse/${this.id}.json`
			this.http.get(host)
				.subscribe({next: (r: any) => {
					this.json = r as IMouseJson
					this.name = r.name;
					s.next()
				}, error: err => {
					this.event$.next({type: HidDeviceEventType.JsonConfLoadError, data: ''})
					ConsoleUtil.colorfulLog(`load json conf fail`)
					s.error(this.i18n.instant('notify.hidConfNotFound'))
				}})
		})
	}

	setTransceiver(t: Transceiver) {
		if (this.transceiver && this.transceiverSub) {
			this.transceiver.destroy()
			this.transceiverSub.unsubscribe()
		}
		this.transceiver = t;
		this.transceiver.report$.subscribe(v => {
			this.handleUpdate(v).subscribe((r: boolean) =>{
				if(!r){
					this.report$.next(v)
				}
			})
		})
	}

	disconnect() {
		this.opened = false;
		this.hidRaw.close()
	}

	open(): Observable<any> {
		return this.commands.open()
	}

	getReceiverState(): Observable<{
		state: number,
		vid: string,
		pid: string,
		vpId: number
	}> {
		return this.commands.getReceiverState()
	}

	getProtocolVersion(): Observable<{ version: number, workMode: number }> {
		return this.commands.getProtocolVersion()
	}

	getDeviceDesc() {
		return this.commands.getDeviceDesc()
	}

	getBaseInfo(): Observable<IBaseInfo> {
		return this.commands.getBaseInfo()
	}

	handleUpdate(buf: Uint8Array) {
		return this.commands.handleUpdate(buf)
	}

	switchProfile(v: number): Observable<any> {
		this.profile = v
		return this.commands.switchProfile(v)
	}

	recovery(opt: {profile?:number, tagVal?: any, value?:number}) {
		return this.commands.recovery(opt)
	}

	setDpi(data: {
		current: number,
		level: number,
		gears: number,
		values: number[],
	}): Observable<any> {
		return this.commands.setDpi(data)
	}

	setReportRate(data: {
		level: number,
		values: number[]
	}): Observable<any> {
		return this.commands.setReportRate(data)
	}

	getMouseBtnInfo(btn: number): Observable<any> {
		return this.commands.getMouseBtnInfo(btn)
	}

	setMouseBtn(
		action: EMouseBtn, mouseKey: number, buffer: number[] = []
	): Observable<any> {
		return this.commands.setMouseBtn(action,mouseKey,buffer)
	}

	public setMouseBtn2Media(mouseKey: number, e: EMouseBtnMediaKey): Observable<any> {
		return this.setMouseBtn(
			EMouseBtn.Media,
			mouseKey,
			this.version === 4 ? ByteUtil.numToHighLow(e, 4, 8, "HighToLow") : ByteUtil.numToHighLow(e)
		)
	}

	public removeMouseBtn(mouseKey: number): Observable<any> {
		return this.setMouseBtn(EMouseBtn.remove, mouseKey)
	}

	public disableMouseBtn(mouseKey: number) {
		return this.setMouseBtn(EMouseBtn.disable, mouseKey)
	}

	public setMouseBtn2Action(mouseKey: number, e: EMouseBtnActionKey): Observable<any> {
		return this.setMouseBtn(
			EMouseBtn.Mouse,
			mouseKey,
			this.version === 4 ? ByteUtil.numToHighLow(e, 4, 8, "HighToLow") : ByteUtil.numToHighLow(e, 3, 8, "HighToLow")
		)
	}

	public setMouseBtn2KeyBoard(
		mouseKey: number,
		shiftKey: number,
		keycodes: number[]
	): Observable<any> {
		return this.setMouseBtn(
			EMouseBtn.Keyboard,
			mouseKey,
			this.version === 4 ? [0 ,shiftKey, keycodes[0], 0]: [shiftKey, ...keycodes]
		)
	}

	public setMouseBtn2Dpi(mouseKey: number, dpi: EMouseBtnDpiKey): Observable<any> {
		return this.setMouseBtn(
			EMouseBtn.Dpi,
			mouseKey,
			this.version === 4 ? ByteUtil.numToHighLow(dpi, 4, 8, "HighToLow") : [dpi]
		)
	}

	public setMouseBtn2Game(
		mouseKey: number,
		data: {
			type: EMouseBtnGameKey,
			keycode: number,
			speed: number,
			count: number
		}
	): Observable<any> {
		const type = data.type === 1 
		? 0x10 + Math.floor(data.count / 255)
		: 0x30 + Math.floor(data.count / 255)
		const count = data.count > 255 ? 255 : Number(data.count) 
		return this.setMouseBtn(
			EMouseBtn.GameReinforce,
			mouseKey,
			this.version === 4 ? 
			[	type,
				data.keycode,
				count,
				data.speed,
			] : [
				data.type,
				data.keycode,
				...ByteUtil.numToHighLow(data.speed),
				...ByteUtil.numToHighLow(data.count)
			]
		)
	}

	public setMouseBtn2ShortCut(
		mouseKey: number,
		shortCut: EMousseBtnShortcutKey
	): Observable<any> {
		console.log(shortCut);
		
		return this.setMouseBtn(
			EMouseBtn.ShortCut,
			mouseKey,
			this.version === 4 ? ByteUtil.numberToArray(shortCut) : ByteUtil.numToHighLow(shortCut, 3, 8, "HighToLow")
		)
	}

	setMacro(data: {
		mouseKey: number,
		loopType: EMacroLoopKey,
		loopCount?: number,
		macro: Array<number[]>,
		delay: number
	}): Observable<any> {
		return this.commands.setMacro(data)
	}

	getMacro(key: number): Observable<any> {
		return this.commands.getMacro(key)
	}

	sendLongData(bytes: number[]): Observable<any> {
		return this.commands.sendLongData(bytes)
	}

	resetToFactory(val: number) {
		return this.commands.resetToFactory(val)
	}

	setDebounce(v: number, i?:number) {
		return this.commands.setDebounce(v, i)
	}

	// 灯光
	getLight(){
		return this.commands.getLight()
	}

	setLight(data: Light){
		return this.commands.setLight(data)
	}

	setExtConf(data: {
		lod: number, wave: number, line: number, motion: number, scroll: number,eSports?: number
	}, stop?: boolean) {
		return this.commands.setExtConf(data, stop)
	}

	write(reportId: number, buf: Uint8Array, cb?: any): Observable<Result> {
		return this.transceiver.write(reportId, buf, cb)
	}

	setScroll(speed: number, inertia: number, spl: number) {
		return this.commands.setScroll(speed, inertia, spl)
	}
	setBtnTime(data: {btnRespondTime: number, sleepTime: number}) {
		return this.commands.setBtnTime(data)
	}
	public setMouseBtn2Light(mouseKey: number, light: EDmsMousseBtnLightKey): Observable<any> {
		return this.setMouseBtn(
			EMouseBtn.Light,
			mouseKey,
			ByteUtil.numToHighLow(light, 4, 8, "HighToLow")
		)
	}
}

export class handleMouseKey {
	mouseKey: number = null;

	setMouseKey = (i: number) => {
		this.mouseKey = i
	}
	getMouseKey = () => {
		return this.mouseKey
	}
}
