import {Observable} from "rxjs";

export interface ISleepConf {
	backlight: number
	sleep: number
}

export interface ISleep extends ISleepConf {
	getSleep(): Observable<ISleepConf>

	setSleep(d: ISleepConf): Observable<void>
}
