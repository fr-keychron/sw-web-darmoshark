import { Component, OnInit } from "@angular/core";
import { MsgService } from "src/app/service/msg/msg.service";
import { TranslateService } from "@ngx-translate/core";
import { MouseDevice} from "../../../common/hid-collection";
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";
import { Subject, Subscription} from 'rxjs';
@Component({
	selector: "mouse-light",
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	constructor(
		private readonly service: DeviceConnectService,
		private readonly msgService: MsgService,
		private readonly i18n: TranslateService
	) {
	}
	public speedMax: number = 0xff
	public lightMode = 2
	public currentColor = ''
	public rgbArr: number[] = [255,255,255]
	public speed: number = 0xff
	public brightness: number = 0xff
	public hsl: number[]
	public saturation: number
	public isInitialized: boolean = false;
	readonly staticColors = [{
		color: [255, 0, 0],
	},{
		color: [255, 255, 0],
	},{	
		color: [0, 0, 255],
	},{
		color: [0, 255, 0],
	},{
		color: [255, 0, 255],
	},{
		color: [255, 170, 0],
	},{
		color: [255, 255, 255],
	}]

	ngOnInit(): void {
	}
	/**父组件传递方法：鼠标值变化时执行 */
	public load($e: number) {
		if (this.deviceSub) this.deviceSub.unsubscribe()
		this.init()
	}
	public init(){
		const device = this.service.getCurrentHidDevice<MouseDevice>();
		if(device) {
			this.speedMax = device.version === "dms" ? 4 : 255
			device.getLight().subscribe((r: any)=>{
				console.log(r);
				
				this.lightMode = r.lightMode
				this.brightness = r.brightness
				this.speed = r.speed
				this.rgbArr = r.rgbArr
				this.currentColor = r.currentColor
				this.saturationUpdata()
			})
			setTimeout(()=>{
				this.isInitialized = true;
			},100)
		}
		
	}

	// 取色器
	public colorPicker(e: any){
		console.log('colorPicker');
		
		this.rgbArr = this.parseRgbString(e);
		this.setRGB()
	}
	private parseRgbString(rgbString: string): number[] {
		const result = rgbString.match(/rgb\((\d+), (\d+), (\d+)\)/);
		if (result) {
		  return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];
		}
		return [0, 0, 0]; 
	  }
	// 常用色
	public colorChange(color: number[]){
		console.log('colorChange');
		
		this.rgbArr = [...color]
		this.setRGB()
	}
	// 饱和度
	public saturationChange(){
		this.hsl[1] = this.saturation/100
		this.rgbArr = this.hslToRgb(this.hsl)
		this.setRGB()
	}

	private deviceSub: Subscription;
	private updateSub: Subscription;

	ngOnDestroy() {
		if (this.deviceSub) this.deviceSub.unsubscribe()
		if (this.updateSub) this.updateSub.unsubscribe()
	}

	private throttleTimer: any = null;

	public setRGB() {
		if (!this.isInitialized) return;
		if (this.throttleTimer !== null) return;

		this.throttleTimer = setTimeout(() => {
			const [r, g, b] = this.rgbArr;
			console.log('setRGB', this.rgbArr);
			
			this.currentColor = `rgb(${r},${g},${b})`;
			const device = this.service.getCurrentHidDevice<MouseDevice>();
			device.setLight({
				i: this.lightMode,
				l: this.brightness,
				s: this.speed,
				r,
				g,
				b,
			}).subscribe();
			this.saturationUpdata();
			this.throttleTimer = null;
		}, 300);
	}


	// 恢复出厂设置
	public reset(){
		const device = this.service.getCurrentHidDevice<MouseDevice>();
		device.setLight({
			i: 0,
			l: 255,
			s: 4,
			r:255, 
			g:255, 
			b:255,
		}).subscribe( () => {
			this.init()
			this.msgService.success(this.i18n.instant('notify.success'))
		})
	}

	private saturationUpdata(){
		this.hsl = this.rgbToHsl(this.rgbArr)
		this.saturation = this.hsl[1]*100
	}

	// rgb -> hsl
	private rgbToHsl([r, g, b]: number[]){
		r /= 255;
		g /= 255;
		b /= 255;
			const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;

		let h, s, l = (max + min) / 2;

		if (delta === 0) {
			h = 0; // achromatic (gray)
			s = 0;
		} else {
			s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

			switch (max) {
				case r: 
					h = (g - b) / delta + (g < b ? 6 : 0);
					break;
				case g: 
					h = (b - r) / delta + 2;
					break;
				case b: 
					h = (r - g) / delta + 4;
					break;
			}

			h /= 6;
		}

		return [h, s, l];
	}

	// hsl -> rgb
	private hslToRgb([h, s, l]: number[]) {
		let r, g, b;

		if (s === 0) {
			r = g = b = l; // 无饱和度,颜色为灰色
		} else {
			const hue2rgb = (p: number, q: number, t: number) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	public rgbaChange($event: Event, index: number) {
		const target = $event.target as HTMLInputElement
		const val = Number(target.value);
		target.value = target.value.replace(/[^\d]/g, '');
		if (val > 255) {
			 target.value = '255'
			 this.rgbArr[index] = 255;
		}
		this.setRGB()
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
}
