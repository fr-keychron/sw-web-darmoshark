import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ErrorComponent} from './components/error/error.component';
import {WaitingComponent} from "./components/waitting/index.component";

const mouseRoute: Routes = [
	{
		path: 'mouse/home',
		loadChildren: () => import('./page/home/home.module').then(m => m.IndexModule),
	},
	{
		path: 'mouse/key',
		loadChildren: () => import('./page/key/key.module').then(m => m.IndexModule),
	},
	{
		path: 'mouse/pointer',
		loadChildren: () => import('./page/dpi/dpi.module').then(m => m.IndexModule),
	},
	{
		path: 'mouse/macro',
		loadChildren: () => import('./page/macro/macro.module').then(m => m.IndexModule),
	},
	{
		path: 'mouse/light',
		loadChildren: () => import('./page/light/light.module').then(m => m.IndexModule),
	},
	{
		path: 'mouse/ability',
		loadChildren: () => import('./page/ability/ability.module').then(m => m.IndexModule),
	},
	{
		path: 'mouse/sys',
		loadChildren: () => import('./page/sys/sys.module').then(m => m.IndexModule),
	},
	{
		path: 'firmware/frequency',
		loadChildren: () =>  import('./page/firmware/firmware.module').then(m => m.IndexModule),
	},
]

const routes: Routes = [
	...mouseRoute,
	{
		path: 'waiting',
		component: WaitingComponent,
	}, {
		path: 'error',
		component: ErrorComponent
	}, {
		path: '', redirectTo: '/mouse/home', pathMatch: 'full'
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
