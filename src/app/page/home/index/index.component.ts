import {Component, OnInit} from "@angular/core";
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";
@Component({
	selector: "mouse-dpi-index",
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	constructor(
		private readonly service: DeviceConnectService,
		 
	) {
	} 
	 
	ngOnInit(){}
}
