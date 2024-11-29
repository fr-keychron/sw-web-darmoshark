import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {HttpClientModule} from "@angular/common/http";
import {CommonModule} from "@angular/common";

import {NzIconModule} from 'ng-zorro-antd/icon'
import {NzMessageModule} from 'ng-zorro-antd/message';
import {NzSpinModule} from 'ng-zorro-antd/spin'
import {NzSelectModule} from 'ng-zorro-antd/select'
import {NzTabsModule} from 'ng-zorro-antd/tabs'
import {NzSliderModule} from 'ng-zorro-antd/slider'
// import {NzColorPickerModule} from 'ng-zorro-antd/color-picker';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzProgressModule} from 'ng-zorro-antd/progress';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {NzPopconfirmModule} from 'ng-zorro-antd/popconfirm';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import {NzNotificationModule} from "ng-zorro-antd/notification";

import {MsgService} from "./service/msg/msg.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

// import {KeysComponent} from './components/keys/keys.component'
import {DeviceConnectComponent} from "./components/device-connect/device-connect.component";
// import {KeycapComponent, KeyComponent} from "./components/keycap";
// import {DeviceSelectionComponent} from './components/device-selection/device-selection.component';
// import {BaseLayoutComponent} from "./components/base-layout/base-layout.component";
// import {ThrottleClickDirective} from "./directive/throttle";
// import {FixedPipe, IsOrNotPipe, LayerPipe, StrReplacePipe} from "./pipe";
// import {KeyNamePipe} from "./pipe/keyname.pipe";
import {LoadingComponent} from "./components/loading/loading.component";
import {GSelectComponent} from "./components/select/select.component";
import {GOptionComponent} from "./components/select/option.component";
import {SliderComponent} from "./components/slider/slider.component";
import {ColorWheelComponent} from "./components/color-picker/picker.component";
// import {ProgressComponent} from "./components/progress/progress.component";
// import {CzDisplayDirective} from "./directive/display";
import {BaseLayoutMouseComponent} from "./components/base-layout-mouse/base-layout.component";
// import {MacroComponent} from "./components/macro/index.component";
// 
// import {JsonEditorComponent} from "./components/json-editor/json-editor";
// import {I18nPipe} from "./pipe/i18n.pipe";
// import {LightNormalComponent} from "./pages-keyboard/key-light/index/component/normal/normal.component";
// import {MixRgbComponent} from "./pages-keyboard/key-light/index/component/mix-rgb/mix-rgb.component";
// import {IndicationComponent} from "./pages-keyboard/key-light/index/component/indication/indication.component";

const components: any[] = [
	// KeysComponent,
	DeviceConnectComponent,
	// KeycapComponent,
	// KeyComponent,
	// DeviceSelectionComponent,
	// BaseLayoutComponent,
	BaseLayoutMouseComponent,
	ColorWheelComponent,
	// MacroComponent,
	LoadingComponent,
	GSelectComponent,
	GOptionComponent,
	SliderComponent
	// ProgressComponent,
	// JsonEditorComponent,
	// LightNormalComponent,
	// MixRgbComponent,
	// IndicationComponent
]

const pipes = [
	// IsOrNotPipe,
	// FixedPipe,
	// KeyNamePipe,
	// LayerPipe,
	// StrReplacePipe,
	// I18nPipe
]
const modules: Array<any> = [
	NzIconModule,
	NzMessageModule,
	NzSpinModule,
	NzSelectModule,
	NzSliderModule,
	// NzColorPickerModule,
	NzToolTipModule,
	NzInputModule,
	NzButtonModule,
	NzModalModule,
	NzFormModule,
	NzProgressModule,
	NzSwitchModule,
	NzTableModule,
	NzDropDownModule,
	NzRadioModule,
	NzPopoverModule,
	NzPaginationModule,
	NzPopconfirmModule,
	NzCheckboxModule,
	NzInputNumberModule,
	NzUploadModule,
	NzNotificationModule,
	NzEmptyModule
]

const providers = [
	MsgService,
]

@NgModule({
	declarations: [
		...components,
		// ThrottleClickDirective,
		// CzDisplayDirective,
		// ...pipes,
	],
	providers: [
		...providers,
	],
	imports: [
		...modules,
		CommonModule,
		HttpClientModule,
		TranslateModule,
		FormsModule,
		ReactiveFormsModule,
		NzTabsModule
	],
	exports: [
		...modules,
		CommonModule,
		HttpClientModule,
		TranslateModule,
		FormsModule,
		ReactiveFormsModule,
		NzTabsModule,
		...components,
		// ...pipes,
		// ThrottleClickDirective,
		// CzDisplayDirective
	]
})
export class ShareModule {
}
