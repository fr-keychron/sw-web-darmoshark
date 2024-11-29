import {BaseKeyboard} from "./base-keyboard";
import {EKnobDirection} from "src/app/model";

export interface IHidOpen {
	success: boolean,
	msg: string,
	hidDevice: BaseKeyboard
}

export enum HidDeviceEventType {
	ProtocolVersion,
	LayerCount,
	JsonConf,
	KeymapBuffer,
	Complete,
	JsonConfLoadError,
	KnobUpdate,
	ProfileChange,
	FirmwareVersion,
	Reset,
	LayerChange,
	matrix
}

export interface IHidDeviceEvent {
	type: HidDeviceEventType,
	data: string | number | Record<string, any> | boolean
}

export interface IKeyBufferResult {
	val: number,
	code: string,
	hex: string
	name: string
	longName: string
	title: string
	col: number,
	row: number,
	total?: number,
	capName?: string
}

export interface IKeyPressResult {
	key: IKeyBufferResult,
	index: number
}

export interface IKeyKnob {
	direction: EKnobDirection,
	id: number,
}


export interface IDks {
	index: number,
	travel: Array<number>,
	action: Array<number[]>,
	keys: {
		keyCode: string
		keyName: string
		keyTitle: string
		keyVal: number
		keyHex: string
	}[]
	keyInfo: IKeyBufferResult
}

export interface IHeConf {
	advance_press: number
	advance_release: number
	distance: number
	dksIndex: number
	mode: number
	advanceMode: number
	row?: number
	col?: number,
	dirty?: boolean
	edit: {
		advance_press: number,
		advance_release: number,
		distance: number,
		mode: number
	}
}

export interface ISnapTap {
	keys: Array<IKeyBufferResult>,
	type: number,
	index: number,
	notSave?: boolean
}

export interface IProfileBuffer {
	dks: Array<IDks>,
	toggle: Array<IKeyBufferResult>,
	global: IHeConf,
	keyMatrix: Array<IHeConf[]>
	analog: Record<string, IKeyBufferResult>,
	analogKey?: boolean,
	snapTap?: Array<ISnapTap>
	profileNames: string[];
	current: number,
	total: number,
	size: number,
	curve?: number[][]
}

export class ProfileBuffer implements IProfileBuffer {
	analog: Record<string, IKeyBufferResult> = {}
	curve: number[][] = []
	dks: Array<IDks> = []
	global: IHeConf;
	keyMatrix: Array<IHeConf[]> = []
	toggle: Array<IKeyBufferResult> = []
	profileNames: string[] = []
	size: number = 0
	current: number = 0
	total: number = 0
	analogKey: boolean;
	snapTap: Array<ISnapTap> = []

	constructor(json: Record<string, any>) {
		this.setVal(json)
	}


	private isType(v: any, type: "Number" | "String" | "Object") {
		return Object.prototype.toString.call('') === `[object ${type}]`
	}

	private toNum(v: string | number) {
		if (this.isType(v, "Number")) {
			return Number(v)
		}
		return 0
	}

	public setVal(json: Record<string, any>) {
		if (json['current']) this.current = this.toNum(json['current']);
		if (json['total']) this.total = this.toNum(json['total']);
		if (json['size']) this.size = this.toNum(json['size']);

		const sa = json['profileNames']
		if (sa && sa.length) {
			if (!(sa.filter((i: any) => !(typeof i === 'string')))) {
				this.profileNames = sa;
			}
		}

		if (json['global'] && this.isType(json['global'], "Object")) {
			// this.setGlobal(json['global'])
		}

		const matrix = json['keyMatrix']
		if (matrix && matrix.length) {
			this.setMatrix(matrix)
		}
	}

	private setHeConf(v: Record<string, any>) {
		const {
			advance_press,
			advance_release,
			distance,
			dskIndex,
			mode,
			advanceMode,
			row,
			col
		} = v;

		const output = {
			advance_press: 0,
			advance_release: 0,
			distance: 0,
			dskIndex: 0,
			mode: 0,
			advanceMode: 0,
			row: 0,
			col: 0
		}
		const isNum = (v: any) => this.isType(v, 'Number')
		if (isNum(advance_press)) output.advance_press = advance_press
		if (isNum(advance_release)) output.advance_release = advance_release
		if (isNum(distance)) output.distance = distance
		if (isNum(dskIndex)) output.dskIndex = dskIndex
		if (isNum(mode)) output.mode = mode
		if (isNum(advanceMode)) output.advanceMode = advanceMode
		if (isNum(row)) output.row = row
		if (isNum(col)) output.col = col
	}

	private setMatrix(v: Array<any[]>) {

	}
}