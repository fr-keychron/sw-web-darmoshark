import {concatMap, filter, map, Observable, timeout} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {EKeyboardCommand, IKeyBoardDef} from "src/app/model";
import {BaseKeyboard} from "../../base-keyboard";

export enum EDebounceVersion {
	null,
	old = 1,
	new = 2,
	QMK
}

export enum EDebounceType {
	TeLink = 1,
	Qmk
}

export class DebounceKeyboard extends BaseKeyboard {

	static override build(
		s: any,
		i18n: TranslateService,
		protocol: number,
		destination: IKeyBoardDef
	) {
		return new DebounceKeyboard(s, i18n, protocol, destination)
	}

	public debounce = {
		scan: 0,
		release: 0,
		press: 0
	}

	constructor(
		s: any,
		i18n: TranslateService,
		protocol: number,
		destination: IKeyBoardDef
	) {
		super(s, i18n, protocol, destination)
	}

	public setDebounceTime(data: { scan: number, release: number, press: number, subType: number }) {
		if (this.debounceVersion === EDebounceVersion.old) {
			const buf = BaseKeyboard.Buffer()
			buf[0] = 0xB0
			buf[1] = data.scan
			buf[2] = data.press
			buf[3] = data.release;

			this.write(buf).subscribe()
		}

		if (this.debounceVersion === EDebounceVersion.new) {
			const buf: Uint8Array = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_DEBOUNCE;
			buf[1] = 0x80
			buf[2] = 1
			buf[3] = data.subType
			buf[4] = data.press
			buf[5] = data.release
			this.write(buf).subscribe()
		}

		if (this.debounceVersion === EDebounceVersion.QMK) {
			const buf: Uint8Array = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_DEBOUNCE;
			buf[1] = 0x03
			buf[2] = data.subType
			buf[3] = data.press
			this.write(buf).subscribe()
		}
	}


	protected override onGetConf(): Observable<any> {
		return this.getDebounceTime()
			.pipe(concatMap(v => this.getDebounceByNewVersion()))
	}

	public debounceVersion: EDebounceVersion = EDebounceVersion.null

	public getDebounceTime(): Observable<any> {
		return this.getDebounceByOldVersion()
			.pipe(concatMap(v => this.getDebounceByNewVersion()))
	}

	public debounceNewVersionConf: { type: EDebounceType, data: { subType: number } } = null

	private getDebounceByNewVersion(): Observable<any> {
		return new Observable(s => {
			if (this.debounceVersion !== EDebounceVersion.null) return s.next(this.debounce);
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_DEBOUNCE;
			if (this.instruction_set === 2) buf[1] = 0x02
			const subj = this.report$
				.pipe(
					filter(i => i[0] === EKeyboardCommand.KC_DEBOUNCE ),
					map(v => {
						const data = {
							type: EDebounceType.TeLink,
							subType: v[3],
							press: v[4],
							release: v[5]
						}
						if (this.instruction_set === 2) {
							data.type = EDebounceType.Qmk;
							data.subType = v[3]
							data.press = v[4]
						}
						return data
					}),
					timeout(500)
				)
				.subscribe(v => {
					this.debounceNewVersionConf = {
						type: v.type,
						data: {
							subType: v.subType
						}
					}
					this.debounceVersion = EDebounceVersion.new
					if (this.instruction_set === 2) this.debounceVersion = EDebounceVersion.QMK
					this.debounce = {
						scan: 0,
						press: v.press,
						release: v.release
					}
					s.next(this.debounce)
				}, () => {
					s.next({
						scan: 0,
						press: 0,
						release: 0
					})
					this.transceiver.setNext()
					subj.unsubscribe()
				})
			this.write(buf).subscribe()
		})
	}

	private getDebounceByOldVersion(): Observable<any> {
		return new Observable<any>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = 0xb1
			const subj = this.report$.pipe(
				filter(i => i[0] === 0xB1),
				map(v => {
					return {
						scan: v[1],
						press: v[2],
						release: v[3]
					}
				}),
				timeout(300)
			).subscribe(v => {
				this.debounce = v;
				this.debounceVersion = EDebounceVersion.old
				s.next(v)
				subj.unsubscribe()
			}, () => {
				s.next({
					scan: 0,
					press: 0,
					release: 0
				})
				this.transceiver.setNext()
				subj.unsubscribe()
			})
			this.write(buf).subscribe()
		})
	}
}
