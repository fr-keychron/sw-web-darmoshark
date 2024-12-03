import {TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {
	EDmsMacroLoopKey
} from "./enum";
import {Result} from "src/app/model";
import {IBaseInfo, IMouseJson} from "./types";
import {ByteUtil, ConsoleUtil} from "src/app/utils";
import {GLOBAL_CONFIG} from "src/app/config";
import {Transceiver} from "../../transceiver/transceiver";
import {ParallelTransceiver} from "../../transceiver";
import {HidDeviceEventType} from "../keyboard-device";
import { versionFactory as commandVersionFactory } from './command';
import { versionFactory as rgbVersionFactory } from './feature-mouse/rgb';
import {Mouse} from './mouse'

export class MouseDevice extends Mouse {
	constructor(
		prot: {version: number | string, workMode?: number},
		s: any,
		i18n: TranslateService,
		http: HttpClient
	) {
		super();
		this.version = prot.version
		this.workMode = prot.workMode
		this.hidRaw = s
		this.i18n = i18n
		this.http = http
		this.pid = ByteUtil.oct2Hex(s.productId)
		this.vid = ByteUtil.oct2Hex(s.vendorId)
		this.id = MouseDevice.vendorProductId(s.vendorId, s.productId)
		this.receiverId = MouseDevice.vendorProductId(s.vendorId, s.productId)
		this.opened = s.opened;
		this.i18n = i18n
		this.name = s.productName
		this.setTransceiver(new ParallelTransceiver(s))
		this.commands = commandVersionFactory.get(prot.version, this)
		this.rgbCommands = rgbVersionFactory.get(prot.version, this)
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
			this.report$.next(v)
			// this.handleUpdate(v).subscribe((r: boolean) =>{
			// 	if(!r){
			// 		this.report$.next(v)
			// 	}
			// })
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

	getBaseInfo(): Observable<IBaseInfo> {
		return this.commands.getBaseInfo()
	}

	getBaseInfoDpi(): Observable<IBaseInfo> {
		return this.commands.getBaseInfoDpi()
	}

	recovery(opt: {profile?:number, options?: any, value:number}) {
		return this.commands.recovery(opt)
	}

	setMouseMacro(mouseKey: number): Observable<any> {
		return this.commands.setMouseMacro(mouseKey);
	}
	
	setDpi(data: {
		current: number,
		level: number,
		values: number[],
	}): Observable<any> {
		return this.commands.setDpi(data)
	}

	setDpiLevel(current: number): Observable<any> {
		return this.commands.setDpiLevel(current)
	}

	setReportRate(data: {
		level: number,
		values: number[]
	}): Observable<any> {
		return this.commands.setReportRate(data)
	}
	
	getMouseBtnsInfo(length: number): Observable<any> {
		return this.commands.getMouseBtnsInfo(length)
	}

	setMouseBtn2KeyBoard(
		mouseKey: number,
		shiftKey: number,
		keycodes: number[]
	): Observable<any> {
		return  this.commands.setMouseBtn2KeyBoard(
			mouseKey,
			shiftKey,
			keycodes
		)
	}

	setMouseBtnGame(
		mouseKey: number, buffer: number[] = []
	): Observable<any> {
		return this.commands.setMouseBtnGame(mouseKey,buffer)
	}

	resetToDpi(array:number[]): Observable<any> {
		return this.commands.resetToDpi(array)
	}

	getLight(){
		return this.commands.getLight()
	}

	setLight(data: {type: number, brightness: number, speed: number, r: number, g: number, b: number}){
		return this.commands.setLight(data)
	}

	setLevelCount(levelCount:number){
		return this.commands.setLevelCount(levelCount)
	}

	switchConfig(index:number){
		return this.commands.switchConfig(index)
	}

	public setMouseBtn(mouseKey: number, e: any): Observable<any> {
		const buf = ByteUtil.numberToArray(e)
		return this.commands.setMouseBtn(mouseKey,buf)
	}

	public setMouseBtn2Game(
		mouseKey: number,
		data: {
			type: number,
			keycode: number,
			speed: number,
			count: number
		}
	): Observable<any> {
		return this.setMouseBtnGame(
			mouseKey,
			[
				data.type & 0xff,
				data.keycode & 0xff,
				data.count & 0xff,
				data.speed & 0xff
			]
		)
	}

	setMacro(data: {
		mouseKey: number,
		loopType: EDmsMacroLoopKey,
		loopCount?: number,
		macro: Array<number[]>,
		delay: number
	}): Observable<any> {
		return this.commands.setMacro(data)
	}

	setExtConf(data: {
		lod: number,
		wave: number, 
		line: number, 
		motion: number, 
		scroll: number,
		eSports: number,
	}, stop?: boolean) {
		return this.commands.setExtConf(data, stop)
	}
	setBtnTime(data: {
		btnRespondTime: number,
		sleepTime:number
	}) {
		return this.commands.setBtnTime(data)
	}

	write(reportId: number, buf: Uint8Array , cb?: any): Observable<Result> {
		return this.transceiver.write(reportId, buf, cb)
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