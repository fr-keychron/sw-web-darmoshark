import {Component, OnInit,} from "@angular/core";
import {Subscription} from "rxjs";
import {
	MouseDevice,
	MacroList, 
	dmsSerializeMacro,
	handleMouseKey,
	EDmsMousseBtnLight,
	EMouseBtn,
	EMouseBtnDpi,
	EMouseBtnMedia,
	EMousseBtnShortcut,
	EMouseBtnAction,
	serializeMacro,
	EMacroLoopKey
} from "../../../common/hid-collection";
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";
import {TranslateService} from "@ngx-translate/core";
import {MsgService} from "src/app/service/msg/msg.service";
@Component({
	selector: "mouse-key",
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
		key: EMouseBtnAction[0].key,
		value: EMouseBtnAction[0].value,
		keyType: 0,
	}, {
		mouseKey: 1,
		key: EMouseBtnAction[2].key,
		value: EMouseBtnAction[2].value,
		keyType: 0,
	}, {
		mouseKey: 2,
		key: EMouseBtnAction[1].key,
		value: EMouseBtnAction[1].value,
		keyType: 0,
	}, {
		mouseKey: 3,
		key: EMouseBtnAction[3].key,
		value: EMouseBtnAction[3].value,
		keyType: 0,
	}, {
		mouseKey: 4,
		key: EMouseBtnAction[4].key,
		value: EMouseBtnAction[4].value,
		keyType: 0,
	}];
	public sensitiveAction = EMouseBtnDpi
	public mediaAction = EMouseBtnMedia
	public shortcutAction = EMousseBtnShortcut
	public lightAction = EDmsMousseBtnLight
	public funBtnKeys = EMouseBtn
	public macroList: MacroList[]
	public activeMouseKey: number = 1;
	public mouseAction = EMouseBtnAction.filter(btn => !['scrollLeftClick', 'scrollRightClick'].includes(btn.key))
	public activeModal: string | null = null;
	public leftLock:string = "1"
	public showLight = false
	ngOnInit() {
		this.keyChange.setMouseKey(this.activeMouseKey)
		const device = this.service.getCurrentHidDevice() as MouseDevice
		if (device) {
			this.activeMouseKey = device.version === "dms" ? 1 : 2
			this.showLight = device.version === "dms"
		}
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
		this.activeMouseKey
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
				key: k.data?.key || k.data?.name || k.title || EMouseBtnAction[i].key,
				value: k.data?.value || EMouseBtnAction[i].value,
			}
			if (k.mouseKey === this.activeMouseKey) {
				const btnMouseActive = EMouseBtnAction.find(
					(v) => v.key === k.title
				);
				this.funType = k.type
				if(k.type === EMouseBtn.disable || k.type === EMouseBtn.GameReinforce || k.type === EMouseBtn.Keyboard){
					this.currentMouseKey = null
				}else{
					this.currentMouseKey = k.data?.value || (!k.type ? btnMouseActive?.value : undefined)  || EMouseBtnAction[i].value;
				}
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
		this.device.recovery({tagVal: 2, value: 255}).subscribe(() => {
			this.device.getBaseInfo().subscribe(() => {
				this.msg.success(this.i18n.instant('notify.success'))
				this.init()
			})
		})
	}

	public resetFun() {
		this.device.removeMouseBtn(this.activeMouseKey).subscribe(() => {
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
		return name.name
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
				this.funType = this.funBtnKeys.disable
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
		
		const { list, delayMode, delayNum, loopMode, loopNum, id} = m
		if (list.length > 200) {
			this.msg.warn(this.i18n.instant('notify.macroSizeLimit'))
			return
		}
		const macroIndex = this.mouseKeys.filter((e: { type: EMouseBtn; })=>e.type === EMouseBtn.Macro)
		const activeIndex = this.mouseKeys.find((e: { type: EMouseBtn; mouseKey: number; })=>{return e.mouseKey === this.activeMouseKey && e.type === EMouseBtn.Macro})
		
		const delay = ['none', 'dynamic'].includes(delayMode) ? 0 : delayNum
		this.device.setMacro({
			mouseKey: this.activeMouseKey,
			// @ts-ignore
			loopType: EMacroLoopKey[loopMode],
			loopCount: loopNum,
			delay,
			macro: this.device.version === 'dms' ? dmsSerializeMacro(list) : serializeMacro(list),
			macroIndex: activeIndex?.data.index ?? macroIndex.length,
			macroId: id
		}).subscribe(() => {
			this.init()
			this.msg.success(this.i18n.instant('notify.success'))
		})
	}
}
