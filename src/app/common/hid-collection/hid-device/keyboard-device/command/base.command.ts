import {filter, map, Observable, switchMap, throwError, timeout, timeoutWith, zip} from "rxjs";
import {EKeyboardCommand, EKnobDirection, IKeyBoardDef, IKeycode, IKeyMacros, Result} from "../../../../../model";
import {HidDeviceEventType, IKeyBufferResult} from "../types";
import {BaseKeyboard} from "../base-keyboard";
import {keycodeService} from "src/app/common/keycode/keycode.service";
import {ByteUtil, ConsoleUtil} from "../../../../../utils";
import {SerialTransceiver} from "../../../transceiver";
import {EDeviceConnectState} from "../../../enum";
import {Color} from "ng-antd-color-picker";
import {macroDecodeForV11, macroDecodeForV9} from "../general";
import {KeycodeEnumService} from "src/app/common/keycode/keycode-enum.service";
import {tap} from "rxjs/operators";

export interface IBaseCommand {
	keymapReset(): Observable<Result>

	loadLayerCount(): Observable<boolean>

	loadFirmwareVersion(): Observable<boolean>

	getFirmwareVersion(): Observable<string>

	getProtocol(): Observable<number>

	loadKeyMapBuffer(layer?: number): Observable<Array<IKeyBufferResult>>

	setLightSpeed(speed: number, valType: any): Observable<Result>

	saveLight(): Observable<Result>

	getLightSpeed(): Observable<number>

	setLightEffect(effect: number, valType: any): Observable<Result>

	getLightEffect(): Observable<number>

	getLightBrightness(): Observable<number>

	setLightBrightness(brightness: number, valType: any): Observable<Result>

	setLightRgb(hs: { h: number, s: number }): Observable<Result>

	getLightRgb(): Observable<any>

	getLayerCount(): Observable<number>

	getKeychronProtocolVersion(): Observable<number>

	getCurrentLayer(setSelect?: boolean): Observable<number>

	getKeymapBuffer(layer?: number): Observable<Array<IKeyBufferResult>>

	exchangeKeys(data: { source: IKeyBufferResult, target: IKeycode, layer?: number }): Observable<Result>

	setKeyMap(layer: number, keyConfig: { col: number, row: number, code: number }): Observable<boolean>

	getMacroCount(): Observable<number>

	getMacroSize(): Observable<number>

	getMacroByte(): Observable<IKeyMacros>

	resetMarco(): Observable<void>

	setMacro(data: Array<any>): Observable<Result>

	getKnobVal(knobId: number, direction: EKnobDirection): Observable<{
		keyCode: string,
		keyName: string,
		keyTitle: string,
		keyVal: number
		keyHex: string,
	}>

	setKnobVal(knobId: number, direction: EKnobDirection, key: IKeycode): Observable<Result>

	getKeyboardVal(): Observable<string[][]>

	getSupportFeat(): Observable<any>
}

export class BaseCommand implements IBaseCommand {
	private readonly keyboard: BaseKeyboard;

	constructor(keyboard: BaseKeyboard) {
		this.keyboard = keyboard
	}

	public setKeyMap(layer: number, keyConfig: { col: number, row: number, code: number }): Observable<boolean> {
		return new Observable<boolean>(s => {
			const buf = BaseKeyboard.Buffer();
			buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_SET_KEYCODE;
			buf[1] = layer
			buf[2] = keyConfig.row
			buf[3] = keyConfig.col
			buf[4] = keyConfig.code >> 8
			buf[5] = keyConfig.code & 255

			this.keyboard.write(buf)
				.subscribe(r => {
					s.next(true)
				})
		})
	}

	public exchangeKeys(data: {
		source: IKeyBufferResult,
		target: IKeycode,
		layer?: number
	}): Observable<Result> {
		const buf = BaseKeyboard.Buffer();
		const code = data.target.code
		const tarKeycode = keycodeService.code2Byte(code)
		if (tarKeycode === undefined || tarKeycode === null) {
			return new Observable<Result>(s => {
				const result = Result.build()
					.setMsg(this.keyboard.i18n.instant('notify.keycodeNotFound'))
				s.error(result)
			})
		}
		buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_SET_KEYCODE;
		buf[1] = data.layer !== undefined ? data.layer : this.keyboard.selectLayer
		buf[2] = data.source.row
		buf[3] = data.source.col
		buf[4] = tarKeycode >> 8
		buf[5] = tarKeycode & 255
		ConsoleUtil.colorfulLog(`set '${data.source.code}' to '${data.target.code}'`)
		return new Observable<Result>(s => {
			this.keyboard.write(buf).subscribe(r => {
				const cols = this.keyboard.definition.matrix.cols as number
				const size = data.source.row * cols + data.source.col
				const key = keycodeService.code2Key(tarKeycode, this.keyboard)
				this.keyboard.keyBufferResult[size] = {
					val: tarKeycode,
					code: key.keyCode,
					hex: key.keyHex,
					name: key.keyName,
					longName: key.name,
					title: key.keyTitle,
					capName: key.capName,
					col: 0,
					row: 0,
				}
				this.keyboard.event$.next({type: HidDeviceEventType.KeymapBuffer, data: this})
				s.next(r)
				// const u = this.loadKeyMapBuffer().subscribe(_ => {
				// 	s.next(r)
				// 	u.unsubscribe()
				// })
			})
		})
	}

	public getCurrentLayer(setSelect?: boolean): Observable<number> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_GET_CURRENT_LAYER;
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_GET_CURRENT_LAYER),
					timeout(500),
					map(v => v[1])
				)
				.subscribe(v => {
					if (setSelect) this.keyboard.selectLayer = v;
					this.keyboard.currentLayer = v;
					s.next(v)
					subj.unsubscribe()
				}, err => {
					s.next(-1)
					if (this.keyboard.transceiver instanceof SerialTransceiver) {
						this.keyboard.transceiver.setNext()
					}
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getFirmwareVersion(): Observable<string> {
		return new Observable<string>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_FIRMWARE_VERSION;
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_FIRMWARE_VERSION),
					timeout(1000),
				)
				.subscribe(r => {
					const str = []
					for (let i = 1; i < r.length; i++) {
						if (r[i]) str.push(String.fromCharCode(r[i]))
					}
					if (str[0] === 'v') {
						this.keyboard.firmwareVersion = str.join('')
					} else {
						this.keyboard.firmwareVersion = ''
					}
					s.next(this.keyboard.firmwareVersion)
					subj.unsubscribe()
				}, e => {
					this.keyboard.firmwareVersion = '';
					s.next(this.keyboard.firmwareVersion)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getKeyboardVal(): Observable<string[][]> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.GET_KEYBOARD_VALUE
			buf[1] = 0x03
			this
				.keyboard
				.write(buf)
				.subscribe(() => {
				});
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.GET_KEYBOARD_VALUE && v[1] === 0x03),
					map(v => {
						const arr: number[] = []
						const offset = this.keyboard.protocol >= 12 ? 1 : 0
						for (let i = 2 + offset; i < v.length; i++) {
							arr.push(v[i])
						}
						return arr
					}),
					map(v => {
						const {rows, cols} = this.keyboard.definition.matrix;
						const arr: Array<Array<string>> = []
						const spacing = Math.ceil(cols / 8)
						for (let i = 0; i < rows; i++) {
							const position = i * spacing;
							const byte = v.slice(position, position + spacing).reverse()
							const result = byte.map(i => ByteUtil.oct2Bin(i).split('').reverse())
							arr.push(result.flat())
						}
						return arr
					}),
					timeout(300)
				)
				.subscribe(r => {
					s.next(r)
					subj.unsubscribe()
				}, () => {
					if (this.keyboard.transceiver instanceof SerialTransceiver) {
						this.keyboard.transceiver.setNext()
					}
					s.error()
				})
		})
	}

	public getKeychronProtocolVersion(): Observable<number> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_GET_PROTOCOL_VERSION;
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_GET_PROTOCOL_VERSION),
					tap((v) => this.keyboard.instruction_set = v[3]),
					map(v => v[1]),
					timeout(1000)
				)
				.subscribe(r => {
					this.keyboard.kcVersion = r;
					s.next(r)
					subj.unsubscribe()
				}, () => {
					this.keyboard.kcVersion = null
					s.next(null)
				})

			this.keyboard.write(buf).subscribe()
		})
	}

	public getKeymapBuffer(layer: number): Observable<Array<IKeyBufferResult>> {
		return new Observable(s => {
			const c = (<IKeyBoardDef>this.keyboard.definition).matrix
			const total = c.cols * c.rows;
			const count = Math.ceil(total / 14)
			let index = 0
			const l = layer !== undefined ? layer : this.keyboard.selectLayer
			const stream = (offset: number): Observable<any> => {
				return new Observable(s => {
					const buf = BaseKeyboard.Buffer()
					const size = total - offset * 14 >= 14 ? 14 : total - offset * 14
					const of = offset * 28 + l * total * 2
					buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_GET_BUFFER;
					buf[1] = of >> 8
					buf[2] = of & 255
					buf[3] = size * 2
					const subj = this.keyboard.report$
						.pipe(
							filter(v => v[0] === EKeyboardCommand.DYNAMIC_KEYMAP_GET_BUFFER &&
								v[2] === (of & 255) && v[1] === (of >> 8))
						)
						.subscribe(r => {
							const keyBuf = r.slice(4, r.length);
							const maxCol = this.keyboard.definition.matrix.cols;
							const data: Array<IKeyBufferResult> = Array.from(keyBuf).reduce(
								(p: Array<any>, v: any, i) => {
									if (i % 2 === 0) {
										const val = v << 8 | keyBuf[i + 1]
										const key = keycodeService.code2Key(val, this.keyboard)
										const row = index >= maxCol ? Math.floor(index / maxCol) : 0;
										const col = index - maxCol * row;
										index++
										p.push({
											val: val,
											code: key.keyCode,
											hex: key.keyHex,
											name: key.keyName,
											longName: key.name,
											title: key.keyTitle,
											capName: key.capName,
											col: col,
											row: row,
										});
									}
									return p
								},
								[]
							);
							s.next({data, offset})
						})
					this.keyboard.write(buf).subscribe(() => {
					})
				})
			}
			const obs: any[] = []
			for (let i = 0; i < count; i++) obs.push(stream(i))
			let result: Record<string, IKeyBufferResult> = {}
			if (this.keyboard.state === EDeviceConnectState.G) {
				const run = () => {
					if (obs.length) {
						const ob = obs.shift()
						ob.subscribe((s: any) => {
							result[s.offset] = s.data;
							run()
						})
					} else {
						s.next(Object.keys(result).map((k: any) => result[k]).flat())
					}
				}
				run()
			} else {
				zip(obs)
					.subscribe((r: Array<any>) => {
						const result = r.flat().map(i => i.data).flat()
						s.next(result)
					})
			}
		})
	}

	public getKnobVal(knobId: number, direction: EKnobDirection): Observable<{
		keyCode: string,
		keyName: string,
		keyTitle: string,
		keyVal: number
		keyHex: string,
	}> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_GET_ENCODER;
			buf[1] = this.keyboard.selectLayer
			buf[2] = knobId
			buf[3] = direction

			this.keyboard.write(buf).subscribe()
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.DYNAMIC_KEYMAP_GET_ENCODER && v[3] === direction),
					timeoutWith(1500, throwError(new Error('Time Out')))
				)
				.subscribe(d => {
					const val = d[4] << 8 | d[5]
					const key = keycodeService.code2Key(val, this.keyboard)
					s.next(key)
					subj.unsubscribe()
				}, err => {
					s.error(err)
					subj.unsubscribe()
				})
		})
	}

	public getLayerCount(): Observable<number> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_GET_LAYER_COUNT
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.DYNAMIC_KEYMAP_GET_LAYER_COUNT),
					map(v => v[1])
				)
				.subscribe(r => {
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getLightBrightness(): Observable<number> {
		return new Observable(s => {
			const payload = this.keyboard.lightConf('bright')
			const result = [EKeyboardCommand.BACKLIGHT_CONFIG_GET_VALUE, ...payload]
			const buffer = BaseKeyboard.BufferGenerate(result);
			const subj = this.keyboard.report$.pipe(
				filter(d => result.filter((j, i) => j === d[i]).length === result.length),
				map(d => d[payload.length + 1])
			).subscribe(v => {
				s.next(v)
				subj.unsubscribe()
			})

			this.keyboard.write(buffer).subscribe()
		})
	}

	public getLightEffect(): Observable<number> {
		return new Observable(s => {
			const payload = this.keyboard.lightConf('effect');
			const result = [
				EKeyboardCommand.BACKLIGHT_CONFIG_GET_VALUE,
				...payload
			]
			const buf = BaseKeyboard.BufferGenerate(result)
			const subj = this.keyboard.report$
				.pipe(
					filter(d => result.filter((j, i) => j === d[i]).length === result.length),
					map(d => d[result.length])
				)
				.subscribe(r => {
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe(r => {
			})
		})
	}

	public getLightRgb(): Observable<any> {
		return new Observable(s => {
			const payload = this.keyboard.lightConf('color');
			const result = [
				EKeyboardCommand.BACKLIGHT_CONFIG_GET_VALUE,
				...payload
			]
			const buf = BaseKeyboard.BufferGenerate(result)
			const subj = this.keyboard.report$.pipe(
				filter(d => result.filter((j, i) => j === d[i]).length === result.length),
				map(v => {
					return new Color({h: v[result.length] / 255 * 360, s: v[result.length + 1] / 255, b: 1})
				})
			).subscribe(v => {
				s.next(v)
				subj.unsubscribe()
			})
			this.keyboard.write(buf).subscribe(() => {
			})
		})
	}

	public getLightSpeed(): Observable<number> {
		return new Observable(s => {
			const payload = this.keyboard.lightConf('speed');
			const result = [
				EKeyboardCommand.BACKLIGHT_CONFIG_GET_VALUE,
				...payload
			]
			const buf = BaseKeyboard.BufferGenerate(result)
			const subj = this.keyboard.report$
				.pipe(
					filter(d => result.filter((j, i) => j === d[i]).length === result.length),
					map(d => d[result.length])
				).subscribe(r => {
					s.next(r)
					subj.unsubscribe()
				})

			this.keyboard.write(buf).subscribe(() => {
			})
		})
	}

	public getMacroByte(): Observable<IKeyMacros> {
		return new Observable((s) => {
			zip(
				this.getMacroSize(),
				this.getMacroCount()
			)
				.subscribe(async (r) => {
					const [macroSize, macroCount] = r
					this.keyboard.macroCount = macroCount
					this.keyboard.macroSize = macroSize
					let count = 0;

					const queue: any[] = []

					for (let offset = 0; offset < macroSize; offset += 28) {
						const buf = BaseKeyboard.Buffer()
						buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_GET_BUFFER
						buf[1] = offset >> 8
						buf[2] = offset & 255
						buf[3] = 28
						count++;
						queue.push(buf);
					}

					let result: Array<number> = []


					const bufferHandle = (r: number[]) => {
						return this.keyboard.protocol >= 11 ? macroDecodeForV11(r, this.keyboard.macroCount) :
							macroDecodeForV9(r, this.keyboard.macroCount)
					}
					const recursive = () => {
						if (!queue.length) {
							s.next(bufferHandle(result))
							return;
						}
						const buf = queue.shift();
						this.keyboard.write(buf).subscribe()
						let unsub = this.keyboard.report$.pipe(
							filter(i => i[0] === EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_GET_BUFFER),
							map(i => Array.from(i.slice(4)))
						).subscribe(r => {
							result = result.concat(r)
							unsub.unsubscribe()
							if (r.filter(i => i === 0).length >= 24) {
								s.next(bufferHandle(result))
							} else {
								recursive()
							}
						})
					}
					recursive()
				})
		})
	}

	public getMacroCount(): Observable<number> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_GET_COUNT
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_GET_COUNT),
					map(v => v[1])
				)
				.subscribe(r => {
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe(() => {
			})
		})
	}

	public getMacroSize(): Observable<number> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_GET_BUFFER_SIZE
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_GET_BUFFER_SIZE),
					map(v => (v[1] << 8) | v[2])
				)
				.subscribe(r => {
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe(() => {
			})
		})
	}

	public getProtocol(): Observable<number> {
		return new Observable<number>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.GET_PROTOCOL_VERSION
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.GET_PROTOCOL_VERSION),
					map(v => v[2])
				)
				.subscribe(r => {
					s.next(r)
					this.keyboard.protocol = r || 5;
					KeycodeEnumService.prototol = this.keyboard.protocol;
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public keymapReset() {
		return new Observable<Result>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_CLEAR_ALL;
			this.keyboard.write(buf).subscribe(r => {
				this.keyboard.monkeyPatch(true).subscribe(() => {
					this.loadKeyMapBuffer().subscribe(_ => {
						s.next(r)
					})
				})
			})
		})
	}

	public loadKeyMapBuffer(layer?: number): Observable<Array<IKeyBufferResult>> {
		return new Observable(s => {
			const sub = this.getKeymapBuffer(layer)
				.subscribe(r => {
					if (layer === undefined) {
						this.keyboard.keyBufferResult = r;
						this.keyboard.event$.next({type: HidDeviceEventType.KeymapBuffer, data: this})
					}
					sub.unsubscribe()
					s.next(r)
				})
		})
	}

	public loadLayerCount(): Observable<boolean> {
		return new Observable<boolean>(s => {
			this.getLayerCount().subscribe(r => {
				this.keyboard.layerCount = r;
				this.keyboard.event$.next({type: HidDeviceEventType.LayerCount, data: this.keyboard.layerCount})
				s.next(true)
			})
		})
	}

	public resetMarco(): Observable<void> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_RESET
			this.keyboard.write(buf).subscribe(() => {
				console.log('reset success');
			})
			const unsub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_RESET),
				)
				.subscribe(d => {
					unsub.unsubscribe()
					s.next()
				})
		})
	}

	public saveLight(): Observable<Result> {
		const payload = BaseKeyboard.BufferGenerate([EKeyboardCommand.BACKLIGHT_CONFIG_SAVE, 3])
		return this.keyboard.write(payload)
	}

	public setKnobVal(knobId: number, direction: EKnobDirection, key: IKeycode): Observable<Result> {
		return new Observable<Result>(s => {
			const r = Result.build()
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.DYNAMIC_KEYMAP_SET_ENCODER;
			buf[1] = this.keyboard.selectLayer
			buf[2] = knobId
			buf[3] = direction
			const tarKeycode = keycodeService.code2Byte(key.code)
			buf[4] = tarKeycode >> 8
			buf[5] = tarKeycode & 255
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.DYNAMIC_KEYMAP_SET_ENCODER && v[3] === direction),
				)
				.subscribe(d => {
					this.keyboard.event$.next({type: HidDeviceEventType.KnobUpdate, data: {id: knobId, direction}})
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public setLightBrightness(brightness: number, valType: any): Observable<Result> {
		const payload = this.keyboard.lightConf(valType);
		const result = [EKeyboardCommand.BACKLIGHT_CONFIG_SET_VALUE, ...payload, brightness]
		const buf = BaseKeyboard.BufferGenerate(result)
		return this.keyboard.write(buf)
			.pipe(switchMap(v => this.saveLight()))
	}

	public setLightEffect(effect: number, valType: any): Observable<Result> {
		const payload = this.keyboard.lightConf(valType)
		const result = [
			EKeyboardCommand.BACKLIGHT_CONFIG_SET_VALUE,
			...payload,
			effect
		]
		return this.keyboard.write(BaseKeyboard.BufferGenerate(result))
			.pipe(switchMap(v => this.saveLight()))
	}

	public setLightRgb(hs: { h: number; s: number }): Observable<Result> {
		const payload = this.keyboard.lightConf('color');
		const result = [
			EKeyboardCommand.BACKLIGHT_CONFIG_SET_VALUE,
			...payload,
			hs.h,
			hs.s
		]
		return this.keyboard.write(BaseKeyboard.BufferGenerate(result))
			.pipe(switchMap(v => this.saveLight()))
	}

	public setLightSpeed(speed: number, valType: any): Observable<Result> {
		const payload = this.keyboard.lightConf(valType)
		const buf = BaseKeyboard.BufferGenerate([
			EKeyboardCommand.BACKLIGHT_CONFIG_SET_VALUE,
			...payload,
			speed
		])
		return this.keyboard.write(buf)
			.pipe(switchMap(v => this.saveLight()))
	}

	public setMacro(data: Array<any>): Observable<Result> {
		return new Observable<Result>(s => {
			const result = Result.build()
			if (data.length > this.keyboard.macroSize) {
				return s.error(result.error(this.keyboard.i18n.instant('notify.macroSizeLimit')))
			}
			const lastOffset = this.keyboard.macroSize - 1;
			const lastOffsetBytes = ByteUtil.shiftFrom16Bit(lastOffset);
			this.resetMarco().subscribe(() => {
				const buf = BaseKeyboard.BufferGenerate([
					EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_SET_BUFFER, ...ByteUtil.shiftFrom16Bit(lastOffset),
					1, 0xff,
				])
				this.keyboard.write(buf).subscribe(r => {
					const bufferSize = 28;
					const obs: Array<Observable<Result>> = []
					for (let offset = 0; offset < data.length; offset += bufferSize) {
						const a = data.slice(offset, offset + bufferSize);
						const b = BaseKeyboard.BufferGenerate([
							EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_SET_BUFFER,
							...ByteUtil.shiftFrom16Bit(offset),
							a.length,
							...a
						])
						obs.push(this.keyboard.write(b))
					}
					if (obs.length) {
						zip(obs).subscribe(r => {
							const buf = BaseKeyboard.BufferGenerate([
								EKeyboardCommand.DYNAMIC_KEYMAP_MACRO_SET_BUFFER,
								...lastOffsetBytes, 1, 0x00
							])
							this.keyboard.write(buf).subscribe(r => {
								s.next(r)
							})
						})
					} else {
						s.next(r)
					}
				})
			})
		})
	}

	public loadFirmwareVersion(): Observable<boolean> {
		return new Observable<boolean>(s => {
			this.getFirmwareVersion().subscribe(r => {
				this.keyboard.event$.next({type: HidDeviceEventType.FirmwareVersion, data: this.keyboard.layerCount})
				s.next(true)
			})
		})
	}


	public getSupportFeat(): Observable<any> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_GET_SUPPORT_FEATURE
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_GET_SUPPORT_FEATURE),
					map(v => ByteUtil.oct2Bin(v[1])),
					map(v => v.split('').reverse()),
					timeout(300)
				)
				.subscribe(v => {
					const [
						Get_Default_Layer,
						Support_Le,
						Support_Rf,
						Support_Mock_Key,
						Upload_Default_Layer
					] = v

					this.keyboard.supportFeature = {
						Get_Default_Layer: Get_Default_Layer === '1',
						Support_Le: Support_Le === '1',
						Support_Rf: Support_Rf === '1',
						Support_Mock_Key: Support_Mock_Key === '1',
						Upload_Default_Layer: Upload_Default_Layer === '1'
					}

					s.next()
					sub.unsubscribe()
				}, err => {
					s.next()
				})
			this.keyboard.write(buf).subscribe()
		})
	}
}
