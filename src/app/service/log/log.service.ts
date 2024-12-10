import {ErrorHandler, Injectable, OnInit} from "@angular/core";
import {DeviceConnectService} from "../device-conncet/device-connect.service";

export interface ILog {
	type: "Js" | "Net",
	pid: string,
	vid: string
	model: string,
	data: any
}

@Injectable({providedIn: 'root'})
export class LogService implements ErrorHandler {
	private logs: ILog[] = []

	constructor(
		private readonly keyboard: DeviceConnectService,
	) {

	}

	handleError(error: any): void {
		const d = this.keyboard.getCurrentHidDevice()
		const obj: any = {
			type: 'Js',
			pid: d ? d.pid : '',
			vid: d ? d.vid : '',
			model: d ? d.name : '',
			data: ''
		}
		if (error instanceof Error) obj.data = error
		if (error instanceof String) obj.data = error;
		if (error instanceof Object && error.hasOwnProperty('success')) obj.data = error.msg
		console.error(error)
		this.logs.push(obj)
	}

	add(data: ILog) {
		this.logs.push(data)
	}

	get() {
		return this.logs
	}
}
