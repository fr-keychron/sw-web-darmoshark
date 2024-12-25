import { TranslateService } from "@ngx-translate/core";
import {EKey, EMouseBtnGameKey, PowerState} from "../enum";
import { HttpClient } from "@angular/common/http";
import { Transceiver } from "../../../transceiver/transceiver";

export type IDpiReport = { dpi: number, reportRate: number }

export interface IBaseInfo {
	workMode: number ,
	feature?: number,
	profile: number,
	reportRateMax?: number,
	usb: IDpiReport,
	rf: IDpiReport,
	bt: IDpiReport,
	dpiConf: {
		levelVal: number[],
		levelEnable: number
	},
	gears: number,
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
		eSports?: number,
	},
	supportFeat?: Array<string>,
	scroll?: {
		speed: number,
		inertia: number,
		spl: number
	},
	debounce?: number[]
}

export type IMouseButtonKey = {
	x: number,
	y: number,
	w: number,
	dir: 'left' | 'right',
	index: number,
	custom: false,
	name?: string,
	title?: string
}

export interface IMouseJson {
	name: string,
	type: string,
	device?: {
			usagePage: string | number,
			usage: string | number,
			contract?: string | number
	},
	light?:{ value: number, name: string }[],
	size: number[],
	keys: IMouseButtonKey[],
	dpi: {
		limit: [number, number],
		level: number[],
    colors?: string[],
		reportRate: {
			type?: number[], // 0  1 2
			value: number,
			color: string
		}[]
	},
	sys: {
		lod: { index: number, value: string }[],
		sencor?: any
	}
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

export interface MouseBase {
	product: any, 
	json: IMouseJson,
	hid: any,
	i18n: TranslateService,
	http: HttpClient,
	transceiver?: Transceiver
}

export interface Light {i: number, l: number, s: number, r: number, g: number, b: number, type?: number}
