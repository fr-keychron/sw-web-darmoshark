import {Observable} from "rxjs";
import {Color} from "ng-antd-color-picker";

export interface ILedIndicationKey {
	support: boolean,
	enable: boolean
}

export interface ILedIndication {
	keys: {
		numLock: ILedIndicationKey,
		capsLock: ILedIndicationKey,
		scrollLock: ILedIndicationKey,
		composeLock: ILedIndicationKey,
		KanaLock: ILedIndicationKey
	},
	color: Color
}

export interface IRgbCommand {

	init(): Observable<any>

	getLedCount(): Observable<number>

	gedNumberByRow(row: number): Observable<number[]>

	getAllLedNumber(): Observable<number[][]>

	getLedColor(start: number, count: number): Observable<any>

	SetLedColor(index: number, count: number, color: number[][]): Observable<void>

	SaveLedConf(): Observable<void>

	getLedIndication(): Observable<ILedIndication>

	setLedIndication(d: {
		mask: number,
		color: { h: number, s: number, v: number }
	}): void
}
