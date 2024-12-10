import {IHeCommand} from "./type";
import {
	EHECommand,
	EHeWorkMode,
	EKeyboardCommand,
	Result
} from "src/app/model";
import {
	BaseKeyboard,
	HeKeyBoard,
	HidDeviceEventType,
	IDks,
	IHeConf,
	IProfileBuffer, ISnapTap
} from 'src/app/common/hid-collection'
import {filter, map, Observable, switchMap, zip} from "rxjs";
import {keycodeService} from "src/app/service/keycode/keycode.service";
import {ByteUtil, gen2dMatrix} from "src/app/utils";
import {tap} from "rxjs/operators";
import {By} from "@angular/platform-browser";

export class HECommandV5 implements IHeCommand {

	private keyboard: HeKeyBoard;

	constructor(d: HeKeyBoard) {
		this.keyboard = d
		//@ts-ignore
		window.aaa = this
	}



	public getCommandVersion(): number {
		return 5
	}

	public setHeDistance(d: {
		press?: number,
		sensitive_release?: number,
		sensitive_press?: number
		keyMode: 0 | 1,
		workMode?: EHeWorkMode,
		buffer?: Uint8Array
	}): Observable<Result> {
		return new Observable<Result>(s => {
			const r = Result.build()
			const buf: any = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_SET_TRAVAL;
			buf[2] = this.keyboard.currentProfile;
			buf[3] = d.workMode

			const press = ByteUtil.numToHighLow(d.press ?? 0)
			buf[4] = press[0]
			buf[5] = press[1]


			const sensitive_press = ByteUtil.numToHighLow(d.sensitive_press ?? 0)
			buf[6] = sensitive_press[0]
			buf[7] = sensitive_press[1]

			const sensitive_release = ByteUtil.numToHighLow(d.sensitive_release ?? d.sensitive_press)
			buf[8] = sensitive_release[0]
			buf[9] = sensitive_release[1]

			buf[10] = d.keyMode
			if (d.keyMode === 0) d.buffer.forEach((e, i) => buf[i + 11] = e);
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_SET_TRAVAL),
					map(v => v[2])
				)
				.subscribe(d => {
					r.setSuccess(!d);
					s.next(r)
					subj.unsubscribe()
				})

			this.keyboard.write(buf).subscribe()
		})
	}

	public setDks(
		d: {
			matrix: { col: number, row: number },
			distance: Array<number>,
			keycodes: Array<string>,
			buf: Array<number>,
			position?: number,
			workMode?: number
		}
	): Observable<Result> {
		return new Observable<Result>(s => {
			const result = Result.build()
			this.getProfileBuffer()
				.subscribe(r => {
					const idx = r.dks.findIndex(i => !i);
					if (!~idx) return s.error(this.keyboard.i18n.instant('magnet.multi_cmd.fulfilled'));
					const buf = BaseKeyboard.Buffer()
					buf[0] = EKeyboardCommand.KC_HE;
					buf[1] = EHECommand.AMC_SET_ADVANCE_MODE
					buf[2] = this.keyboard.currentProfile
					buf[3] = d.workMode ? d.workMode : 0x01
					buf[4] = d.matrix.row
					buf[5] = d.matrix.col
					buf[6] = d.position ?? idx

					const d1 = ByteUtil.numToHighLow(d.distance[0] ?? 0)
					buf[7] = d1[0]
					buf[8] = d1[1]

					const d2 = ByteUtil.numToHighLow(d.distance[3] ?? 0)
					buf[9] = d2[0]
					buf[10] = d2[1]

					const d3 = ByteUtil.numToHighLow(d.distance[1] ?? 0)
					buf[11] = d3[0]
					buf[12] = d3[1]

					const d4 = ByteUtil.numToHighLow(d.distance[2] ?? 0)
					buf[13] = d4[0]
					buf[14] = d4[1]

					d.keycodes.forEach((e, idx) => {
						const byte = keycodeService.code2Byte(e);
						const i = idx * 2 + 15
						buf[i] = byte & 255
						buf[i + 1] = byte >> 8
					})
					d.buf.forEach((e, i) => buf[23 + i] = e);
					// let ss = '';
					// const ab = (s: string) => s.length === 1 ? '0' + s : s;
					// buf.forEach(i => ss += ab(i.toString(16)) + ' ')
					const subj = this.keyboard.report$
						.pipe(
							filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_SET_ADVANCE_MODE),
						)
						.subscribe(v => {
							result.setSuccess(true)
							s.next(result)
							subj.unsubscribe()
						})
					this.keyboard.write(buf).subscribe()
				})
		})
	}


	public removeDks(row: number, col: number): Observable<null> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_SET_ADVANCE_MODE
			buf[2] = this.keyboard.currentProfile;
			buf[3] = 0
			buf[4] = row
			buf[5] = col
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_SET_ADVANCE_MODE && v[3] === 0)
				)
				.subscribe((v) => {
					s.next()
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getProfileInfo(): Observable<{ current: number, total: number, size: number, names: string[] }> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_GET_PROFILES_INFO
			const getProfileNames = (v: { current: number, total: number, size: number }) => {
				return new Observable<{ current: number, total: number, size: number, names: string[] }>(
					s => {
						const {total, size} = v
						const obs: Array<Observable<string>> = []
						for (let i = 0; i < total; i++) {
							obs.push(new Observable<string>(n => {
								const buf = BaseKeyboard.Buffer()
								const o = size - 32;
								buf[0] = EKeyboardCommand.KC_HE;
								buf[1] = EHECommand.AMC_GET_PROFILE_BUFFER
								buf[2] = i;
								buf[3] = o & 0xff;
								buf[4] = o >>> 8
								buf[5] = 26
								const subj = this.keyboard.report$
									.pipe(
										filter(
											v => v[0] === EKeyboardCommand.KC_HE &&
												v[1] === EHECommand.AMC_GET_PROFILE_BUFFER &&
												v[2] === i && v[3] === (o & 0xff) && v[4] === o >>> 8 && v[5] === 26
										),
										map(v => v.slice(6, 32)),
									)
									.subscribe(v => {
										const str: string[] = []
										for (let i = 0; i < v.length; i += 2) {
											if (v[i] !== 0 || v[i + 1] !== 0) {
												const val = v[i] << 8 | v[i + 1]
												str.push(String.fromCharCode(val))
											}
										}
										n.next(str.join(''))
										subj.unsubscribe()
									})
								this.keyboard.write(buf).subscribe()
							}))
						}
						zip(obs)
							.subscribe(names => {
								s.next({...v, names})
							})
					})
			}
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_GET_PROFILES_INFO),
					map(v => {
						const [, , current, total, size1, size2, dksCount, snapTapCount, unit] = v;
						const u = unit === 2 ? 0.01 : 0.1
						this.keyboard.unit = u
						console.log(321)
						return {
							current, total, size: size2 << 8 | size1, dksCount, snapTapCount,
							unit: u
						}
					}),
					switchMap(v => getProfileNames(v))
				)
				.subscribe(r => {
					this.keyboard.currentProfile = r.current
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public saveProfile(): Observable<Result> {
		return new Observable<Result>(s => {
			const r = Result.build()
			const buf: any = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_SAVE_PROFILE_BUFFER;
			buf[2] = this.keyboard.currentProfile;
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_SAVE_PROFILE_BUFFER),
					map(v => v[2])
				)
				.subscribe(d => {
					r.setSuccess(!d);
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getProfileBuffer(): Observable<IProfileBuffer> {
		let profileSize = 0;
		let profileCount = 0;
		let profileCurrent = 0
		const obs = (v: any) => {
			const size = 26;
			profileSize = v.size;
			profileCount = v.total;
			profileCurrent = v.current;
			const ob = (o: number, s: number) => {
				return new Observable(n => {
					const buf = BaseKeyboard.Buffer()
					buf[0] = EKeyboardCommand.KC_HE;
					buf[1] = EHECommand.AMC_GET_PROFILE_BUFFER
					buf[2] = this.keyboard.currentProfile;
					buf[3] = o & 0xff;
					buf[4] = o >>> 8
					buf[5] = s
					const subj = this.keyboard.report$
						.pipe(
							filter(
								v => v[0] === EKeyboardCommand.KC_HE &&
									v[1] === EHECommand.AMC_GET_PROFILE_BUFFER &&
									v[3] === (o & 0xff) && v[4] === o >>> 8 && v[5] === s
							),
							map(v => v.slice(6, 32))
						)
						.subscribe(v => {
							n.next(v)
							subj.unsubscribe()
						})
					this.keyboard.write(buf).subscribe()
				})
			}

			const o: Array<Observable<any>> = []
			let remain = v.size;
			for (let i = 0; i < Math.ceil(v.size / size); i += 1) {
				o.push(ob(size * i, remain > size ? size : remain))
				remain -= size;
			}
			return zip(o)
		}

		const dksMap: any = {}
		const analog: any = {};
		const toggle: any = []
		const deserialize = (
			bytes: number[],
			row?: number, col?: number
		): IHeConf => {
			const advance_data = bytes.pop()
			const configHex = '0x' + bytes.reverse()
				.map(i => i >= 10 ? i.toString() : '0' + i)
				.map(i => ByteUtil.oct2Hex(Number(i), 2, ''))
				.join('')
			const config = ByteUtil.hex2Bin(configHex, 48)
			const mode = ByteUtil.bin2Oct(config.slice(46, 48))
			const distance = ByteUtil.bin2Oct(config.slice(32, 46))
			const advance_press = ByteUtil.bin2Oct(config.slice(18, 32))
			const advance_release = ByteUtil.bin2Oct(config.slice(4, 18))
			const advance_mode = ByteUtil.bin2Oct(config.slice(0, 4))

			const data: any = {
				mode, distance, advance_press, advance_release, dksIndex: null,
				advanceMode: advance_mode, row, col, dirty: false
			}

			if (advance_mode !== 0 && row !== undefined && col !== undefined) {
				data.dksIndex = advance_data
				if (advance_mode === 3) {
					dksMap[advance_data] = {row, col}
				}
				if (advance_mode === 4 || advance_mode === 5) {
					const maxCol = this.keyboard.definition.matrix.cols;
					const position = row * maxCol + col
					const v = this.keyboard.keyBufferResult[position];
					v.col = col
					v.row = row
					if (advance_mode === 4) {
						analog[advance_data] = v
					}
					if (advance_mode === 5) toggle.push(v)
				}
			}
			return {
				...data,
				edit: {
					advance_press: data.advance_press,
					distance: data.distance,
					advance_release: data.advance_release,
					mode: data.mode
				}
			}
		}

		return this.getProfileInfo()
			.pipe(
				switchMap(v => obs(v)),
				map(v => {
					const byteArr: Array<number> = [];
					v.forEach(b => b.forEach((j: number) => byteArr.push(j)))
					byteArr.splice(profileSize, byteArr.length - profileSize)
					const geyKeyMatrix = (): any => {
						const {cols, rows} = this.keyboard.definition.matrix;
						let idx = 0
						const matrix: IHeConf[][] = gen2dMatrix(rows, cols).map((row, rowIdx) => {
							return row.map((col, colIdx) => {
								const byte = byteArr.slice(colIdx * 7 + rowIdx * 7 * cols + 7, (colIdx + 1) * 7 + rowIdx * 7 * cols + 7);
								idx = (colIdx + 1) * 7 + rowIdx * 7 * cols + 7
								return deserialize(byte, rowIdx, colIdx)
							})
						})
						return {matrix, idx}
					}
					const genDks = (idx: number) => {
						const total = 20
						const size = 21
						const startPosition = idx;
						let endPosition = 0;
						const fetch = (index: number) => {
							endPosition = startPosition + size + index * size
							const bytes = byteArr.slice(startPosition + index * size, startPosition + size + index * size);
							const travelByte = bytes.slice(0, 5)
								.reverse()
								.map(i => i >= 10 ? i.toString() : '0' + i)
								.map(i => ByteUtil.oct2Hex(Number(i), 2, ''))
								.join('');
							const configHex = `0x${travelByte}`
							if (ByteUtil.hex2Oct(configHex) === 0) return null
							const config = ByteUtil.hex2Bin(configHex, 40).split('')
							const travel = [
								ByteUtil.bin2Oct(config.slice(30, 40).join('')),
								ByteUtil.bin2Oct(config.slice(10, 20).join('')),
								ByteUtil.bin2Oct(config.slice(0, 10).join('')),
								ByteUtil.bin2Oct(config.slice(20, 30).join(''))
							]

							const keys = [
								bytes.slice(5, 7),
								bytes.slice(7, 9),
								bytes.slice(9, 11),
								bytes.slice(11, 13),
							].map(i => keycodeService.code2Key(i[1] << 8 | i[0], this.keyboard))

							const action = [
								bytes.slice(13, 15),
								bytes.slice(15, 17),
								bytes.slice(17, 19),
								bytes.slice(19, 21),
							].map(i => {
								const sBin = ByteUtil.oct2Bin(i[0])
								const eBin = ByteUtil.oct2Bin(i[1])

								return [
									ByteUtil.bin2Oct(sBin.substring(4, 8)),
									ByteUtil.bin2Oct(eBin.substring(4, 8)),
									ByteUtil.bin2Oct(eBin.substring(0, 4)),
									ByteUtil.bin2Oct(sBin.substring(0, 4))
								]
							})
							const item = dksMap[index] ?? {}
							if (item.col === undefined) return null;
							const maxCol = this.keyboard.definition.matrix.cols;
							const position = item.row * maxCol + item.col
							const key = this.keyboard.keyBufferResult[position];
							key.col = item.col
							key.row = item.row
							return {travel, keys, action, index, keyInfo: key}
						}
						const result: IDks[] = []
						for (let i = 0; i < total; i++) {
							result.push(fetch(i))
						}
						return {dsk: result, idx: endPosition}
					}

					const genSnap = (startPosition: number): { idx: number, snap: Array<ISnapTap> } => {
						const size = 3;
						const count = 20;
						let endPosition = 0;
						const result: Array<ISnapTap> = []
						for (let i = 0; i < count; i++) {
							endPosition += startPosition + size * (i + 1);
							const bytes = byteArr.slice(startPosition + i * size, startPosition + size + i * size);
							const bytes1_bits = ByteUtil.oct2Bin(bytes[0]);
							const bytes2_bits = ByteUtil.oct2Bin(bytes[1]);
							if (bytes1_bits !== ByteUtil.oct2Bin(0) || bytes2_bits !== ByteUtil.oct2Bin(0)) {
								const maxCol = this.keyboard.definition.matrix.cols;
								const findKey = (col: number, row: number) => {
									const position = row * maxCol + col
									const key = this.keyboard.keyBufferResult[position];
									key.col = col
									key.row = row
									return key
								}
								result.push({
									keys: [
										findKey(
											ByteUtil.bin2Oct(bytes1_bits.substring(0, 5)),
											ByteUtil.bin2Oct(bytes1_bits.substring(5, 8)),
										),
										findKey(
											ByteUtil.bin2Oct(bytes2_bits.substring(0, 5)),
											ByteUtil.bin2Oct(bytes2_bits.substring(5, 8)),
										)
									],
									type: bytes[2],
									index: i
								})
							}
						}
						return {snap: result, idx: endPosition}
					}
					const {matrix, idx} = geyKeyMatrix();
					const {dsk, idx: dksEnd} = genDks(idx);
					// const {snap, idx: snapIndex} = genSnap(dksEnd)
					return {
						global: deserialize([
							byteArr[0], byteArr[1], byteArr[2], byteArr[3],
							byteArr[4], byteArr[5], byteArr[6]
						]),
						keyMatrix: matrix,
						// snapTap: snap,
						dks: dsk,
						analog: analog,
						toggle: toggle,
						profileNames: ['', '', ''],
						size: profileSize,
						current: profileCurrent,
						total: profileCount
					}
				})
			)
	}

	public getKeyDistance(row: number, col: number): Observable<{ distance: number, row?: number, col?: number }> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_GET_REALTIME_TRAVEL;
			buf[2] = row
			buf[3] = col
			const subj = this.keyboard.report$
				.pipe(
					filter(v => {
						return v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_GET_REALTIME_TRAVEL &&
							v[3] === row && v[4] === col
					}),
					map(v => {
						return {
							distance: (v[6] << 8) | v[5],
							row: v[3],
							col: v[4]
						}
					})
				).subscribe(v => {
					console.log(v);
					s.next(v)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getCurve(): Observable<number[][]> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_GET_CURVE;

			this.keyboard.write(buf).subscribe();
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_GET_CURVE),
					map(i => {
						return [
							[i[2], i[3]],
							[i[4], i[5]],
							[i[6], i[7]],
							[i[8], i[9]],
						]
					})
				).subscribe(r => {
					subj.unsubscribe()
					s.next(r)
				})
		})
	}

	public setCurve(c: number[][]): Observable<Result> {
		return new Observable<Result>(s => {
			const r = Result.build()
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_SET_CURVE;
			buf[2] = c[0][0]
			buf[3] = c[0][1]

			buf[4] = c[1][0]
			buf[5] = c[1][1]
			buf[6] = c[2][0]
			buf[7] = c[2][1]
			buf[8] = c[3][0]
			buf[9] = c[3][1]
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_SET_CURVE),
				)
				.subscribe(d => {
					r.setData(d)
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public calibration() {
		return new Observable<Result>(s => {
			const r = Result.build()
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_CALIBRATE;
			buf[2] = 0x2
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_CALIBRATE),
				)
				.subscribe(d => {
					r.setData(d)
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public changeProfile(profile: number) {
		this.keyboard.currentProfile = profile
		const buffer = BaseKeyboard.Buffer()
		buffer[0] = EKeyboardCommand.KC_HE;
		buffer[1] = EHECommand.AMC_SELECT_PROFILE;
		buffer[2] = profile;
		const subj = this.keyboard.report$
			.pipe(
				filter(d => d[0] === EKeyboardCommand.KC_HE && d[1] === EHECommand.AMC_SELECT_PROFILE),
			).subscribe(r => {
				this.keyboard.event$.next({type: HidDeviceEventType.ProfileChange, data: profile})
				subj.unsubscribe()
			})
		this.keyboard.write(buffer).subscribe()
	}


	public changeProfileName(buffer: number[], length: number, idx: number): Observable<Result> {
		return new Observable<Result>(s => {
			const r = Result.build()
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_SET_PROFILE_NAME
			buf[2] = idx
			buf[3] = length
			buffer.forEach((j, i) => buf[i + 4] = j)
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_SET_PROFILE_NAME),
				)
				.subscribe(d => {
					r.setSuccess(true)
					r.setData(d)
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getCalibration(): Observable<Result> {
		return new Observable<Result>(s => {
			const r = Result.build()
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_GET_CALIBRATE_STATE
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_GET_CALIBRATE_STATE),
					map(i => {
						const matrix: string[][] = []
						const bytes = i.slice(4, 22)
						for (let i = 0; i < bytes.length; i += 3) {
							const byteArr = bytes.slice(i, i + 3);
							let row: string[] = []
							byteArr.forEach(i => row = row.concat(ByteUtil.oct2Bin(i.toString(), 8).split('').reverse()))
							matrix.push(row)
						}
						return matrix
					})
				)
				.subscribe(d => {
					r.setSuccess(true)
					r.setData(d)
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public getJoyKeyboard() {
		return new Observable<number[]>(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = 0x22;
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === 0x22),
					map(v => {
						const b = ByteUtil.oct2Bin(v[3], 2)
						return [Number(b.charAt(1)), Number(b.charAt(0))]
					})
				)
				.subscribe((v: number[]) => {
					s.next(v)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public enableJoyKeyboard(v: number, xbox: number): Observable<Result> {
		return new Observable<Result>(s => {
			const r = Result.build()
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = 0x23;
			buf[2] = ByteUtil.bin2Oct(`${v}${xbox}`);
			const subj = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === 0x23),
				)
				.subscribe(d => {
					r.setSuccess(true)
					r.setData(d)
					s.next(r)
					subj.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}

	public calibrationStop() {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE
			buf[1] = 0x40
			buf[2] = 4
			this.keyboard.write(buf).subscribe(() => {
				s.next()
			})
		})
	}

	public clearProfile() {
		return new Observable(s => {
			const buffer = BaseKeyboard.Buffer()
			buffer[0] = EKeyboardCommand.KC_HE;
			buffer[1] = EHECommand.AMC_CLEAR_PROFILE_BUFFER;
			buffer[2] = this.keyboard.currentProfile;
			const subj = this.keyboard.report$
				.pipe(
					filter(d => d[0] === EKeyboardCommand.KC_HE && d[1] === EHECommand.AMC_CLEAR_PROFILE_BUFFER),
				).subscribe(r => {
					s.next()
					subj.unsubscribe()
				})
			this.keyboard.write(buffer).subscribe()
		})
	}

	public setSnapTap(data: { wordMode: number; keys: Array<[number, number]>; index: number }): Observable<any> {
		return new Observable(s => {
			const buf = BaseKeyboard.Buffer()
			buf[0] = EKeyboardCommand.KC_HE;
			buf[1] = EHECommand.AMC_SET_ACT_ON_AXIS
			buf[2] = this.keyboard.currentProfile
			buf[3] = data.keys[0][0]
			buf[4] = data.keys[0][1]
			buf[5] = data.keys[1][0]
			buf[6] = data.keys[1][1]
			buf[7] = data.index
			buf[8] = data.wordMode
			const sub = this.keyboard.report$
				.pipe(
					filter(v => v[0] === EKeyboardCommand.KC_HE && v[1] === EHECommand.AMC_SET_ACT_ON_AXIS),
					map(v => v[2] === 0)
				)
				.subscribe((v) => {
					this.saveProfile().subscribe(() => {
						s.next()
					})
					sub.unsubscribe()
				})
			this.keyboard.write(buf).subscribe()
		})
	}


	public clearAdvanceKey (): Observable<any> {
		return new Observable( s => {
			const buffer = this.keyboard.keyBufferResult.filter( i => i.code !== "KC_NO")
			const task = () => {
				const key = buffer.shift();
				this.keyboard.removeDks(key.row, key.col)
					.subscribe( () => {
						if( buffer.length ) {
							task()
						} else {
							s.next()
						}
					})
			}
			task()
		})
	}
}
