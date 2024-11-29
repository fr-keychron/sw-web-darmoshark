import {Component} from "@angular/core";
import {ShareModule} from "../../share.module";

@Component({
	standalone: true,
	imports: [
		ShareModule
	],
	template: `
		<c-loading/>
	`,
	styles: [``]
})
export class WaitingComponent {

}
