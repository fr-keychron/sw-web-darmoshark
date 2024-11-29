import {NgModule} from "@angular/core";
import {ShareModule} from "src/app/share.module"
import {RouterModule, Routes} from "@angular/router";
import { IndexComponent } from './index/index.component'
const routes: Routes = [
	{ path: '' , component: IndexComponent }
]

@NgModule({
	declarations: [
		IndexComponent
	],
	imports: [
		ShareModule,
		RouterModule.forChild(routes),
	]
})
export class IndexModule {

}
