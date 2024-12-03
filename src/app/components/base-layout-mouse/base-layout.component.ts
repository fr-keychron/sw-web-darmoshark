import {Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from "@angular/core";
import {MsgService} from "../../service/msg/msg.service";
import {filter} from "rxjs/operators";
import {GLOBAL_CONFIG} from "../../config";
import {GetScale, imageEl2Base64} from "../../utils";
import {Subscription, fromEvent, firstValueFrom} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {EEventEnum, HidDeviceEventType, IMouseJson, MouseDevice} from "../../common/hid-collection";
import {DeviceConnectService} from "../../common/device-conncet/device-connect.service";

@Component({
	selector: 'base-layout-mouse',
	templateUrl: './base-layout.component.html',
	styleUrls: ['./base-layout.component.scss']
})
export class BaseLayoutMouseComponent implements OnInit {
	@Input() showCover = true; 
	@Input() showMouseButton = true;
	@Input() textAttach: TemplateRef<any>;
	@Input() left: TemplateRef<any>;
	@Input() right: TemplateRef<any>;
	constructor(
		private readonly service: DeviceConnectService,
		private readonly msg: MsgService,
		private readonly i18n: TranslateService,
	) {
	}

	public currentHidDevice?: MouseDevice;
	public hidDevices: Array<MouseDevice> = []
	public jsonConf: IMouseJson;

	public power = 0;
	public powerState = 0;
	public workMode: number;
	public leftLock: string;
	public deviceOptions: Array<{ label: string; value: number }> = [];
	public ConfigList = [0,1,2,3,4]
	public profile: number
	ngOnInit() {
		if (this.hidDevices) {
			this.hidDeviceInit()
		}
		this.hidConnectEvent()
	} 
	private hidConnectEvent() {
		this.service.event$
			.pipe(
				filter(v => v.type === EEventEnum.CONNECT)
			)
			.subscribe(() => {
				this.hidDevices = this.service.getHidDevices()
				this.hidDeviceInit()
			})
		this.service.event$
			.pipe(filter(v => v.type === EEventEnum.DISCONNECT))
			.subscribe(() => this.currentHidDevice = undefined)

		this.service.event$
			.pipe(filter(v => v.type === EEventEnum.CLOSED))
			.subscribe(() => {
				this.currentHidDevice = this.service.getCurrentHidDevice() as MouseDevice
			})
	}


	public currentHidDeviceId = 0
	public keys: Array<any>
	public mouseKeyActive: number = null

	@Input() keyChange: any;

	ngDoCheck() {
		if (this.keyChange) {
			this.mouseKeyActive = this.keyChange.getMouseKey()
		}
	}

	@Output() mouseKey: EventEmitter<number> = new EventEmitter<number>()

	public activeMouseKey($event: MouseEvent, i: number) {
		if (i === this.mouseKeyActive) return;
		this.mouseKeyActive = i
		this.keyChange.setMouseKey(i)
		this.mouseKey.next(i)
		$event.stopPropagation()
		$event.preventDefault()
	}

	@ViewChild('coverImage') coverImage: ElementRef<HTMLImageElement>

	private updateSub: Subscription;

	private hidDeviceInit() {
		const hidDevice = this.service.getCurrentHidDevice() as MouseDevice
		if (!hidDevice) return
		if (this.updateSub) this.updateSub.unsubscribe();
		this.updateSub = hidDevice.update$
			.pipe(filter(v => v.type === 'base'))
			.subscribe(v => {
				const {state, percent,} = v.data.power
				if (state === 3) this.power = percent
				this.powerState = state;
				this.workMode = v.data.workMode
			})
		const getHidConf = (h: MouseDevice) => {
			this.currentHidDevice = h;
			this.currentHidDeviceId = h.id;
			this.jsonConf = h.json;
			this.powerState = h.baseInfo.power.state
			this.power = h.baseInfo.power.value
			this.workMode = h.baseInfo.workMode
			this.profile = h.baseInfo.profile
			this.load(this.profile)
			this.getInfo()
		}
		if (hidDevice.loaded) {
			getHidConf(hidDevice)
		} else {
			hidDevice.event$
				.pipe(
					filter(v => v.type === HidDeviceEventType.Complete)
				)
				.subscribe(r => {
					getHidConf(hidDevice)
				})
		}
		let bAntiShike: boolean;
		let onResize: Subscription
		if(onResize) onResize.unsubscribe();
		onResize = fromEvent(window, 'resize').subscribe(() => {
			if(!this.currentHidDevice){
				onResize.unsubscribe();
			}
			if (!bAntiShike) {
				bAntiShike = true
				setTimeout(() => {
					this.setImgLayout()
					bAntiShike = false
				}, 100)
			}
		})
		const leftLockList = localStorage.getItem('leftLockList');

		if (!leftLockList) {
			const arr = [
				{ key: '0', leftLock: '1' },
				{ key: '1', leftLock: '1' },
				{ key: '2', leftLock: '1' },
				{ key: '3', leftLock: '1' },
				{ key: '4', leftLock: '1' }
			];
			localStorage.setItem('leftLockList', JSON.stringify(arr));
		} else {
			const parsedList = JSON.parse(leftLockList)
			if (Array.isArray(parsedList) && parsedList[this.profile]) {
				this.leftLock = parsedList[this.profile].leftLock
			} else {
				this.leftLock = "1"
			}
		}
	}

	public cover = '';
	private image: any
	private setImgLayout(){
		setTimeout(() => {
			if (!this.coverImage) return;
			const {width, height} = this.coverImage.nativeElement;
			const aspectX = width / this.image.width;
			const aspectY = height / this.image.height;
			this.keys = this.jsonConf.keys.map((v, i) => {
				const x = v.x * aspectX
				const y = v.y * aspectY
				const width = (v.w || 200) * GetScale() * aspectX

				return {
					...v, x, y,
					style: {left: x + 'px', top: y + 'px'},
					line: {
						left: (v.dir === "right" ? 0 : -1 * width) + 'px',
						width: width + 'px'
					},
					text: {
						left: (v.dir === "right" ? 1 : -1) *
							(width + (v.dir === "right" ? 0 : 70 * GetScale())) + 'px',
							top: '-13px'
					}
				}
			})
		}, 10)
	}

	private getImg(v: any) {
		let image: any
		const cover = GLOBAL_CONFIG.API + v.product.cover
		image = new Image()
		image.src = cover;
		image.crossOrigin = 'anonymous'
		image.onload = () => {
			this.image = image
			this.cover = imageEl2Base64(image);
			this.setImgLayout()
		}
	}

	private getInfo() {
		const data = this.currentHidDevice.productInfo.raw
		this.getImg(data)
	}

	@Output('load')
	mouseLoad: EventEmitter<number> = new EventEmitter<number>()

	public load(v: number) {
		this.mouseLoad.next(v)
	}

	public bodyClick($e: Event) {
		this.mouseKeyActive = null;
		this.mouseKey.next(this.mouseKeyActive)
		this.keyChange?.setMouseKey(null)
		$e.stopPropagation();
		$e.preventDefault()
	}

	public setConfig(e:number) {
		const device = this.service.getCurrentHidDevice() as MouseDevice
		device.switchConfig(e).subscribe(() => {
			device.getBaseInfo().subscribe(() => {
				this.load(this.profile)
				this.msg.success(this.i18n.instant('notify.success'))
				localStorage.setItem('profile', JSON.stringify(this.profile))
			})
		})
	}

	public reset(){
		const device = this.service.getCurrentHidDevice<MouseDevice>()
		device.recovery({value: 1, options: this.profile}).subscribe( () => {
			this.msg.success(this.i18n.instant('notify.success'))
			const leftLockList = localStorage.getItem('leftLockList')
			const parsedList = JSON.parse(leftLockList)
			parsedList[this.profile].leftLock = '1'
			localStorage.setItem('leftLockList', JSON.stringify(parsedList))
			this.load(this.profile)
		})
	}

	public importConfig() {
		const device = this.service.getCurrentHidDevice<MouseDevice>()
		const data = {
			mousebtnConf: device.baseInfo.mousebtnConf,
			dpiConf: device.baseInfo.dpiConf,
			lightConf:  device.baseInfo.lightConf,
			leftLock: this.leftLock,
		}
        const filename = `${device?.name} 配置0${this.profile+1}.json`;
        const link = document.createElement('a')
        const json = JSON.stringify(data)
        var blob = new Blob([json]);
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.target = '_blank'
        link.click()
        link.remove()
	}

	public exportConfig( $event: Event) {
		const input = $event.target as HTMLInputElement;
		const device = this.service.getCurrentHidDevice<MouseDevice>()
		if (input.files && input.files.length > 0) {
			const file = input.files[0]
			const reader = new FileReader()
			if (file.type.indexOf('json') < 0) {
				this.msg.error(this.i18n.instant("macro.fileTypeError"))
			}
			reader.readAsText(file)
			reader.onload = async () => {
				try {
					const data = JSON.parse(reader.result as string)
					device.baseInfo.mousebtnConf = data.mousebtnConf
					device.baseInfo.dpiConf = data.dpiConf
					device.baseInfo.lightConf = data.lightConf
					await firstValueFrom(device.setMouseBtnAll())
					await firstValueFrom(device.setMouseDpiAll())
					await firstValueFrom(device.setLightAll())
					await firstValueFrom(device.setExtConfAll())
					this.load(this.profile)
					input.value = ''
		
				} catch (error) {
					console.error("Error processing configuration:", error)
					this.msg.error(this.i18n.instant("macro.fileLoadError"))
					input.value = ''
				}
			};
		}
        
	}
}
