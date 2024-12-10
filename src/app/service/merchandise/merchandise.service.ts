import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Delete, Get, Post, Put} from '../../decorator/request.decorator';


const api = {
	info: 'merchandise/product/vpId/#{id}' ,
	firmwareList: 'merchandise/firmware/list' ,
	issue: "merchandise/product/issue",
	notify: `merchandise/firmware/notify/#{id}`,
	launcher: 'launcher'
}

@Injectable({providedIn: 'root'})
export class MerchandiseService {
	constructor(
		private readonly http: HttpClient
	) {
	}
	@Get(api.info)
	info(q?: any): Observable<any> | any {
	}

	@Get(api.firmwareList)
	firmwareList(q?: any): Observable< any > | any {
	}

	@Post(api.issue)
	public issue(q?: any): Observable< any > | any {
	}

	@Post(api.notify)
	public notify(q?: any): Observable< any > | any {
	}

	@Get(api.launcher)
	launcher(q?: any): Observable< any > | any {
	}
}
