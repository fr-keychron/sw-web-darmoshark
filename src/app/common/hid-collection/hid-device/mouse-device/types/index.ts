import {EKey, EMouseBtnGameKey, PowerState} from "../enum";

type IDpiReport = { dpi: number, reportRate: number }

export interface IBaseInfo {
	workMode: number ,
	reportRate: number,
	levelCount: number,
	dpiCurrentLevel: number,
	dpiConf: {
		levelVal: number[],
		levelEnable: number
	},
	delay: number,
	sleep: number,
	power: {
		state: PowerState,
		value: number
	},
	sys: {
		lod: number ,
		wave: number,
		line: number,
		motion: number,
		scroll: number,
		eSports?: number
	},
}

export type IMouseButtonKey = {
	x: number,
	y: number,
	w: number,
	dir: 'left' | 'right',
	index: number,
	custom: false,
	name?: string,
	keyKeep?: boolean
}

export interface IMouseJson {
	dpi: {
		colors?: any;
		limit: number[],
		level: number[],
		reportRate: {
			color: string|string[],
			value: number
			type?: number[]
		}[]
	},
	name: string,
	sys: {
		lod: object[]
	},
	size: [number, number],
	keys: Array<IMouseButtonKey>
}

export interface IMacroItem {
	action: EKey
	type: EMouseBtnGameKey,
	key: { code: string, name: string, val: number },
}

export interface RecordList {
  id: string,
  action: number,
  type: string,
  key: {
    name: string,
    value: number
  }
}
export interface MacroList {
  id: string,
  name: string,
  delayNum: number,
  delayMode: string,
  loopNum: number,
  loopMode: string,
  list: RecordList[]
}

export interface Light {i: number, l: number, s: number, r: number, g: number, b: number, type?: number}
