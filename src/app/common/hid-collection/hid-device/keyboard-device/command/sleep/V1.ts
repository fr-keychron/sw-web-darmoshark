import {ISleep, ISleepConf} from "./type";
import {filter, map, Observable} from "rxjs";
import {BaseKeyboard} from "../../base-keyboard";
import {EKeyboardCommand} from "../../../../../../model";
import {timeout} from "rxjs/operators";
import {By} from "@angular/platform-browser";
import {ByteUtil} from "../../../../../../utils";

enum Command {
	Get_Sleep = 0x08,
	Set_Sleep = 0x09
}

export class Sleep_V1 implements ISleep {
	public backlight: number;
	public sleep: number;

	private keyboard: BaseKeyboard

	constructor(k: BaseKeyboard) {
		this.keyboard = k
	}

	public getSleep(): Observable<ISleepConf> {
		return new Observable<ISleepConf>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_OTHER_SETTING_VERSION;
			buf[1] = Command.Get_Sleep;
			this.keyboard.report$
				.pipe(
					timeout(2000),
					filter(v => v[0] === EKeyboardCommand.KC_OTHER_SETTING_VERSION && v[1] === Command.Get_Sleep),
					map(v => {
						return {
							backlight: (v[4] << 8) | v[3],
							sleep: (v[6] << 8) | v[5]
						}
					})
				)
				.subscribe(v => {
					this.backlight = v.backlight;
					this.sleep = v.sleep
					console.log(v);
					s.next(v)
				}, err => {
					s.error({backlight: 0, sleep: 0})
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public setSleep(d: ISleepConf): Observable<void> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_OTHER_SETTING_VERSION
			buf[1] = Command.Set_Sleep;

			const b = ByteUtil.numToHighLow(d.backlight)
			buf[2] = b[0]
			buf[3] = b[1];

			const sleep = ByteUtil.numToHighLow(d.sleep)
			buf[4] = sleep[0]
			buf[5] = sleep[1]
			this.keyboard.write(buf).subscribe( () => {
				s.next()
			})
		})
	}

}
