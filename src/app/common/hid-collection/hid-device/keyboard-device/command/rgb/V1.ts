import {BaseKeyboard} from "../../base-keyboard";
import {ILedIndication, IRgbCommand} from "./type";
import {filter, map, Observable} from "rxjs";
import {EKeyboardCommand} from "../../../../../../model";
import {ByteUtil} from "../../../../../../utils";
import {Color} from "ng-antd-color-picker";

enum Command {
	Version = 0x1,
	SaveLedConf,
	LedIndicationGet,
	LedIndicationSet,
	LedCount = 0x5,
	LedNumber,
	GetLedColor,
	SetLedColor
}

export class RGB_V1 implements IRgbCommand {
	private readonly keyboard: BaseKeyboard;
	private version = 'v1'

	constructor(keyboard: BaseKeyboard) {
		this.keyboard = keyboard
	}

	public getLedColor(start: number, count: number): Observable<any> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB
			buf[1] = Command.GetLedColor
			buf[2] = start
			buf[3] = count
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.GetLedColor),
					map(v => Array.from(v.slice(3, count * 3 + 3))),
					map(v => ByteUtil.splitArray(v, 3).map(v => {
						const s = '#' + v.map(i => ByteUtil.oct2Hex(i, 2, '')).join('')
						return s === '#000000' ? '' : s;
					}))
				)
				.subscribe(v => {
					s.next(v)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getLedCount(): Observable<number> {
		return new Observable<number>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB;
			buf[1] = Command.LedCount;
			this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && Command.LedCount === v[1]),
					map(v => v[3])
				)
				.subscribe(v => {
					s.next(v)
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public gedNumberByRow(row: number): Observable<number[]> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB;
			buf[1] = Command.LedNumber;
			buf[2] = row
			buf[3] = 0xff
			buf[4] = 0xff
			buf[5] = 0xff
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && Command.LedNumber === v[1]),
					map(v => Array.from(v.slice(3, 26))),
					map(v => v.map(i => i === 0xff ? -1 : i))
				)
				.subscribe(v => {
					s.next(v)
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}


	public getAllLedNumber(): Observable<number[][]> {
		return new Observable(s => {
			const rows = this.keyboard.definition.matrix.rows;
			let i = 0;
			const matrix: Array<number[]> = []
			const run = () => {
				this.gedNumberByRow(i).subscribe(v => {
					matrix.push(v)
					if (i < rows - 1) {
						i++;
						run()
					} else {
						s.next(matrix)
					}
				})
			}
			run()
		})
	}

	public SaveLedConf(): Observable<void> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB
			buf[1] = Command.SaveLedConf
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.SaveLedConf)
				)
				.subscribe(() => {
					s.next(void 0)
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public SetLedColor(index: number, count: number, color: number[][]): Observable<void> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB
			buf[1] = Command.SetLedColor
			buf[2] = index
			buf[3] = count
			color.forEach(a => {
				a.forEach((v, i) => {
					buf[i + 4] = v
				})
			})
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.SetLedColor)
				)
				.subscribe(() => {
					s.next(void 0)
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}


	public getLedIndication(): Observable<ILedIndication> {
		return new Observable<ILedIndication>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB;
			buf[1] = Command.LedIndicationGet;

			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.LedIndicationGet),
					map(v => {
						const ledMask = ByteUtil.oct2Bin(v[3], 8, 'tail');
						const enable = ByteUtil.oct2Bin(v[4]);
						return {
							keys: {
								numLock: {
									support: ledMask.charAt(0) === '1',
									enable: enable.charAt(enable.length - 1) === '0',
								},
								capsLock: {
									support: ledMask.charAt(1) === '1',
									enable: enable.charAt(enable.length - 2) === '0',
								},
								scrollLock: {
									support: ledMask.charAt(2) === '1',
									enable: enable.charAt(enable.length - 3) === '0',
								},
								composeLock: {
									support: ledMask.charAt(3) === '1',
									enable: enable.charAt(enable.length - 4) === '0',
								},
								KanaLock: {
									support: ledMask.charAt(4) === '1',
									enable: enable.charAt(enable.length - 5) === '0',
								}
							},
							color: new Color({h: v[5] / 255 * 360, s: v[6] / 255, b: 1})
						}
					})
				)
				.subscribe(v => {
					s.next(v)
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public setLedIndication(d: {
		mask: number,
		color: { h: number, s: number, v: number }
	}): void {
		const buf = BaseKeyboard.Buffer()
		buf[0] = EKeyboardCommand.KC_RGB;
		buf[1] = Command.LedIndicationSet
		buf[2] = d.mask
		buf[3] = d.color.h
		buf[4] = d.color.s
		buf[5] = d.color.v
		console.log(buf);
		this.keyboard.write(buf).subscribe(() => {
			this.SaveLedConf().subscribe()
		})
	}

	public init(): Observable<any> {
		return new Observable(s => {
			this.getAllLedNumber().subscribe(v => {
				s.next(v)
			})
		})
	}
}
