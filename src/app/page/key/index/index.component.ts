import {Component, OnInit,} from "@angular/core";
import {Subscription, Observable} from "rxjs";
import {filter, retry} from 'rxjs/operators';
import {
	EDmsMacroLoopKey,
	HidDeviceEventType, 
	EDmsMouseBtnAction, 
	MouseDevice,
	EDmsMouseBtnMedia, 
	MacroList, 
	dmsSerializeMacro,
	EDmsMouseBtnShortcut,
	handleMouseKey,
	EDmsMouseBtnDpi,
	EDmsMouseGame,
	EDmsMousseBtnLight,
	EMouseBtn
} from "../../../common/hid-collection";
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";
import {TranslateService} from "@ngx-translate/core";
import {MsgService} from "src/app/service/msg/msg.service";
@Component({
	selector: "mouse-dpi-index",
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	constructor(
		private readonly service: DeviceConnectService,
		private readonly i18n: TranslateService,
		private readonly msg: MsgService,
	) {
	}

	public device: MouseDevice;
	public keyConf: any;
	public currentMouseKey: number;
	public funType: number;
	public keyChange: handleMouseKey = new handleMouseKey()
	public mouseKeys: any = [{
		mouseKey: 0,
		key: EDmsMouseBtnAction[0].key,
		value: EDmsMouseBtnAction[0].value,
		keyType: 0,
	}, {
		mouseKey: 1,
		key: EDmsMouseBtnAction[2].key,
		value: EDmsMouseBtnAction[2].value,
		keyType: 0,
	}, {
		mouseKey: 2,
		key: EDmsMouseBtnAction[1].key,
		value: EDmsMouseBtnAction[1].value,
		keyType: 0,
	}, {
		mouseKey: 3,
		key: EDmsMouseBtnAction[3].key,
		value: EDmsMouseBtnAction[3].value,
		keyType: 0,
	}, {
		mouseKey: 4,
		key: EDmsMouseBtnAction[4].key,
		value: EDmsMouseBtnAction[4].value,
		keyType: 0,
	}];
	public sensitiveAction = EDmsMouseBtnDpi
	public mediaAction = EDmsMouseBtnMedia
	public shortcutAction = EDmsMouseBtnShortcut
	public lightAction = EDmsMousseBtnLight
	public funBtnKeys = EMouseBtn
	public macroList: MacroList[]
	public activeMouseKey: number = 1;
	public mouseAction = EDmsMouseBtnAction 
	public activeModal: string | null = null;
	public leftLock:string = "1"
	ngOnInit() {
		this.keyChange.setMouseKey(this.activeMouseKey)
		
		const data = JSON.parse(localStorage.getItem('macroList'))
		if (data && data.length > 0) {
			this.macroList = data
		}
	}

	private deviceSub: Subscription;

	ngOnDestroy() {
		if (this.deviceSub) this.deviceSub.unsubscribe();
	} 

	// 图上按钮点击
	public mouseKeyClick($e: number) {
		if($e === null) return
		this.activeMouseKey = $e;
		this.keyChange.setMouseKey($e)
	}

	/**父组件传递方法：鼠标值变化时执行 */
	public load($e: number) {
		if (this.deviceSub) this.deviceSub.unsubscribe()
		this.device = this.service.getCurrentHidDevice() as MouseDevice
		const profile = $e
		const leftLockList = localStorage.getItem('leftLockList')
		const parsedList = JSON.parse(leftLockList)
		if (Array.isArray(parsedList) && parsedList[profile]) {
			this.leftLock = parsedList[profile].leftLock
		}
		if (this.leftLock == '1') {
			this.mouseKeys.forEach((e: any, index: number) => {
				if (index === 0) {
					e.disabled = true;
				}
			});
		} 
		this.init()
	}
	public getMouseKays() {
		this.keyConf?.forEach((k: any, i: number) => {
			this.mouseKeys[i] = {
				...k,
				key: k.data?.key || k.name || EDmsMouseBtnAction[i].key,
				value: k.data?.value || EDmsMouseBtnAction[i].value,
			}
			if (k.mouseKey === this.activeMouseKey) {
				this.funType = k.type
				this.currentMouseKey = k.data.value
			}
		})
	}	
	public init() {
		const obs: any = this.device.json.keys
			.filter(v => v.custom)
			.map(k => [this.device.getMouseBtnInfo(k.index), k])
		
		const obj: Object[] = []
		const run = () => {
			const info = obs.shift()
			info[0].subscribe((v: any) => {
				obj.push({...info[1], ...v});
				if (obs.length) {
					run()
				} else {
					this.keyConf = obj;
					this.getMouseKays()
				}
			})
		}
		run()
	}
	
	public resetKey() {
		this.device.recovery({tagVal: 1, profile: this.device.profile}).subscribe(() => {
			this.device.getBaseInfo().subscribe(() => {
				this.msg.success(this.i18n.instant('notify.success'))
				this.init()
			})
		})
	}

	public resetFun() {
		this.device.recovery({tagVal: 2, value: this.activeMouseKey}).subscribe(() => {
			this.device.getBaseInfo().subscribe(() => {
				this.msg.success(this.i18n.instant('notify.success'))
				this.init()
			})
		})
	}

	public tipModal = false

	public setActive(k: number) {
		if (k === 0 && this.leftLock === "1") {
			this.tipModal = true
			return
		}
		this.activeMouseKey = k
		this.activeModal = ''
		this.keyChange.setMouseKey(k)
		this.init()
	}

	public getActiveMouseName() {
		const name = this.mouseKeys.find((e: { mouseKey: number; })=>{
			return e.mouseKey === this.activeMouseKey
		})
		return name.title
	}
	public setSelectActive(active: number, type: number) {
		let v = this.activeMouseKey;
		if (v || v === 0) {
			if (type=== this.funBtnKeys.Mouse) { // 基础按键
				this.device.setMouseBtn2Action(v, active)
					.subscribe(() => {
						this.init()
						this.msg.success(this.i18n.instant('notify.success'))
					})
			} else if (type === this.funBtnKeys.Dpi) { // 灵敏度
				this.device.setMouseBtn2Dpi(v, active)
					.subscribe(() => {
						this.init()
						this.msg.success(this.i18n.instant('notify.success'))
					})
			} else if (type === this.funBtnKeys.Media) { // 多媒体
				this.device.setMouseBtn2Media(v, active)
					.subscribe(() => {
						this.init()
						this.msg.success(this.i18n.instant('notify.success'))
					})
			} else if (type === this.funBtnKeys.ShortCut) { // 快捷键
				this.device.setMouseBtn2ShortCut(v, active)
					.subscribe(() => {
						this.init()
						this.msg.success(this.i18n.instant('notify.success'))
					})
			} else if (type === this.funBtnKeys.disable) { // 禁用
				this.device.disableMouseBtn(v)
					.subscribe(() => {
						this.init()
						this.msg.success(this.i18n.instant('notify.success'))
					})
			} else if (type === this.funBtnKeys.Light) { //切换灯光
				this.device.setMouseBtn2Light(v, active)
					.subscribe(() => {
						this.init()
						this.msg.success(this.i18n.instant('notify.success'))
					})
			}
		}
	}
	public setMacro(value: string) {
		const m = this.macroList.find((e)=>e.id===value)
		
		const { list, delayMode, delayNum, loopMode, loopNum } = m
		if (list.length > 200) {
			this.msg.warn(this.i18n.instant('notify.macroSizeLimit'))
			return
		}
		const delay = ['none', 'dynamic'].includes(delayMode) ? 0 : delayNum
		this.device.setMacro({
			mouseKey: this.activeMouseKey,
			// @ts-ignore
			loopType: EDmsMacroLoopKey[loopMode],
			loopCount: loopNum,
			delay,
			macro: dmsSerializeMacro(list)
		}).subscribe(() => {
			this.init()
			this.msg.success(this.i18n.instant('notify.success'))
		})
	}
}
