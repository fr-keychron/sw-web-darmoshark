import {NgModule} from "@angular/core";
import {ShareModule} from "../../share.module";
import {RouterModule, Routes} from "@angular/router";
import {UpdateComponent} from "./update/update.component";
import { IndexComponent } from "./index/index.component";

const routes: Routes = [
	{path: '', component: IndexComponent},
	{path: 'dms', component: UpdateComponent},
]

@NgModule({
	declarations: [
		UpdateComponent,
		IndexComponent
	],
	imports: [
		ShareModule,
		RouterModule.forChild(routes),
	]
})
export class FirmwareModule {

}
