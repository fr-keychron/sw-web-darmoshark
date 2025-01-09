import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {MsgService} from "../msg/msg.service";
import {HttpClient} from "@angular/common/http";
import {
	EDeviceType,
	EEventEnum,
	EFrConnectState,
	HidCollection,
	IEvent,
	KeyboardDevice,
	MouseDevice,
	productFirmware
} from "../../common/hid-collection";
import {fromEvent, Observable, Subject} from "rxjs";
import {filter, map} from "rxjs/operators";
import {BridgeDevice} from "../../common/hid-collection/hid-device/device-dfu/bridge-device";
import {IKeyBoardDef} from "../../model";
import {MerchandiseService} from '../merchandise/merchandise.service'
import { GLOBAL_CONFIG } from "src/app/config";
import { ByteUtil } from "src/app/utils";

@Injectable({providedIn: 'root'})
export class DeviceConnectService {
	constructor(
		private readonly i18n: TranslateService,
		private readonly merchandise: MerchandiseService,
		private readonly msg: MsgService,
		private readonly http: HttpClient
	) {
		this.support = 'hid' in window.navigator;
		if ((<any>navigator).hid) {
			(<any>navigator).hid.addEventListener('disconnect', (e: any) => {
				this.disconnect()
				this.hidCollection = []
			});
		}
	}

	public support: boolean;
	public loadByKeyboardDef = false;
	public keyboardDef: IKeyBoardDef

	public event$: Subject<IEvent> = new Subject<IEvent>()

	public currentDevice: KeyboardDevice | MouseDevice | BridgeDevice;

	private hidCollection: Array<HidCollection> = [];
	private device: HidCollection

	public getCollection() {
		return this.hidCollection;
	}

	public getCollectionAt(i: number): HidCollection {
		if (!this.hidCollection.length) return undefined;
		return this.hidCollection[i]
	}

	public getHidDevices(): Array<any> {
		if (this.currentDevice) return [this.currentDevice]
		return []
	}

	public getCurrentHidDevice<T extends KeyboardDevice | MouseDevice>(): T {
		return this.currentDevice as T
	}

	static vendorProductId(vendorId: number, productId: number) {
		return vendorId * 65536 + productId;
	}

	public requestDevice(filters?: any[]): Observable<any> {
		return new Observable(s => {
			// @ts-ignore
			const requestedDevice = navigator.hid.requestDevice({
				filters: filters || [{
					//鼠标DMS
					usage: 0x01,
					usagePage: 0xff0a,
				}]
			}).then((r: any) => {
				if (!r.length) {
					s.error(this.i18n.instant('notify.emptyHid'))
					return
				}
				const id = DeviceConnectService.vendorProductId(r[0].vendorId, r[0].productId)
				this.device = new HidCollection(this.http, this.i18n)
				this.hidCollection[0] = this.device

				this.getDeviceInfo(id, r).subscribe()

				this.device.event$
					.pipe(filter(v => v.type === EEventEnum.Update && v.deviceType === EDeviceType.Bridge))
					.subscribe(v => {
						if (v.data.connect === EFrConnectState.disconnect) {
							this.disconnect()
							this.msg.error(this.i18n.instant('notify.fr_not_connect'))
						}
					})
				this.device.event$
					.pipe(filter(v => v.type === EEventEnum.CONNECT))
					.subscribe(v => {
						this.currentDevice = v.data.currentHidDevice;
						this.event$.next(v)
					})

			}).catch(() => {
				s.error(this.i18n.instant('notify.hidAlreadyConnected'))
			})
		})
	}
	// 键盘
	private createByKeyboard(colls: any, product: any, id?: number){
		colls.forEach(({ usagePage, usage, hid }: any) => {
			if(usagePage === 0xff60 && usage=== 0x61){
				this.device.createKeyboard(hid, {
					json: this.keyboardDef,
					loadByJson: this.loadByKeyboardDef,
					product
				}).subscribe({error: (r)=>{
					this.msg.error(r)
				}})
			}
		});
	}
	// 鼠标
	private createByMouse(colls: any, product: any, id?: number){
		const usageId = (n1: number, n2: number) => n1 << 16 | n2;
		let mHid: any
		if (colls.length === 1) {
			mHid = colls[0]?.hid
		} else {
			colls.forEach(({ usagePage, usage, hid }: any) => {
				if (usagePage === 0xff60 && usage=== 0x61) {
					mHid = colls.find((c: any) => c.usagePage === 0x8c && c.usage === 0x01)?.hid
				}
				if ((usagePage === 0xffc1 || usagePage === 0xff0a ) && usage=== 0x01) {
					const host = GLOBAL_CONFIG.API + `mouse/${id}.json`
					this.http.get(host).subscribe({
						next: (json: any) => {
							this.device.createMouse(hid, { product: JSON.parse(JSON.stringify(product)), json }).subscribe()
						}, error: () => {
							this.msg.error(this.i18n.instant('notify.hidConfNotFound'))
						}
					})
				}
				
			})
		}
		// 1K Mouse
		if (mHid) {
			const host = GLOBAL_CONFIG.API + `mouse/${id}.json`
			this.http.get(host).subscribe({
				next: (json: any) => {
					if(usageId(0x01, 0xff0a) === usageId(colls[0].usage, colls[0].usagePage)){
						product.contract = "dms"
					} else{
						product.contract = "M"
					}
					this.device.createMouse(mHid, { product: JSON.parse(JSON.stringify(product)), json })
					.subscribe({
						error: (e) => {
							this.event$.next({type: EEventEnum.DISCONNECT, data: this})
							this.msg.error(e)
						}
					})
				}, error: () => {
					this.msg.error(this.i18n.instant('notify.hidConfNotFound'))
				}
			})
		}
	}
	// 接收器
	private createByDangle(colls: any){
		let run: any = []
		colls.forEach(({ usagePage, usage, hid }: any) => {
			if (usagePage === 0xff60 && usage === 0x61) {
				run[0]={
					hid,
					cb: new Observable((s) => {
						const statusBuf = MouseDevice.Buffer(32)
						statusBuf[0] = 0xb2;
						const sub = fromEvent(hid, 'inputreport')
						.pipe(
							map((r: any) => new Uint8Array(r.data.buffer)),
							filter((r: Uint8Array) => r[0]===0xb2)
						)
						.subscribe((v: any) => {
							const vid = `0x${ByteUtil.oct2Hex(v[3], 2, "")}${ByteUtil.oct2Hex(v[2], 2, "")}`;
							const pid = `0x${ByteUtil.oct2Hex(v[5], 2, "")}${ByteUtil.oct2Hex(v[4], 2, "")}`;
							const vpId = BridgeDevice.vendorProductId(ByteUtil.hex2Oct(vid), ByteUtil.hex2Oct(pid));
							this.merchandise.info({ variable: {id: vpId} })
								.subscribe(({data}: any) => {
									const keyboardData = {...data, workMode: 1}
									if (keyboardData.category.type === 0){
										s.next()
										this.createByKeyboard(colls, keyboardData)
									} else {
										s.next(1)
									}
								})
							sub.unsubscribe()
						})
						
						hid.sendReport(0, statusBuf)
					})
				}
			} else if (usagePage === 0xffc1 && usage === 0x01) {
				run[1]={
					hid,
					cb: new Observable((s) => {
						const statusBuf = MouseDevice.Buffer(20)
						statusBuf[0] = 0x3;
		
						const sub = fromEvent(hid, 'inputreport')
						.pipe(
							map((r: any) => new Uint8Array(r.data.buffer)),
							filter((r: Uint8Array) => r[0]===0x03)
						)
						.subscribe((v: any) => {
							const vid = `0x${ByteUtil.oct2Hex(v[3], 2, "")}${ByteUtil.oct2Hex(v[2], 2, "")}`;
							const pid = `0x${ByteUtil.oct2Hex(v[5], 2, "")}${ByteUtil.oct2Hex(v[4], 2, "")}`;
							const vpId = BridgeDevice.vendorProductId(ByteUtil.hex2Oct(vid), ByteUtil.hex2Oct(pid));
							this.merchandise.info({ variable: {id: vpId} })
								.subscribe(({data}: any) => {
									const mouseData = {...data, workMode: 1}
									if (mouseData.category.type === 1){
										this.createByMouse(colls, mouseData, vpId)
										s.next()
									} else {
										s.next(2)
									}
								})
							sub.unsubscribe()
						})

						hid.sendReport(0xb5, statusBuf)
					})
				}
			} else if (usagePage === 0xff0a && usage === 0x01) {
				run[1]={
					hid,
					cb: new Observable((s) => {
						let statusBuf = MouseDevice.Buffer(64)
						statusBuf[0] = 0x01;
						statusBuf[2] = 0x81
						statusBuf[3] = 0x01
						statusBuf[63] =  0xA1 - (statusBuf[0] + statusBuf[2] + statusBuf[3])
						const sub = fromEvent(hid, 'inputreport')
						.pipe(
							map((r: any) => new Uint8Array(r.data.buffer)),
							filter((r: Uint8Array) => r[0]===0x01)
						)
						.subscribe((v: any) => {
							const vid = `0x${ByteUtil.oct2Hex(v[6], 2, "")}${ByteUtil.oct2Hex(v[5], 2, "")}`;
							const pid = `0x${ByteUtil.oct2Hex(v[12], 2, "")}${ByteUtil.oct2Hex(v[11], 2, "")}`;
							const newPid = productFirmware.find((item) => item.productID.toLowerCase() === pid.toLowerCase())?.PID
							console.log(pid,newPid);
							
							const vpId = BridgeDevice.vendorProductId(ByteUtil.hex2Oct(vid), ByteUtil.hex2Oct(newPid));
							this.merchandise.info({ variable: {id: vpId} })
								.subscribe({
									next: ({data}: any) => {
										const mouseData = {...data, workMode: 1}
										if (mouseData.category.type === 1){
											this.createByMouse(colls, mouseData, vpId)
											s.next()
										} else {
											s.next(2)
										}
									}, error: () => {
										this.disconnect()
										this.msg.error(this.i18n.instant('notify.hidConfNotFound'))
									}
								})
							sub.unsubscribe()
						})
						hid.sendReport(0, statusBuf)
					})
				}
			} else {
				run[2] = {
					hid,
					cb: new Observable((s) => { // 1k Mouse
						const statusBuf = MouseDevice.Buffer(20)
						statusBuf[0] = 0x3;
						hid.sendFeatureReport(0x51, statusBuf).then(() => {
							hid.receiveFeatureReport(0x51).then((r: any) => {
								const data = new Uint8Array(r.buffer)
								let v = data.slice(1)
								const vid = `0x${ByteUtil.oct2Hex(v[3], 2, "")}${ByteUtil.oct2Hex(v[2], 2, "")}`;
								const pid = `0x${ByteUtil.oct2Hex(v[5], 2, "")}${ByteUtil.oct2Hex(v[4], 2, "")}`;
								const vpId = BridgeDevice.vendorProductId(ByteUtil.hex2Oct(vid), ByteUtil.hex2Oct(pid));
								if(!vpId) return;
								this.merchandise.info({ variable: {id: vpId} })
									.subscribe(({data}: any) => {
										const newData = {...data, workMode: 1}
										// if (newData.category.type === 0) {
										// 	this.createByKeyboard(colls, newData)
										// } else 
										if (newData.category.type === 1) {
											this.createByMouse(colls, newData, vpId)
										}
									})
							})
						}).catch((err: any) => {
							console.log(err);
						})
					})
				}
			}
		})
		
		for(let i = 0; i < 3; i++) {
			if(run[i]){
				if(run[i].hid.opened) {
					run[i].cb.subscribe()
				} else {
					run[i].hid.open().then(() => { 
						run[i].cb.subscribe()
					})
				}
			}
		}
	}

	private getDeviceInfo(id: number, hids: any) {
		return new Observable((s) => {
			const usageId = (n1: number, n2: number) => n1 << 16 | n2;
			this.merchandise.info({ variable: {id} })
			.subscribe({
				next: ({data}: any) => {
					const { type = 0 } = data.category
					const colls: any = []
					hids.forEach((hid: any) => {
						const { collections } = hid;
						collections.forEach(({usage, usagePage}: any) => {
							if(usageId(0x01, 0x8c) === usageId(usage, usagePage)) {
								colls.push({hid, usage, usagePage})
							}
							
							if(type === 0 && usageId(0x61, 0xff60) === usageId(usage, usagePage)) {
								colls.push({hid, usage, usagePage})
							}

							if(type === 1 && usageId(0x01, 0xffc1) === usageId(usage, usagePage)){
								colls.push({hid, usage, usagePage})
							}

							if(type === 1 && usageId(0x01, 0xff0a) === usageId(usage, usagePage)){
								colls.push({hid, usage, usagePage})
							}

							if(type === 2 && [usageId(0x61, 0xff60), usageId(0x01, 0xffc1)].includes(usageId(usage, usagePage))){
								colls.push({hid, usage, usagePage})
							}
							if(type === 2 && usageId(0x01, 0xff0a) === usageId(usage, usagePage)){
								colls.push({hid, usage, usagePage})
							}
						})
					})
					const create = [
						this.createByKeyboard.bind(this),
						this.createByMouse.bind(this),
						this.createByDangle.bind(this),
					][type]

					const bridge = colls.find(({usage, usagePage}: any) => usageId(0x01, 0x8c) === usageId(usage, usagePage))
					
					if(bridge){
						this.device.createBridgeDevice(bridge.hid).subscribe(() => {
							create(colls, JSON.parse(JSON.stringify(data)), id)
						})
					} else {
						create(colls, JSON.parse(JSON.stringify(data)), id)
					}
				}, error: () => {
					if(this.loadByKeyboardDef){
						hids.forEach((hid: any) => {
							const { collections } = hid;
							collections.forEach(({usage, usagePage}: any) => {
								if(usageId(0x61, 0xff60) === usageId(usage, usagePage)){
									this.createByKeyboard([{hid, usage, usagePage}], false)
								}
							})
						})
					}else{
						this.disconnect()
						this.msg.error(this.i18n.instant('notify.hidConfNotFound'))
					}
				}
			}) 
		})
	}

	public disconnect() {
		if(this.currentDevice){
			this.currentDevice.disconnect()
		}
		this.currentDevice = undefined
		this.event$.next({type: EEventEnum.DISCONNECT, data: this})
	}

	public setLocalKeyboardJson(enable: boolean, json: IKeyBoardDef) {
		this.loadByKeyboardDef = enable;
		this.keyboardDef = json;
	}
}
