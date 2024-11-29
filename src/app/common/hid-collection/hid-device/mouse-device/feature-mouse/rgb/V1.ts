import {Observable} from "rxjs";
import {filter} from "rxjs/operators";
import {MouseDevice} from "../../base";
import {VersionFactory} from ".";
import {Light} from "../../types";

VersionFactory.inject(
	(s) => s === "1",
	(device: MouseDevice) => new MOUSE_RGB_V1(device)
);

export class MOUSE_RGB_V1 {
	private readonly mouse: MouseDevice;

	constructor(mouse: MouseDevice) {
		this.mouse = mouse;
		this.mouse.profileCount = 0;
	}
	/**
	 * light 灯效
	 * 0x12 灯效工作模式读取
	 * 0x13 灯效亮度读取
	 * 0x14/15/16 灯效R/G/B值读取
	 * 0x17 灯效速度
	 * 0x22 全模式灯效设置
	 * 0x24/25/26 R/G/B设置
	 */
	// 灯效
	public getLight() {
		return new Observable((s) => {
			const iLight = (index: number) => {
				const buf = MouseDevice.Buffer(20);
				buf[0] = 0x18;
				buf[1] = index;

				const subj = this.mouse.report$
					.pipe(filter(v => v[1] === 0x18))
					.subscribe((v: any) => {
						if (v) {
							// console.log(v);
							const r = v.slice(2)
							const data = {
								lightMode: (r[4] || r[5]) ? (r[0] + 1) : r[0],
								brightness: r[4],
								speed: r[5],
								rgbArr: [r[1], r[2], r[3]],
								currentColor: `rgb(${r[1]},${r[2]},${r[3]})`
							}
							s.next(data);
						}
						subj.unsubscribe();
					});
				this.mouse.write(0x51, buf, 2).subscribe();
			}

			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x12;
			const subj = this.mouse.report$
				.pipe(filter(v => v[1] === 0x12))
				.subscribe((v: any) => {
					if (v) {
						const r = v.slice(4)
						iLight(r[0])
					}
					subj.unsubscribe();
				});
			this.mouse.write(0x51, buf, 2).subscribe();
		});
	}

	public setLight(data: Light) {
		return new Observable((res) => {
			const {i, l, s, r, g, b, type} = data
			
			switch(type){
				case 1: // 灯效模式
					this.setLightM(i).subscribe((r) => {
						this.getLight().subscribe()
						res.next(r);
					})
					break;
				case 2: // 灯效亮度
					this.setLightL(l, i).subscribe((r) => {
						res.next(r);
					})
					break;
				case 3: // 灯效速度
					this.setLightS(s, i).subscribe((r) => {
						res.next(r);
					})
					break;
				default: // 灯效颜色
					this.setLightC([r,g,b], i).subscribe((r) => {
						res.next(r);
					})
					break;
			}
		});
	}

	public setLightM(i: number){
		return new Observable((res) => {
			const indexBuf = MouseDevice.Buffer(20);
			indexBuf[0] = 0x22
			indexBuf[1] = 0x01
			indexBuf[2] = i
			
			this.mouse.write(0x51, indexBuf, 3).subscribe((r) => {
				res.next(r);
			});
		})
	}
	public setLightL(val: number, i: number){
		return new Observable((res) => {
			const indexBuf = MouseDevice.Buffer(20);
			indexBuf[0] = 0x23
			indexBuf[1] = 0x01
			indexBuf[2] = i
			indexBuf[3] = val
			
			this.mouse.write(0x51, indexBuf, 3).subscribe((r) => {
				res.next(r);
			});
		})
	}
	public setLightS(val: number, i: number){
		return new Observable((res) => {
			const indexBuf = MouseDevice.Buffer(20);
			indexBuf[0] = 0x27
			indexBuf[1] = 0x01
			indexBuf[2] = i
			indexBuf[3] = val
			
			this.mouse.write(0x51, indexBuf, 3).subscribe((r) => {
				res.next(r);
			});
		})
	}
	public setLightC(val:number[], i: number){
		const [r,g,b] = val
		return new Observable((res) => {
			const buf = MouseDevice.Buffer(20);
			buf[0] = 0x28
			buf[1] = 0x01
			buf[2] = i
			buf[3] = r
			buf[4] = g
			buf[5] = b
			this.mouse.write(0x51, buf, 3).subscribe((r) => {
				res.next(r);
			});
		})
	}
}
