import {Observable} from "rxjs";
import {IProfileBuffer} from "../../types";
import {TranslateService} from "@ngx-translate/core";
import {EHECommand, EHeWorkMode, EKeyboardCommand, IKeyBoardDef, Result} from "src/app/model";
import {BaseKeyboard} from "../../base-keyboard";
import {IHeCommand} from "./command/type";
import {filter, map, timeout} from "rxjs/operators";
import {HECommandV1} from "./command/v1";
import {HECommandV2} from "./command/v2";
import {HECommandV3} from "./command/v3";
import {HECommandV4} from "./command/v4";

export class HeKeyBoard extends BaseKeyboard implements IHeCommand {
	private command: IHeCommand;

	static override build(
		s: any,
		i18n: TranslateService,
		protocol: number,
		destination: IKeyBoardDef
	) {
		return new HeKeyBoard(s, i18n, protocol, destination)
	}

	constructor(
		s: any,
		i18n: TranslateService,
		protocol: number,
		destination: IKeyBoardDef
	) {
		super(s, i18n, protocol, destination)
	}

	public heVersion: number;


	protected override onGetConf(): Observable<any> {
		return new Observable<any>(s => {
			this.getHeVersion().subscribe((v) => {
				if (v === 1) this.command = new HECommandV1(this)
				if (v === 2) this.command = new HECommandV2(this)
				if (v === 3) this.command = new HECommandV3(this)
				if (v === 4) this.command = new HECommandV4(this)
				s.next()
			})
		})
	}

	public getHeVersion(): Observable<number> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE
			buf[1] = EHECommand.AMC_GET_VERSION;
			const subj = this.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_GET_VERSION),
					map(v => v[2]),
					timeout(1000)
				)
				.subscribe(v => {
					this.heVersion = v;
					s.next(v)
					subj.unsubscribe()
				}, err => {
					this.heVersion = -1;
					subj.unsubscribe()
					s.next(-1)
				})
			this.write(buf).subscribe()
		})
	}

	public calibration(): Observable<Result> {
		return this.command.calibration();
	}

	public calibrationStop(): Observable<any> {
		return this.command.calibrationStop()
	}

	public changeProfile(profile: number): void {
		return this.command.changeProfile(profile)
	}

	public changeProfileName(buffer: number[], length: number, idx: number): Observable<Result> {
		return this.command.changeProfileName(buffer, length, idx);
	}

	public clearProfile(): Observable<any> {
		return this.command.clearProfile();
	}

	public enableJoyKeyboard(enable: number, xbox: number): Observable<Result> {
		return this.command.enableJoyKeyboard(enable, xbox);
	}

	public getCalibration(): Observable<Result> {
		return this.command.getCalibration();
	}

	public getCurve(): Observable<number[][]> {
		return this.command.getCurve();
	}

	public getKeyDistance(row: number, col: number): Observable<{ distance: number, row?: number, col?: number }> {
		return this.command.getKeyDistance(row, col);
	}

	public getProfileBuffer(): Observable<IProfileBuffer> {
		return this.command.getProfileBuffer();
	}

	public getProfileInfo(): Observable<{ current: number; total: number; size: number; names: string[] }> {
		return this.command.getProfileInfo();
	}

	public removeDks(row: number, col: number): Observable<null> {
		return this.command.removeDks(row, col);
	}

	public saveProfile(): Observable<Result> {
		return this.command.saveProfile();
	}

	public setCurve(c: number[][]): Observable<Result> {
		return this.command.setCurve(c);
	}

	public setDks(d: {
		matrix: { col: number; row: number };
		distance: Array<number>;
		keycodes: Array<string>;
		buf: Array<number>;
		position?: number;
		workMode?: number
	}): Observable<Result> {
		return this.command.setDks(d)
	}

	public setHeDistance(d: {
		press?: number;
		sensitive_release?: number;
		sensitive_press?: number;
		keyMode: 0 | 1;
		workMode?: EHeWorkMode;
		buffer?: Uint8Array
	}): Observable<Result> {
		return this.command.setHeDistance(d)
	}

	public getJoyKeyboard(): Observable<number[]> {
		return this.command.getJoyKeyboard()
	}

	public setSnapTap(data: {
		wordMode: number,
		keys: Array<[number, number]>,
		index: number
	}): Observable<any> {
		return this.command.setSnapTap(data)
	}
}
