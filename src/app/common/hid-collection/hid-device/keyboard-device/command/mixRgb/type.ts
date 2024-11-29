import {Observable} from "rxjs";

export interface IMixEffect {
	effect: number
	duration: number,
	index: number
}

export interface IMixRgb {
	ledCount: number;
	conf: { effects: number, region: number };

	getVersion(): Observable<number>;

	save(): Observable<number>;

	getInfo(): Observable<{ region: number, effects: number }>

	getLedCount(): Observable<number>;

	getLedRegion(start: number, count: number): Observable<Array<number>>

	setLedRegion(start: number, data: Array<number>): Observable<void>

	gedNumberByRow(row: number): Observable<Array<number>>

	getAllLedNumber(): Observable<number[][]>

	getMixConf(region: number, start: number, count: number): Observable<Array<IMixEffect>>

	setMixConf(region: number, start: number, effects: Array<IMixEffect>): Observable<any>
}


export interface IMixRgbConf {
	vp: number
	name: string
	current: boolean
	matrix: Array<IMixRgbMatrix>
	region: Array<Array<IMixEffect>>
}


export type IMixRgbMatrix = Array<{ index: number; region: number }>
