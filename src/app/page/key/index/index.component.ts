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
	EDmsMousseBtnLight
} from "../../../common/hid-collection";
import {DeviceConnectService} from "../../../common/device-conncet/device-connect.service";
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
	public currentMouseKey: number|string;
	public keyChange: handleMouseKey = new handleMouseKey()
	public mouseKeys = JSON.parse(JSON.stringify(EDmsMouseBtnAction.filter(item => item.mouseKey || item.mouseKey === 0)))
	public sensitiveAction = EDmsMouseBtnDpi
	public mediaAction = EDmsMouseBtnMedia
	public shortcutAction = EDmsMouseBtnShortcut
	public lightAction = EDmsMousseBtnLight
	public macroList: MacroList[]
	public activeMouseKey: number = 1;
	public mouseButtons= EDmsMouseBtnAction 
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
		this.keyConf.forEach((conf: any) => {
			this.mouseKeys.forEach((e: any) => {
				if (e.mouseKey === conf.mouseKey) {
					e.key = conf.data?.key 
					e.value = conf.data?.value 
					e.type = conf.data?.type 
					e.data = conf.data?.data 
				}
			});
		});
		this.mouseKeys.sort((a: { mouseKey: number }, b: { mouseKey: number }) => a.mouseKey - b.mouseKey);
		const currentMouseType = this.mouseKeys.find((e:{ mouseKey: number, type: string})=>{
			return e.mouseKey === this.activeMouseKey
		})
		if(currentMouseType?.type != 'mouseMacro' ){
			this.currentMouseKey =  currentMouseType?.type  || currentMouseType.value
		}
		if (Object.values(EDmsMouseGame).includes(currentMouseType?.type)){
			this.activeModal = 'gameReinforce'
		}
		if(currentMouseType?.type === 'mouseKeyboard' ){
			this.activeModal = 'combination'
		}
		console.log(this.mouseKeys);
		
	}	
	public init(): Promise<void> {
		return new Promise((resolve) => {
			if(!this.device) return
			this.device.getMouseBtnsInfo().subscribe(
				(v: any) => {
					this.keyConf = this.device.baseInfo.mousebtnConf
					this.getMouseKays()
				}
			)
			resolve();
		});
	}
	
	public resetKey() {
		this.device.recovery({value: 2, options:255}).subscribe(() => {
			this.msg.success(this.i18n.instant('notify.success'))
			this.setActive(1)
			this.init()
		})
	}

	public resetFun() {
		this.device.recovery({value: 2, options:this.activeMouseKey}).subscribe(() => {
			this.msg.success(this.i18n.instant('notify.success'))
			this.init()
		})
	}

	public tipModal = false

	public transform(array: any[], value: any): boolean {
        return array.some(item => item.value === value);
    }

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

	public setSelectActive(active: any ) {
		this.device.setMouseBtn(this.activeMouseKey, active)
			.subscribe(() => {
				this.init()
				this.msg.success(this.i18n.instant('notify.success'))
			})
	}

	public setMacro(value: string) {
		const m = this.macroList.find((e)=>e.id===value)
		const {list, delayMode, delayNum, loopMode, loopNum, name} = m
		if (list.length > 200) {
			this.msg.warn(this.i18n.instant('notify.macroSizeLimit'))
			return
		}
		const delay = ['none', 'dynamic'].includes(delayMode) ? 0 : delayNum
		this.device.setMouseMacro(this.activeMouseKey)
		.subscribe(() => {
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
		})
	}
}
