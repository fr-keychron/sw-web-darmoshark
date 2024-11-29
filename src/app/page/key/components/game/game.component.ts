import {Component, EventEmitter, Input, Output} from "@angular/core";
import keyJson from 'src/assets/json/mouse.json';
import {TaskQueueService} from "src/app/service/task-queue/task-queue.service";
import {
	EDmsMouseGame,
	EMouseBtnGameKey,
	EMdsMouseBtnGameMouse,
	EMouseKeycodeDefault,
	MouseDevice,
	EDmsMouseKeycodeDefault
} from "../../../../common/hid-collection";
import {DeviceConnectService} from "../../../../common/device-conncet/device-connect.service";
import {MsgService} from "src/app/service/msg/msg.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
	selector: 'mouse-button-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.scss']
})
export class GameComponent {

	public _mouseKey: number
	public keyCodes: Array<any> = []
	public mouseCodes: Array<any> = []
	public keyType: number = 1
	constructor(
		private readonly mouseService: DeviceConnectService,
		private readonly task: TaskQueueService,
		private readonly msg: MsgService,
		private readonly i18n: TranslateService,
	) {
		this.keyCodes = EDmsMouseKeycodeDefault.map((i: { value: number; key: string; }) => {
			return {code: i.value, name: i.key}
		})
		this.mouseCodes = EMdsMouseBtnGameMouse.map(i => {
			return {code: i.value, name: i.key}
		})
		
		
	}

	public _data: any

	@Input() public keyChange: any
	@Input() public changeActive: any
	@Input()
	public set data(v) {
		this._data = v;

	}
	public get data() {
		return this._data;
	}

	@Input()
	public set mouseKey(v: number) {
		if (v || v===0) {
			this._mouseKey = v
			this.setDefaultVal()
		} 
	}

	public get mouseKey() {
		return this._mouseKey
	}


	public currentSelectKey: string | number

	public rate = 10;
	public count = 0;

	public countChange($event: Event) {
		const target = $event.target as HTMLInputElement
		const val = Number(target.value);
		target.value = target.value.replace(/[^\d]/g, '');
		if (val > 9999) target.value = '9999'
	}

	public rateChange($event: Event) {
		const target = $event.target as HTMLInputElement
		const val = Number(target.value);
		target.value = target.value.replace(/[^\d]/g, '');
		if (val > 1000) target.value = '1000'
	}

	public setKey(k: string) {
		this.currentSelectKey = k;
	}

	public removeKey() {
		this.currentSelectKey = ''
		this.task.clear();
	}

	public type: EMouseBtnGameKey;

	public submit() {
		if (!this.mouseKey && this.mouseKey!==0) return;
		const type = this.keyType === 1 
		? 0x10 + Math.floor(this.count / 255)
		: 0x30 + Math.floor(this.count / 255)
		const rate = Number(this.rate)
		const count = this.count > 255 ? 255 : Number(this.count) 
		console.log(type);
		
		
		const device = this.mouseService.getCurrentHidDevice<MouseDevice>()
			device.setMouseBtn2Game(
				this.mouseKey, {
					type: Number(type),
					keycode:  Number(this.currentSelectKey),
					speed: rate,
					count: count
				}
			)
				.subscribe(() => {
					this.update.next(7)
					this.msg.success(this.i18n.instant('notify.success'))
				})
	}

	public tabIndex = 0;


	@Output()
	public update: EventEmitter<any> = new EventEmitter<any>()

	public setDefaultVal() {
		// 初始化
		this.currentSelectKey = null
		this.rate = 10
		this.count = 0
		
		if (!this.mouseKey && this.mouseKey !== 0) return
		const item = this.data.find((element: any) => element.mouseKey === this.mouseKey);
		console.log(item);
		if (!Object.values(EDmsMouseGame).includes(item.data.type))return;
		const {type, count, speed, value} = item.data;
		console.log(item);
		this.currentSelectKey = value
		if (type === EDmsMouseGame[EDmsMouseGame.mouseGame]) {
			this.keyType = 1
		}else{
			this.keyType = 2
		}

		this.count = count;
		this.rate = speed;
	}
}
