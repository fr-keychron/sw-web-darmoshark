import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import keyJson from 'src/assets/json/mouse.json';
import {TaskQueueService} from "src/app/service/task-queue/task-queue.service";
import {
	EMouseBtnGameKey,
	EDmsMouseBtnGameMouse,
	MouseDevice,
	EDmsMouseKeycodeDefault,
	EMouseBtnGame
} from "../../../../common/hid-collection";
import {DeviceConnectService} from "../../../../service/device-conncet/device-connect.service";
import {MsgService} from "src/app/service/msg/msg.service";
import {TranslateService} from "@ngx-translate/core";
import { fromEvent, Subscription } from "rxjs";

@Component({
	selector: 'mouse-button-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.scss']
})
export class GameComponent {
	public _mouseKey: number
	public mouseCodes: Array<any> = []
	private keyCodes: Array<any> = keyJson[0].keycodes.slice(2);
	public mouseBtnGame = EMouseBtnGame
	public keyType: number = 1
	public keyData: { name: string, code: string } = {name: '', code: ''}
	constructor(
		private readonly mouseService: DeviceConnectService,
		private readonly task: TaskQueueService,
		private readonly msg: MsgService,
		private readonly i18n: TranslateService,
	) {
		this.mouseCodes = EDmsMouseBtnGameMouse.map(i => {
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
		if (val > 4000) target.value = '4000'
	}

	public rateChange($event: Event) {
		const target = $event.target as HTMLInputElement
		const val = Number(target.value);
		target.value = target.value.replace(/[^\d]/g, '');
		if (val > 255) target.value = '255'
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
		const device = this.mouseService.getCurrentHidDevice<MouseDevice>()
			device.setMouseBtn2Game(
				this.mouseKey, {
					type: this.keyType,
					keycode: Number(this.currentSelectKey),
					speed: Number(this.rate),
					count: Number(this.count)
				}
			).subscribe(() => {
				this.update.next(true)
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
		const gameType = EMouseBtnGame.find((element: any)=>{
			return element.value === item.data.type
		})
		if (!item || !gameType)return;
		const {type, count, speed, keycode} = item.data;
		this.currentSelectKey = keycode.value
		this.keyType = type
		if (type !== EMouseBtnGameKey.mouse) {
			const keyName = this.keyCodes.find(i => i.code === keycode.key)
            if (keyName && /<br\/>/.test(keyName.name)) {
                const a = keyName.name.split('<br/>')
				keyName.name = a[1]
            }
			this.keyData = {code: keycode.code, name: keyName.name}
		}

		this.count = count;
		this.rate = speed;
	}
	// 验证键盘输入
	public validateInput(event: KeyboardEvent): void {
        const allowedKeys = [
            'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', // 常用功能键
        ]
        const isNumber = /^[0-9]$/.test(event.key)
        if (!isNumber && !allowedKeys.includes(event.key)) {
            event.preventDefault()
        }
    }

	@ViewChild('inputKey') public inputKey: ElementRef
	public inputKeyRef:Subscription
	public listenKey(subFlag: boolean){
		if(this.inputKeyRef) this.inputKeyRef.unsubscribe();
		if(subFlag){
			this.inputKeyRef = fromEvent(this.inputKey.nativeElement, 'keydown')
				.subscribe((e:any) => {
					e.preventDefault()
					e.stopPropagation()
					this.keyData = {name: e.key, code: e.code}
					const keyCodeValue = EDmsMouseKeycodeDefault.find((i: { code: string; }) => i.code === this.keyData.code);
					this.currentSelectKey = keyCodeValue.value
				})
		} 
	}
}
