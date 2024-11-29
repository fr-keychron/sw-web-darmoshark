import {IMixRgb, IMixEffect} from "./type";
import {BaseKeyboard} from "../../base-keyboard";
import {filter, map, Observable} from "rxjs";
import {EKeyboardCommand} from "../../../../../../model";
import {ByteUtil} from "../../../../../../utils";

enum Command {
	Version = 0x1,
	Save,
	LedCount=0x5,
	LedNumber,
	Info = 0x9,
	GetLedRegion = 0xa,
	SaveLedRegion,
	GetMixConf,
	SetMixConf
}

export class MixRgbV1 implements IMixRgb {
	private readonly keyboard: BaseKeyboard
	public ledCount: number = 0
	public conf: { effects: number; region: number };

	constructor(keyboard: BaseKeyboard) {
		this.keyboard = keyboard
	}

	public getVersion(): Observable<number> {
		return new Observable<number>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB;
			buf[1] = Command.Version;

			this.keyboard.write(buf).subscribe()
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.Version),
					map(v => ByteUtil.byteToNum([v[3], v[4]]))
				)
				.subscribe(v => {
					s.next(v)
					sub.unsubscribe()
				})

		})
	}

	public save(): Observable<number> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB
			buf[1] = Command.Save
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.Save),
					map(v => v[2])
				)
				.subscribe((v) => {
					s.next(v)
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getInfo(): Observable<{ region: number; effects: number }> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB;
			buf[1] = Command.Info
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.Info),
					map(v => {
						return {region: v[3], effects: v[4]}
					})
				)
				.subscribe(v => {
					this.conf = v
					s.next(v)
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getLedRegion(start: number, count: number): Observable<Array<number>> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB
			buf[1] = Command.GetLedRegion
			buf[2] = start
			buf[3] = count
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.GetLedRegion),
					map(v => Array.from(v.slice(3, count + 3)))
				)
				.subscribe(v => {
					s.next(v)
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getLedCount(): Observable<number> {
		return new Observable(s => {
			const buffer = BaseKeyboard.Buffer()
			buffer[0] = EKeyboardCommand.KC_RGB;
			buffer[1] = Command.LedCount;
			this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.LedCount),
					map(v => v[3])
				)
				.subscribe(v => {
					this.ledCount = v
					s.next(v)
				})
			this.keyboard.write(buffer).subscribe()
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
					map(v => v.map((i: number) => i === 0xff ? -1 : i))
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

	public setLedRegion(start: number, region: number[]): Observable<void> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB
			buf[1] = Command.SaveLedRegion
			buf[2] = start
			buf[3] = region.length
			region.forEach((v, i) => buf[i + 4] = v)
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && v[1] === Command.SaveLedRegion)
				)
				.subscribe(v => {
					s.next()
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getMixConf(region: number, start: number, count: number): Observable<Array<IMixEffect>> {
		return new Observable<any>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB;
			buf[1] = Command.GetMixConf;
			buf[2] = region
			buf[3] = start
			buf[4] = count
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_RGB && Command.GetMixConf === v[1]),
					map(v => Array.from(v.slice(3, v.length))),
					map(v => {
						const result: Array<IMixEffect> = []
						for (let i = 0; i < count; i++) {
							const buf = v.slice(i * 5, i * 5 + 5);
							const sum = buf.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
							if (sum) {
								result.push({
									effect: buf[0],
									duration: ByteUtil.byteToNum([buf[1], buf[2], buf[3], buf[4]], 'LowToHigh'),
									index: i
								})
							}
						}
						return result
					})
				).subscribe(v => {
					s.next(v)
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public setMixConf(region: number, start: number, effects: Array<IMixEffect>): Observable<any> {
		return new Observable<any>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_RGB;
			buf[1] = Command.SetMixConf
			buf[2] = region
			buf[3] = start
			buf[4] = this.conf.effects
			effects.forEach((c, i) => {
				const bytes = ByteUtil.numToHighLow(Number(c.duration), 4);
				buf[5 + i * 5] = c.effect;
				buf[6 + i * 5] = bytes[0]
				buf[7 + i * 5] = bytes[1]
				buf[8 + i * 5] = bytes[2]
				buf[9 + i * 5] = bytes[3]
			})
			this.keyboard.write(buf).subscribe(() => {
				this.save().subscribe(() => s.next())
			})
		})
	}
}
