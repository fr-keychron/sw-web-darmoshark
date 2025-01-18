import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import keyJson from 'src/assets/json/mouse.json';
import { MsgService } from "src/app/service/msg/msg.service";
import { TranslateService } from "@ngx-translate/core";
import { Subscription, fromEvent } from 'rxjs';
import { EDmsMouseKeycodeDefault, EMouseBtn, MouseDevice } from "../../../../common/hid-collection";
import { DeviceConnectService } from "../../../../service/device-conncet/device-connect.service";
@Component({
	selector: 'mouse-button-keyboard',
	templateUrl: './keyboard.component.html',
	styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent {

	public keyCodes: Array<any> = [];

	constructor(
		private readonly msg: MsgService,
		private readonly i18n: TranslateService,
		private readonly mouseService: DeviceConnectService
	) {
		this.keyCodes = keyJson[0].keycodes.slice(2);
	}


	private _mouseKey: number = null

	private _data: Record<string, any>;
	@Input()
	public set data(v: Record<string, any>) {
		this._data = v;
		if (v) this.setDefaultVal(this.mouseKey)
	}

	public get data() {
		return this._data;
	}

	@Input()
	public set mouseKey(v: number) {
		if (v || v === 0) {
			this.setDefaultVal(v)
			this._mouseKey = v
			// this.submit()
		} else {
			this._mouseKey = null
			this.currentShift = null
			this.firstKey = {code: '', name: ''}
			this.cacheConf.first = ''
			this.cacheConf.shift = 0
		}
	}

	public get mouseKey() {
		return this._mouseKey
	}

	public currentShift: number;

	public setShift(k: number) {
		if (this.currentShift === k) {
			this.currentShift = null
		} else {
			this.currentShift = k;
		}
	}

	public firstKey: { name: string, code: string } = {name: '', code: ''}

  @ViewChild('inputKey') public inputKey: ElementRef
	public inputKeyRef:Subscription
	public listenKey(subFlag: boolean){
		if(this.inputKeyRef) this.inputKeyRef.unsubscribe();
		if(subFlag){
			this.inputKeyRef = fromEvent(this.inputKey.nativeElement, 'keydown')
				.subscribe((e:any) => {
					e.preventDefault()
					e.stopPropagation()
					this.firstKey = {name: e.key, code: e.code}
				})
		} 
	}

	

	public removeKey(type: number) {
		if (type === 1) this.firstKey = {name: '', code: ''}
	}

	@Output()
	public update: EventEmitter<any> = new EventEmitter<any>();

	public submit() {
		if (this.currentShift === this.cacheConf.shift && this.firstKey.code === this.cacheConf.first ) return;
		if (!this.currentShift || !this.firstKey.code) return
		if (this.mouseKey === null) return
		const device = this.mouseService.getCurrentHidDevice<MouseDevice>();
		const shift = this.currentShift ?? 0;
		const keycodes: number[] = []
		const keyCodeValue = EDmsMouseKeycodeDefault.find((i: { code: string; }) => i.code === this.firstKey.code);
		
		if (this.firstKey.code) keycodes.push(keyCodeValue.value)
		device.setMouseBtn2KeyBoard(
			this.mouseKey,
			shift,
			keycodes
		)
			.subscribe(() => {
				this.msg.success(this.i18n.instant('notify.success'))
				this.update.next(true)
			})
	}


	public cacheConf = {
		shift: 0,
		first: ''
	}

	public isChange(){
		return this.currentShift === this.cacheConf.shift &&
		this.firstKey.code === this.cacheConf.first 
	}

	public setDefaultVal(mouseKey: number) {
		this.cacheConf.shift = 0
		this.cacheConf.first = ''
		if ((!mouseKey && mouseKey !== 0) || !this.data) return
		const item = this.data['find']((d:{mouseKey: number}) => d.mouseKey === mouseKey);
		if (!item.data || item.type !== EMouseBtn.Keyboard) return;
		if (item.mouseKey || item.mouseKey === 0) {
			this.currentShift = item.data.shiftKey
			this.cacheConf.shift = item.data.shiftKey;
		}

		if (item.data.key1) {
			this.firstKey = {
				code: item.data.key1.code,
				name: item.data.key1.name
			}
			this.cacheConf.first = item.data.key1.code
		}
	}
}
