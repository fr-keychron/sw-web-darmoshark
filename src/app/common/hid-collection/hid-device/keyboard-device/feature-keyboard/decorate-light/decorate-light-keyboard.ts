import {BaseKeyboard} from "../../base-keyboard";
import {IDecorateLightCommand} from "./command/type";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {IKeyBoardDef} from "../../../../../../model";
import {DecorateLightCommandV1} from "./command/DecorateLightCommandV1";

export class DecorateLightKeyboard extends BaseKeyboard implements IDecorateLightCommand {

	static override build(
		s: any,
		i18n: TranslateService,
		protocol: number,
		destination: IKeyBoardDef
	) {
		return new DecorateLightKeyboard(s, i18n, protocol, destination)
	}

	constructor(
		s: any,
		i18n: TranslateService,
		protocol: number,
		destination: IKeyBoardDef
	) {
		super(s, i18n, protocol, destination);
	}

	private command: IDecorateLightCommand

	protected override onGetConf(): Observable<any> {
		return new Observable<any>(s => {
			this.command = new DecorateLightCommandV1(this)
			s.next()
		})
	}

	getBrightness(): Observable<number> {
		return this.command.getBrightness()
	}

	getColor(): Observable<number> {
		return this.command.getColor()
	}

	getEffect(): Observable<number> {
		return this.command.getEffect()
	}

	setBrightness(v: number): Observable<any> {
		return this.command.setBrightness(v)
	}

}
