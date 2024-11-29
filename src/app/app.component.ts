import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AppInitService} from "./app-init.service";
import BuildInfo from 'src/app/version.json'
import {setConfVal} from 'src/app/config';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
	constructor(
		translate: TranslateService,
		private appInit: AppInitService
	) {
		const host: any = {
			"us": 'https://launcher.keychron.com/',
			'cn': 'https://launcher.keychron.cn/',
			'local': 'https://192.168.31.92:23333/'
		}
		const _api = this.appInit.getFeat() as any
		const api = _api?.api || {}
		let url = host[BuildInfo.api]+'api/'
		if(api[BuildInfo.api]){
			url = host[api[BuildInfo.api]]+'api/'
		}
		setConfVal('API', url)
		setConfVal('STATIC', url)
	}
}
