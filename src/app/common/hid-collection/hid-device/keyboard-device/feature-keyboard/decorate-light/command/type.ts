import {Observable} from "rxjs";

export interface IDecorateLightCommand {
	getBrightness(): Observable<number>;

	getEffect(): Observable<number>;

	getColor(): Observable<number>

	setBrightness(v: number): Observable<any>
}
