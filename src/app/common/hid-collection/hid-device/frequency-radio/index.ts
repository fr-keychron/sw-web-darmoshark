import {concatMap, Observable, Subject} from "rxjs";
import {EKeyboardCommand, Result} from "src/app/model";
import {TranslateService} from "@ngx-translate/core";
import {EFrCommand} from "src/app/model/enum/frCommand";
import {filter, map, timeout} from "rxjs/operators";
import {ByteUtil} from "src/app/utils";

export enum FrEventType {
	Ready,
	Error
}

export interface IFrEvent {
	type: FrEventType,
	data: any
}

export class FrequencyRadio {
	private hid: any;
	public protocolVersion: any;
	public report$: Subject<Uint8Array> = new Subject<Uint8Array>()
	public event$: Subject<IFrEvent> = new Subject<IFrEvent>()
	public viaVersion: number;
	private i18n: TranslateService
	public connectDevice: { vid: number, pid: number, connect: boolean } = {vid: null, pid: null, connect: false}

	constructor(
		hid: any,
		i18n: TranslateService,
	) {
		this.hid = hid;
		this.i18n = i18n;
		this.hid.addEventListener("inputreport", (event: any) => this.handleEvent(event.data))
		this.init().subscribe()
	}

	private handleEvent(buf: DataView) {
		const uint8Arr = new Uint8Array(buf.buffer, 0, buf.byteLength);
		const uid = 0 << 16 | uint8Arr[0] << 8 << 0
		this.report$.next(uint8Arr)
		return uid.toString()
	}

	public write(buf: Uint8Array): Observable<Result> {
		return new Observable<Result>(s => {
			const result = Result.build();
			const task = new Observable(s => {
				this.hid.sendReport(0, buf)
					.then((r: any) => {
						s.next(result.succeed())
					})
					.catch((e: any) => {
						s.error(result.error(this.i18n.instant('notify.unknownErr')))
					})
			})
			task.subscribe((r: any) => s.next(r))
		})
	}

	public getProtocolVersion(): Observable<number> {
		return new Observable<number>(s => {
			const buf = new Uint8Array(32);
			buf[0] = EFrCommand.FR_GET_PROTOCOL_VERSION;
			const sub = this.report$
				.pipe(
					filter(v => v[0] === EFrCommand.FR_GET_PROTOCOL_VERSION),
					map(v => ByteUtil.byteToNum([v[2], v[1]]))
				)
				.subscribe(r => {
					this.protocolVersion = r;
					sub.unsubscribe()
					s.next(r)
				})
			this.write(buf).subscribe()
		})
	}

	public getState(): Observable<any> {
		return new Observable(s => {
			const buf = new Uint8Array(32);
			buf[0] = EFrCommand.FR_GET_STATE;
			this.report$
				.pipe(
					filter(v => v[0] === EFrCommand.FR_GET_STATE),
					map(v => {
						const vid = ByteUtil.byteToNum([v[3], v[2]])
						const pid = ByteUtil.byteToNum([v[5], v[4]])
						const connect = v[6] === 1
						return {vid, pid, connect}
					})
				)
				.subscribe(r => {
					this.connectDevice = r;
					s.next(r)
				})
			this.write(buf).subscribe()
		})
	}

	private getViaVersion() {
		return new Observable(s => {
			if( this.connectDevice.connect ) {
				const buf = new Uint8Array(32)
				buf[0] = EKeyboardCommand.GET_PROTOCOL_VERSION
				const sub = this.report$
					.pipe(
						filter(v => v[0] === EKeyboardCommand.GET_PROTOCOL_VERSION),
						map(v => v[2]),
						timeout(2500)
					)
					.subscribe(v => {
						this.viaVersion = v;
						s.next(v)
						sub.unsubscribe()
					}, () => {
						s.error(this.i18n.instant('notify.keyboard_not_support_wireless'))
						sub.unsubscribe()
					})
				this.write(buf).subscribe()
			} else {
				s.error(this.i18n.instant('notify.fr_not_connect'))
			}

		})
	}

	public fwVersion: string;

	private getFirmwareVersion() {
		return new Observable(s => {
			const buf = new Uint8Array(32)
			buf[0] = EFrCommand.FR_GET_FW_VERSION;
			const sub = this.report$
				.pipe(
					filter(v => v[0] === EFrCommand.FR_GET_FW_VERSION),
					map(v => {
						const filteredArray = v.slice(1).filter(byte => byte !== 0);
						return String.fromCharCode(...filteredArray);
					})
				)
				.subscribe(v => {
					this.fwVersion = v;
					s.next()
					sub.unsubscribe()
				})
			this.write(buf).subscribe()
		})
	}

	private init() {
		return new Observable(s => {
			this.getProtocolVersion()
				.pipe(
					concatMap(() => this.getState()),
					concatMap(() => this.getFirmwareVersion()),
					concatMap(() => this.getViaVersion()),
				)
				.subscribe(v => {
					s.next(v)
					this.event$.next({type: FrEventType.Ready, data: this})
				}, e => {
					this.event$.next({type: FrEventType.Error, data: e})
				})
		})
	}
}
