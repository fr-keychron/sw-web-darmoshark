import {IKeycode} from "./keycode";
import {IKeyConf} from "./keyConf";

export interface IKeyBoardDef {
	name: string
	vendorProductId: number
	bootloader?: string;
	updateSupport?: boolean
	matrix: { rows: number, cols: number }
	layers: string[];
	keycodes: Array<string>
	customKeycodes: Array<IKeycode>
	menus: Array<any>
	lighting: any
	feature: string[],
	extra?: {
		he?: {
			distance: {
				max: number,
				min: number
			}
		}
	},
	layouts: {
		height: number,
		width: number,
		keys: Array<IKeyConf>
	},
	style: {
		bg: string,
		base: any
	}
}
