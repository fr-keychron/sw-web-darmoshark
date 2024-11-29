import {NgModule} from "@angular/core";
import {ShareModule} from "../../share.module";
import {RouterModule, Routes} from "@angular/router";
import { Macro } from './index/index.component'
const routes: Routes = [
	{ path: '' , component: Macro }
]

@NgModule({
	declarations: [
		Macro
	],
	imports: [
		ShareModule,
		RouterModule.forChild(routes),
	]
})
export class IndexModule {

}
