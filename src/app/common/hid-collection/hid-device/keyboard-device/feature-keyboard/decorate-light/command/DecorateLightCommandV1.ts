import {IDecorateLightCommand} from "./type";
import {filter, map, Observable} from "rxjs";
import {DecorateLightKeyboard} from "../decorate-light-keyboard";
import {BaseKeyboard} from "../../../base-keyboard";
import {EKeyboardCommand} from "../../../../../../../model";
import {tap} from "rxjs/operators";

enum ECommand {
	Brightness = 0x01,
	Effect = 0x02,
	Color = 0x04
}

export class DecorateLightCommandV1 implements IDecorateLightCommand {

	private keyboard: DecorateLightKeyboard;

	constructor(d: DecorateLightKeyboard) {
		this.keyboard = d
	}

	setBrightness(v: number): Observable<any> {
		return new Observable<number>(s => {
			const buf = BaseKeyboard.Buffer();
			buf[0] = EKeyboardCommand.BACKLIGHT_CONFIG_SET_VALUE
			buf[1] = 0x06
			buf[2] = ECommand.Brightness
			buf[3] = v
			console.log(buf)
			this.keyboard.write(buf).subscribe()
		})
    }


	getBrightness(): Observable<number> {
		return new Observable<number>(s => {
			const buf = BaseKeyboard.Buffer();
			buf[0] = EKeyboardCommand.BACKLIGHT_CONFIG_GET_VALUE
			buf[1] = 0x06
			buf[2] = ECommand.Brightness
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.BACKLIGHT_CONFIG_GET_VALUE
						&& v[1] === 0x06 && v[2] === ECommand.Brightness
					),
					map(v => v[3])
				)
				.subscribe(v => {
					s.next(v)
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	getColor(): Observable<number> {
		return undefined;
	}

	getEffect(): Observable<number> {
		return undefined;
	}
}
