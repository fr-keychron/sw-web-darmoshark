import {NgModule} from "@angular/core";
import {ShareModule} from "../../share.module";
import {RouterModule, Routes} from "@angular/router";
import {UpdateComponent} from "./index/update.component";

const routes: Routes = [
	{path: '', component: UpdateComponent},
]

@NgModule({
	declarations: [
		UpdateComponent,
	],
	imports: [
		ShareModule,
		RouterModule.forChild(routes),
	]
})
export class FirmwareModule {

}
