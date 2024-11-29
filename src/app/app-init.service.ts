import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
// import {GrowthBook, configureCache} from "@growthbook/growthbook";
import BuildInfo from 'src/app/version.json'

@Injectable({
	providedIn: 'root'
})
export class AppInitService {

	private feature: Record<string, boolean> = {}

	constructor(private http: HttpClient) {

	}

	loadConfig() {
		//@ts-ignore
		this.feature = BuildInfo.siteConf?.feat || '';
	}

	getFeat() {
		return this.feature
	}

	find(id: string): boolean {
		if (['QA', "Dev"].includes(BuildInfo.env)) return true
		return this.feature[id]
	}
}

export function appInitializerFactory(appInitService: AppInitService) {
	return () => {
		appInitService.loadConfig()
	}
}

