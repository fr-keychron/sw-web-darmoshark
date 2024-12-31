
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

/**鼠标路由 */
const mouseRoute: Routes = [
	// 主页设置
	{
		path: 'mouse/home',
		loadChildren: () => import('./page/home/home.module').then(m => m.IndexModule),
	},
	// DPI设置
	{
		path: 'mouse/dpi',
		loadChildren: () => import('./page/dpi/dpi.module').then(m => m.IndexModule),
	},
	// 按键功能
	{
		path: 'mouse/key',
		loadChildren: () => import('./page/key/key.module').then(m => m.IndexModule),
	},
	// 宏设置
	{
		path: 'mouse/macro',
		loadChildren: () => import('./page/macro/macro.module').then(m => m.IndexModule),
	},
	// 宏设置
	{
		path: 'mouse/light',
		loadChildren: () => import('./page/light/light.module').then(m => m.IndexModule),
	},
	// 固件升级
	{
		path: 'mouse/ability',
		loadChildren: () => import('./page/ability/ability.module').then(m => m.IndexModule),
	},
	// 系统功能
	{
		path: 'mouse/sys',
		loadChildren: () => import('./page/sys/sys.module').then(m => m.IndexModule),
	},
]
const routes: Routes = [
	...mouseRoute,
	{
		path: 'update',
		loadChildren: () => import('./page/firmware/firmware.module').then(m => m.FirmwareModule)
	},
	{
		path: 'pair',
		loadChildren: () => import('./page/pair/pair.module').then(m => m.PairModule)
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
