import {NgModule} from "@angular/core";
import {ShareModule} from "../../share.module";
import {RouterModule, Routes} from "@angular/router";
import {PairComponent} from "./index/pair.component";

const routes: Routes = [
	{path: '', component: PairComponent},
]

@NgModule({
	declarations: [
		PairComponent,
	],
	imports: [
		ShareModule,
		RouterModule.forChild(routes),
	]
})
export class PairModule {

}
