import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, filter} from 'rxjs/operators'
import {LogService} from "./service/log/log.service";
import {DeviceConnectService} from "./common/device-conncet/device-connect.service";
import BuildInfo from 'src/app/version.json'
@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
	constructor(
		private readonly log: LogService,
		private readonly keyboard: DeviceConnectService
	) {
	}

	public intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		httpRequest = httpRequest.clone({
			setHeaders: {
				"Client": "launcher" ,
				"Env": BuildInfo.env
			}
		});
		return next.handle(httpRequest).pipe(
			filter(event => event instanceof HttpResponse),
			catchError(e => {
				const device = this.keyboard.getCurrentHidDevice();
				this.log.add({
					type: "Net",
					pid: device ? device.pid : '',
					vid: device ? device.vid : '',
					model: device ? device.name : '',
					data: JSON.stringify({
						status: e.status,
						url: e.url
					})
				})
				// if(e.error && e.error.message) this.msg.error(e.error.message)
				return throwError(e)
			})
		)
	}
}
