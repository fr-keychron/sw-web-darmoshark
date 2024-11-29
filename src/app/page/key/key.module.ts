import {NgModule} from "@angular/core";
import {ShareModule} from "../../share.module";
import {RouterModule, Routes} from "@angular/router";
import { IndexComponent } from './index/index.component';
import {GameComponent} from "./components/game/game.component";
import {KeyboardComponent} from "./components/keyboard/keyboard.component";
const routes: Routes = [
	{ path: '' , component: IndexComponent }
]

@NgModule({
	declarations: [
		IndexComponent,
		GameComponent,
		KeyboardComponent
	],
	imports: [
		ShareModule,
		RouterModule.forChild(routes),
	]
})
export class IndexModule {

}
