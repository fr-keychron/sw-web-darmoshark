import {Component, OnInit} from "@angular/core";
import {fadeAnimation} from "../app-routing-animation"; 
import {GlobalService} from "../service/global.service";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: 'layout',
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.scss'],
	animations: [fadeAnimation],
})
export class LayoutComponent implements OnInit {
	constructor( 
		private readonly global: GlobalService,
		private readonly activeRoute: ActivatedRoute
	) { 
		this.global.loading.subscribe(v => this.globalLoading = v)
	}
	public icp = {
		no: "粤ICP备2024348347号-1",
		copyRight: "Copyright © 2024.MySite Ltd.All Rights Reserved. "
	}
	public layoutConf: { leftHide: boolean } = {
		leftHide: false
	}

	ngOnInit() {
		this.activeRoute.queryParams.subscribe((s: Record<string, any>) => {
			if (s['leftHide']) {
				this.layoutConf.leftHide = s['leftHide']
			}
		});
	}

	public icpOpen() {
		window.location.href = 'https://beian.miit.gov.cn/#/Integrated/index'
	}
	public globalLoading = false
}
