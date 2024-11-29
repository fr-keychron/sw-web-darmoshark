import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NZ_I18N} from 'ng-zorro-antd/i18n';
import {zh_CN} from 'ng-zorro-antd/i18n';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutComponent} from "./layout/layout.component";
import {ShareModule} from "./share.module";
import {AsideComponent} from "./layout/aside/aside.component";
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
// import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {GLOBAL_CONFIG, setConfVal} from 'src/app/config';
import {ErrorComponent} from './components/error/error.component';
import {HashLocationStrategy, LocationStrategy, NgOptimizedImage} from '@angular/common';
import {ResponseInterceptor} from './http.interceptor';
import {NzConfig, provideNzConfig} from 'ng-zorro-antd/core/config';
// import {SettingComponent} from "./pages-keyboard/setting/setting.component";
import {LogService} from "./service/log/log.service";
import {appInitializerFactory, AppInitService} from "./app-init.service";
import {CustomLoader} from './app.custom-translate'
// export function HttpLoaderFactory(http: HttpClient) {
// 	console.dir(TranslateHttpLoader);
	
// 	return new TranslateHttpLoader(http);
// }

const ngZorroConfig: NzConfig = {
	message: {nzMaxStack: 1, nzTop: 50},
};

@NgModule({
	declarations: [
		AppComponent,
		ErrorComponent,
		LayoutComponent,
		AsideComponent
	],
	imports: [
		AppRoutingModule,
		FormsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useClass: CustomLoader,
				// useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		}),
		ShareModule,
		NgOptimizedImage
	],
	providers: [
		{provide: NZ_I18N, useValue: zh_CN},
		{provide: LocationStrategy, useClass: HashLocationStrategy},
		{provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptor, multi: true},
		{provide: ErrorHandler, useExisting: LogService},
		{
			provide: APP_INITIALIZER,
			useFactory: appInitializerFactory,
			deps: [AppInitService],
			multi: true
		},
		provideNzConfig(ngZorroConfig)
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(
		private i18n: TranslateService,
	) {
		const lng = navigator.language || GLOBAL_CONFIG.lang
		const isSupport = GLOBAL_CONFIG.langs.find((i: any) => i.includes.includes(lng));
		const l = isSupport ? isSupport.value : 'en-US';
		const m = localStorage.getItem('lang') ? localStorage.getItem('lang') : l
		setConfVal('lang', m)
		this.i18n.setDefaultLang(m)
		this.i18n.use(m)
	}
}
