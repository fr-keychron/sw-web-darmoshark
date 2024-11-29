import {Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from "@angular/core";
import {MsgService} from "../../service/msg/msg.service";
import {TranslateService} from "@ngx-translate/core";
import {MerchandiseService} from "../../service/merchandise/merchandise.service";
import {filter, map} from "rxjs/operators";
import {GLOBAL_CONFIG} from "../../config";
import {GetScale, imageEl2Base64} from "../../utils";
import {Subscription, fromEvent} from "rxjs";
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
		private readonly mouseService: DeviceConnectService
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
	ngOnInit() {
		this.leftLock = localStorage.getItem('leftLock')
		if (this.hidDevices) {
			this.hidDeviceInit()
		}
		this.hidConnectEvent()
	} 
	private hidConnectEvent() {
		this.mouseService.event$
			.pipe(
				filter(v => v.type === EEventEnum.CONNECT)
			)
			.subscribe(() => {
				this.hidDevices = this.mouseService.getHidDevices()
				this.hidDeviceInit()
			})
		this.mouseService.event$
			.pipe(filter(v => v.type === EEventEnum.DISCONNECT))
			.subscribe(() => this.currentHidDevice = undefined)

		this.mouseService.event$
			.pipe(filter(v => v.type === EEventEnum.CLOSED))
			.subscribe(() => {
				this.currentHidDevice = this.mouseService.getCurrentHidDevice() as MouseDevice
				console.log(this.currentHidDevice);
				
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
		const hidDevice = this.mouseService.getCurrentHidDevice() as MouseDevice
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
			this.load(true)
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
	mouseLoad: EventEmitter<boolean> = new EventEmitter<boolean>()

	public load(v: boolean) {
		this.mouseLoad.next(v)
	}

	public bodyClick($e: Event) {
		this.mouseKeyActive = null;
		this.mouseKey.next(this.mouseKeyActive)
		this.keyChange?.setMouseKey(null)
		$e.stopPropagation();
		$e.preventDefault()
	}

}
