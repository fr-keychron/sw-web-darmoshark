import {EventEmitter, Injectable} from "@angular/core";
import {NzMessageService} from "ng-zorro-antd/message";

@Injectable()
export class MsgService {
	constructor(
		private nzMessageService: NzMessageService
	) {
	}

	warn(s: string) {
		this.nzMessageService.warning(s, {nzDuration: 3000})
	}

	error(s: string) {
		this.nzMessageService.error(s, {nzDuration: 3000})
	}

	success(s: string ) {
		this.nzMessageService.success(s, {nzDuration: 3000})
	}
}
