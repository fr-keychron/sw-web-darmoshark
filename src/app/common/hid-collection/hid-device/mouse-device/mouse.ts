import {TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {Observable, Subject, Subscription} from "rxjs";
import {
	EMouseBtn,
	EMacroLoopKey,
	EMouseBtnDpiKey,
	EMouseBtnGameKey,
	EMouseBtnMediaKey,
	EMouseBtnActionKey,
	EMousseBtnShortcutKey
} from "./enum";
import {IBaseInfo, IMouseJson} from "./types";
import {Transceiver} from "../../transceiver/transceiver";
import {EDeviceConnectState} from "../../enum";
import {IHidDeviceEvent} from "../keyboard-device";

export abstract class Mouse {
	id: number
	name: string
	version: number | string
	workMode: number
	pid: string
	vid: string
	i18n: TranslateService
	http: HttpClient
	hidRaw: any
	opened = false
	protocolVersion: number
	loaded = false
	state: EDeviceConnectState = EDeviceConnectState.USB
	profileCount: number = 5
	profile: number

	report$: Subject<Uint8Array> = new Subject<Uint8Array>()
	update$: Subject<any> = new Subject<any>()
	event$: Subject<IHidDeviceEvent> = new Subject<IHidDeviceEvent>()
	
	json: IMouseJson
	baseInfo: IBaseInfo
	transceiver: Transceiver
	commands: any
	transceiverSub: Subscription;
	firmware = {
		receiverName: '',
		receiver: '',
		mouse: '',
		workMode: -1
	}

	productInfo: any
	lightInfo: number[] | Uint8Array

	abstract open(): Observable<any>

	abstract getReceiverState(): Observable<{ state: number, vid: string, pid: string, vpId: number }>

	abstract getProtocolVersion(): Observable<{ version: number, workMode: number }>

	abstract getDeviceDesc(): Observable<any>

	abstract getBaseInfo(): Observable<IBaseInfo>

	abstract handleUpdate(buf: Uint8Array): Observable<any>

	abstract switchProfile(v: number): Observable<any>

	abstract recovery(opt: {profile?:number, options?: any, value?:number}): Observable<any>

	abstract setDpi(data: { current: number, level: number, values: number[], }): Observable<any>

	abstract setReportRate(data: { level: number, values: number[] }): Observable<any>

	abstract getMouseBtnInfo(btn: number): Observable<any>

	abstract setMouseBtn(action: EMouseBtn, mouseKey: number, buffer: number[]): Observable<any>

	abstract setMouseBtn2Media(mouseKey: number, e: EMouseBtnMediaKey): Observable<any>

	abstract removeMouseBtn(mouseKey: number): Observable<any>

	abstract disableMouseBtn(mouseKey: number): Observable<any>

	abstract setMouseBtn2Action(mouseKey: number, e: EMouseBtnActionKey): Observable<any>

	abstract setMouseBtn2KeyBoard(mouseKey: number, shiftKey: number, keycodes: number[]): Observable<any>

	abstract setMouseBtn2Dpi(mouseKey: number, dpi: EMouseBtnDpiKey): Observable<any>

	abstract setMouseBtn2Game(
		mouseKey: number,
		data: {
			type: EMouseBtnGameKey,
			keycode: number,
			speed: number,
			count: number
		}
	): Observable<any>

	abstract setMouseBtn2ShortCut(
		mouseKey: number,
		shortCut: EMousseBtnShortcutKey
	): Observable<any>

	abstract setMacro(data: {
		mouseKey: number,
		loopType: EMacroLoopKey,
		loopCount?: number,
		macro: Array<number[]>,
		delay: number
	}): Observable<any>

	abstract getMacro(key: number): Observable<any>

	abstract sendLongData(bytes: number[]): Observable<any>

	abstract resetToFactory(val: number): Observable<any>

	abstract setDebounce(v: number): Observable<any>

	abstract setExtConf(data: {
		lod: number, wave: number, line: number, motion: number, scroll: number,
	}, stop?: boolean): Observable<any>

	abstract sendUpdateRequest(file: File): Observable<any>

}
