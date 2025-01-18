import {Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from "@angular/core";
import {MsgService} from "../../service/msg/msg.service";
import {filter} from "rxjs/operators";
import {GLOBAL_CONFIG} from "../../config";
import {GetScale, imageEl2Base64} from "../../utils";
import {Subscription, fromEvent, firstValueFrom} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {EEventEnum, EMouseBtn, HidDeviceEventType, IMouseJson, MouseDevice} from "../../common/hid-collection";
import {DeviceConnectService} from "../../service/device-conncet/device-connect.service";
import { cloneDeep } from 'lodash';

@Component({
	selector: 'base-layout-mouse',
	templateUrl: './base-layout.component.html',
	styleUrls: ['./base-layout.component.scss']
})
export class BaseLayoutMouseComponent implements OnInit {
	@Input() showCover = true; 
	@Input() showMouseButton = true;
	@Input() showCoverSelect = false
	@Input() textAttach: TemplateRef<any>;
	@Input() left: TemplateRef<any>;
	@Input() right: TemplateRef<any>;
	@Output() imgUpdate = new EventEmitter<any>();
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
	public images:{cover:string, i18:string}[] = []
	public coverUrl: string = ''
	public deviceName: string = ''
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
			.subscribe(() => {
				this.currentHidDevice = undefined;
				this.cover = '';
			})

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
		
		const getHidConf = (h: MouseDevice) => {
			this.currentHidDevice = h;
			this.currentHidDeviceId = h.id;
			this.jsonConf = h.json;
			this.powerState = h.baseInfo.power.state
			this.power = h.baseInfo.power.value
			this.workMode = h.workMode
			this.profile = h.baseInfo.profile
			this.images = this.jsonConf?.images
			this.deviceName = hidDevice.name
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

	public getImg(v: string) {
		let image: any
		const cover = GLOBAL_CONFIG.API + v
		this.coverUrl = v
		sessionStorage.setItem('cover', v);
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
		const coverImage = sessionStorage.getItem('cover');
		this.getImg(coverImage || data.product.cover)
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
		device.switchProfile(e).subscribe(() => {
			this.load(this.profile)
			this.msg.success(this.i18n.instant('notify.success'))
			localStorage.setItem('profile', JSON.stringify(this.profile))
		})
	}

	public reset(){
		const device = this.service.getCurrentHidDevice<MouseDevice>()
		device.recovery({tagVal: 1, profile: this.profile}).subscribe( () => {
			this.msg.success(this.i18n.instant('notify.success'))
			const leftLockList = localStorage.getItem('leftLockList')
			const parsedList = JSON.parse(leftLockList)
			parsedList[this.profile].leftLock = '1'
			localStorage.setItem('leftLockList', JSON.stringify(parsedList))
			this.load(this.profile)
		})
	}

	public getMousebtnConf(): Promise<Object[]> {
		return new Promise((resolve, reject) => {
			const device = this.service.getCurrentHidDevice<MouseDevice>();
			const obs: any[] = device.json.keys
				.filter((v) => v.custom)
				.map((k) => [device.getMouseBtnInfo(k.index), k]);
	
			const obj: Object[] = [];
			const run = () => {
				if (obs.length === 0) {
					resolve(obj);
					return;
				}
				const info = obs.shift();
				info[0].subscribe({
					next: (v: any) => {
						obj.push({ ...v });
						run();
					},
				});
			};
			run();
		});
	}
	public getLightConf(): Promise<Object[]> {
		return new Promise((resolve, reject) => {
			const device = this.service.getCurrentHidDevice<MouseDevice>();
			device?.getLight().subscribe((r: any)=>{
				resolve(r);
				return;
			})
		});
	}
	public async importConfig() {
		const device = this.service.getCurrentHidDevice<MouseDevice>()
		const convertedLevelVal = device.baseInfo.dpiConf.levelVal.reduce((acc, value, index, array) => {
			if (index % 2 === 0) {
			  	acc.push([array[index], array[index + 1]]);
			}
			return acc;
		}, []);
		const newBaseInfo = cloneDeep(device.baseInfo);
		newBaseInfo.dpiConf.levelVal = convertedLevelVal;
		const data = {
			mousebtnConf: await this.getMousebtnConf(),
			baseInfo: newBaseInfo,
			lightConf: await this.getLightConf(),
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
					const data = JSON.parse(reader.result as string);
					
					for (const e of data.mousebtnConf) {
						if (e.type == EMouseBtn.Mouse) {
							await firstValueFrom(device.setMouseBtn2Action(e.mouseKey, e.data.value));
						}
						if (e.type == EMouseBtn.Keyboard) {
							await firstValueFrom(device.setMouseBtn2KeyBoard(e.mouseKey, e.data.shiftKey, e.data.key1.value));
						}
						if (e.type == EMouseBtn.GameReinforce) {
							await firstValueFrom(device.setMouseBtn2Game(e.mouseKey, e.data));
						}
						if (e.type == EMouseBtn.ShortCut) {
							await firstValueFrom(device.setMouseBtn2ShortCut(e.mouseKey, e.data.value));
						}
						if (e.type == EMouseBtn.Light) {
							await firstValueFrom(device.setMouseBtn2Light(e.mouseKey, e.data.value));
						}
						if (e.type == EMouseBtn.disable) {
							await firstValueFrom(device.disableMouseBtn(e.mouseKey));
						}
						if (e.type == EMouseBtn.Dpi) {
							await firstValueFrom(device.setMouseBtn2Dpi(e.mouseKey, e.data.value));
						}
						if (e.type == EMouseBtn.Media) {
							await firstValueFrom(device.setMouseBtn2Media(e.mouseKey, e.data.value));
						}
					}
					const { lightMode, brightness, speed, rgbArr } =  data.lightConf
					const lightInfo = {
						i: lightMode,
						l: brightness,
						s: speed,
						r: rgbArr[0],
						g: rgbArr[1],
						b: rgbArr[2]
					}
					const { sleep, delay, usb, gears, dpiConf, sys  } =  data.baseInfo
					await firstValueFrom(device.setLight(lightInfo))
					await firstValueFrom(device.setExtConf(sys))
					await firstValueFrom(device.setDpi({
						current: usb.dpi,
						level: 0,
						gears: gears,
						values: dpiConf.levelVal
					}))
					await firstValueFrom(device.setReportRate({
						level: usb.reportRate,
						values: []
					}))
					await firstValueFrom(device.setExtConf(sys))
					await firstValueFrom(device.setBtnTime({btnRespondTime: delay, sleepTime: sleep}))
					this.load(this.profile)
					input.value = ''
					this.msg.success(this.i18n.instant('notify.success'))
		
				} catch (error) {
					console.error("Error processing configuration:", error)
					this.msg.error(this.i18n.instant("macro.fileLoadError"))
					input.value = ''
				}
			};
		}
	}

	public getGradient(colors: string[]): string {
		if (colors.length === 2) {
			return `linear-gradient(to bottom, ${colors[0]} 50%, ${colors[1]} 50%)`;
		} else if (colors.length === 1) {
			return colors[0];
		} else {
			return 'transparent';
		}
	}
	
}
