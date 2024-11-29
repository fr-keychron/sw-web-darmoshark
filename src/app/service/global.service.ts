import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable({providedIn: "root"})
export class GlobalService {
	public loading: Subject<boolean> = new Subject<boolean>() ;
}
