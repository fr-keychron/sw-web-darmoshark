import {Observable} from "rxjs";
import {EHeWorkMode, Result} from "src/app/model";
import {IProfileBuffer} from "../../../types";

export interface IHeCommand {
	setHeDistance(d: {
		press?: number;
		sensitive_release?: number;
		sensitive_press?: number;
		keyMode: 0 | 1;
		workMode?: EHeWorkMode;
		buffer?: Uint8Array;
	}): Observable<Result>;

	setDks(d: {
		matrix: { col: number; row: number };
		distance: Array<number>;
		keycodes: Array<string>;
		buf: Array<number>;
		position?: number;
		workMode?: number;
	}): Observable<Result>;

	removeDks(row: number, col: number): Observable<null>;

	getProfileInfo(): Observable<{ current: number; total: number; size: number; names: string[] }>;

	saveProfile(): Observable<Result>;

	getProfileBuffer(): Observable<IProfileBuffer>;

	getKeyDistance(row: number, col: number): Observable<{ distance: number, row?: number, col?: number }>;

	getCurve(): Observable<number[][]>;

	setCurve(c: number[][]): Observable<Result>;

	calibration(): Observable<Result>;

	changeProfile(profile: number): void;

	changeProfileName(buffer: number[], length: number, idx: number): Observable<Result>;

	getCalibration(): Observable<Result>;

	enableJoyKeyboard(enable: number, xbox?: number): Observable<Result>;

	calibrationStop(): Observable<any>

	clearProfile(): Observable<any>

	getJoyKeyboard?(): Observable<number[]>

	setSnapTap?(data: { wordMode: number, keys: Array<[number, number]>, index: number }): Observable<any>;

	getCommandVersion(): number

	clearAdvanceKey(): Observable<any>
}
