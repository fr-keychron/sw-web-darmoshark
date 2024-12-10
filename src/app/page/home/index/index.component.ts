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
	public dmsDevice: any;
	public currentHidDeviceId: number;
	public deviceOptions: Array<{ label: string; value: number }> = [
		{ label: "M3PRO", value: 613089042 },
		{ label: "M2PRO", value: 613089041 },
		{ label: "M1PRO", value: 613089040 }
	];
	ngOnInit() {
		this.dmsDevice = this.service
		
	}
	
}
