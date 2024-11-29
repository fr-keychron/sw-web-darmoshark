import keyJsonJis from 'src/app/common/json/keycode-jis.json'
import keyJsonEn from 'src/app/common/json/keycode-en.json'
import {IKeycode, IKeycodeMenu} from "../../model";
import {BaseKeyboard} from '../../common/hid-collection'
import {KeycodeEnumService} from './keycode-enum.service';
import {ByteUtil} from "../../utils";

const quantumRangesKeys = [
	'_QK_MODS',
	'_QK_MODS_MAX',
	'_QK_MOD_TAP',
	'_QK_MOD_TAP_MAX',
	'_QK_LAYER_TAP',
	'_QK_LAYER_TAP_MAX',
	'_QK_LAYER_MOD',
	'_QK_LAYER_MOD_MAX',
	'_QK_TO',
	'_QK_TO_MAX',
	'_QK_MOMENTARY',
	'_QK_MOMENTARY_MAX',
	'_QK_DEF_LAYER',
	'_QK_DEF_LAYER_MAX',
	'_QK_TOGGLE_LAYER',
	'_QK_TOGGLE_LAYER_MAX',
	'_QK_ONE_SHOT_LAYER',
	'_QK_ONE_SHOT_LAYER_MAX',
	'_QK_ONE_SHOT_MOD',
	'_QK_ONE_SHOT_MOD_MAX',
	'_QK_LAYER_TAP_TOGGLE',
	'_QK_LAYER_TAP_TOGGLE_MAX',
	'_QK_KB',
	'_QK_KB_MAX',
	'_QK_MACRO',
	'_QK_MACRO_MAX',
];

const quantumRanges = (): Record<string, number> => {
	const EKeycode = KeycodeEnumService.getKeycodeEnum()
	return Object.keys(EKeycode).reduce(
		(acc, key: any) =>
			quantumRangesKeys.includes(key)
				? {...acc, [key]: EKeycode[key]}
				: acc,
		{},
	);
};

const modCodes = {
	QK_LCTL: 0x0100,
	QK_LSFT: 0x0200,
	QK_LALT: 0x0400,
	QK_LGUI: 0x0800,
	QK_RMODS_MIN: 0x1000,
	QK_RCTL: 0x1100,
	QK_RSFT: 0x1200,
	QK_RALT: 0x1400,
	QK_RGUI: 0x1800,
};

const modMasks = {
	MOD_LCTL: 0x0001,
	MOD_LSFT: 0x0002,
	MOD_LALT: 0x0004,
	MOD_LGUI: 0x0008,
	MOD_RCTL: 0x0011,
	MOD_RSFT: 0x0012,
	MOD_RALT: 0x0014,
	MOD_RGUI: 0x0018,
	MOD_HYPR: 0x000f,
	MOD_MEH: 0x0007,
};

const topLevelMacroToValue = {
	MT: '_QK_MOD_TAP', // MT(mod, kc)
	LT: '_QK_LAYER_TAP', // LT(layer, kc)
	LM: '_QK_LAYER_MOD', // LM(layer, mod)
	TO: '_QK_TO', // TO(layer)
	MO: '_QK_MOMENTARY', // MO(layer)
	DF: '_QK_DEF_LAYER', //DF(layer)
	TG: '_QK_TOGGLE_LAYER', //  TG(layer)
	OSL: '_QK_ONE_SHOT_LAYER', // OSL(layer)
	OSM: '_QK_ONE_SHOT_MOD', //OSM(mod)
	TT: '_QK_LAYER_TAP_TOGGLE', // TT(layer)
	CUSTOM: '_QK_KB', // CUSTOM(n)
	MACRO: '_QK_MACRO', // MACRO(n)
};

const modifierKeyToValue = {
	LCTL: modCodes.QK_LCTL,
	C: modCodes.QK_LCTL,
	LSFT: modCodes.QK_LSFT,
	S: modCodes.QK_LSFT,
	LALT: modCodes.QK_LALT,
	A: modCodes.QK_LALT,
	LGUI: modCodes.QK_LGUI,
	LCMD: modCodes.QK_LGUI,
	LWIN: modCodes.QK_LGUI,
	G: modCodes.QK_LGUI,
	RCTL: modCodes.QK_RCTL,
	RSFT: modCodes.QK_RSFT,
	ALGR: modCodes.QK_RALT,
	RALT: modCodes.QK_RALT,
	RCMD: modCodes.QK_RGUI,
	RWIN: modCodes.QK_RGUI,
	RGUI: modCodes.QK_RGUI,
	SCMD: modCodes.QK_LSFT | modCodes.QK_LGUI,
	SWIN: modCodes.QK_LSFT | modCodes.QK_LGUI,
	SGUI: modCodes.QK_LSFT | modCodes.QK_LGUI,
	LSG: modCodes.QK_LSFT | modCodes.QK_LGUI,
	LAG: modCodes.QK_LALT | modCodes.QK_LGUI,
	RSG: modCodes.QK_RSFT | modCodes.QK_RGUI,
	RAG: modCodes.QK_RALT | modCodes.QK_RGUI,
	LCA: modCodes.QK_LCTL | modCodes.QK_LALT,
	LSA: modCodes.QK_LSFT | modCodes.QK_LALT,
	SAGR: modCodes.QK_RSFT | modCodes.QK_RALT,
	RSA: modCodes.QK_RSFT | modCodes.QK_RALT,
	RCS: modCodes.QK_RCTL | modCodes.QK_RSFT,
	LCAG: modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LGUI,
	MEH: modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LSFT,
	HYPR:
		modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LSFT | modCodes.QK_LGUI,
};

const modifierValueToKey: Record<number, string> = Object.entries(
	modifierKeyToValue,
).reduce((acc, [key, value]) => ({...acc, [value]: key}), {});

const leftModifierValueToKey: Record<number, string> = Object.entries(
	modifierKeyToValue,
)
	.filter(
		([_, value]) =>
			Object.values(modCodes).includes(value) && value < modCodes.QK_RMODS_MIN,
	)
	.reduce((acc, [key, value]) => ({...acc, [value]: key}), {});

const rightModifierValueToKey: Record<number, string> = Object.entries(
	modifierKeyToValue,
)
	.filter(
		([_, value]) =>
			Object.values(modCodes).includes(value) && value >= modCodes.QK_RMODS_MIN,
	)
	.reduce((acc, [key, value]) => ({...acc, [value]: key}), {});

const topLevelModToString = (
	keycode: number,
): string => {
	const EKeycode = KeycodeEnumService.getKeycodeEnum()
	const containedKeycode = EKeycode[keycode & 0x00ff];
	const modifierValue = keycode & 0x1f00;
	const modifierKey = modifierValueToKey[modifierValue];
	if (modifierKey != undefined) {
		return modifierKey + '(' + containedKeycode + ')';
	}
	const enabledMods = Object.entries(
		modifierValue & modCodes.QK_RMODS_MIN
			? rightModifierValueToKey
			: leftModifierValueToKey,
	)
		.filter((part) => {
			const current = Number.parseInt(part[0]);
			return (current & modifierValue) === current;
		})
		.map((part) => part[1]);
	return (
		enabledMods.join('(') +
		'(' +
		containedKeycode +
		')'.repeat(enabledMods.length)
	);
};
const modValueToString = (modMask: number): string => {
	const excluded = ['MOD_HYPR', 'MOD_MEH'];
	const qualifyingStrings = Object.entries(modMasks)
		.filter(
			(part) => !excluded.includes(part[0]) && (part[1] & modMask) === part[1],
		)
		.map((part) => part[0]);
	return qualifyingStrings.join(' | ');
};
const topLevelValueToMacro = (
	basicKeyToByte: any,
): Record<number, string> => {
	return Object.entries(topLevelMacroToValue).reduce(
		(acc, [key, value]) => ({...acc, [basicKeyToByte[value]]: key}),
		{},
	);
};

const parseTopLevelMacro = (
	inputParts: string[],
	basicKeyToByte: any,
): number => {
	const EKeycode = KeycodeEnumService.getKeycodeEnum()
	const topLevelKey = inputParts[0];
	const parameter = inputParts[1] ?? '';
	let [param1, param2] = ['', ''];
	let layer = 0;
	let mods = 0;
	switch (topLevelKey) {
		case 'MO':
		case 'DF':
		case 'TG':
		case 'OSL':
		case 'TT':
		case 'TO':
			layer = Number.parseInt(parameter);
			if (layer < 0) {
				return 0;
			}
			return basicKeyToByte[topLevelMacroToValue[topLevelKey]] | (layer & 0xff);
		case 'OSM': //#define OSM(mod) (QK_ONE_SHOT_MOD | ((mod)&0xFF))
			mods = parseMods(parameter);
			if (mods === 0) {
				return 0;
			}
			return basicKeyToByte[topLevelMacroToValue[topLevelKey]] | (mods & 0xff);
		case 'LM': //#define LM(layer, mod) (QK_LAYER_MOD | (((layer)&0xF) << 4) | ((mod)&0xF))
			[param1, param2] = parameter.split(',').map((s) => s.trim());
			let mask = EKeycode._QK_LAYER_MOD_MASK;
			let shift = Math.log2(mask + 1);
			layer = Number.parseInt(param1);
			mods = parseMods(param2);
			if (layer < 0 || mods === 0) {
				return 0;
			}
			return (
				basicKeyToByte[topLevelMacroToValue[topLevelKey]] |
				((layer & 0xf) << shift) |
				(mods & mask)
			);
		case 'LT': //#define LT(layer, kc) (QK_LAYER_TAP | (((layer)&0xF) << 8) | ((kc)&0xFF))
			[param1, param2] = parameter.split(',').map((s) => s.trim());
			layer = Number.parseInt(param1);
			if (layer < 0 || !basicKeyToByte.hasOwnProperty(param2)) {
				return 0;
			}
			return (
				basicKeyToByte[topLevelMacroToValue[topLevelKey]] |
				((layer & 0xf) << 8) |
				basicKeyToByte[param2]
			);
		case 'MT': // #define MT(mod, kc) (QK_MOD_TAP | (((mod)&0x1F) << 8) | ((kc)&0xFF))
			[param1, param2] = parameter.split(',').map((s) => s.trim());
			mods = parseMods(param1);
			if (mods === 0 || !basicKeyToByte.hasOwnProperty(param2)) {
				return 0;
			}
			return (
				basicKeyToByte[topLevelMacroToValue[topLevelKey]] |
				((mods & 0x1f) << 8) |
				(basicKeyToByte[param2] & 0xff)
			);
		case 'CUSTOM': {
			const n = Number.parseInt(parameter);
			const nMax = basicKeyToByte._QK_KB_MAX - basicKeyToByte._QK_KB;
			if (n >= 0 && n <= nMax) {
				return basicKeyToByte[topLevelMacroToValue[topLevelKey]] + n;
			}
			return 0;
		}
		case 'MACRO': {
			const n = Number.parseInt(parameter);
			const nMax = basicKeyToByte._QK_MACRO_MAX - basicKeyToByte._QK_MACRO;
			if (n >= 0 && n <= nMax) {
				return basicKeyToByte[topLevelMacroToValue[topLevelKey]] + n;
			}
			return 0;
		}
		default:
			return 0;
	}
};

const parseMods = (input: string = ''): number => {
	const parts = input.split('|').map((s) => s.trim());
	if (
		!parts.reduce((acc, part) => acc && modMasks.hasOwnProperty(part), true)
	) {
		return 0;
	}
	return parts.reduce(
		(acc, part) => acc | modMasks[part as keyof typeof modMasks],
		0,
	);
};

const parseModifierCode = (
	inputParts: string[],
	basicKeyToByte: any,
): number => {
	const realParts = inputParts.filter((nonce) => nonce.length !== 0);
	const bytes = realParts.map((part, idx) => {
		if (idx === realParts.length - 1) {
			return basicKeyToByte.hasOwnProperty(part) ? basicKeyToByte[part] : null;
		} else {
			return modifierKeyToValue.hasOwnProperty(part)
				? modifierKeyToValue[part as keyof typeof modifierKeyToValue]
				: null;
		}
	});
	if (bytes.find((e) => e === null)) {
		return 0;
	}
	return bytes.reduce((acc, byte) => acc | byte, 0);
};

class KeycodeService {
	constructor() {
	}

	public loadKeyJson(deviceName: string) {
		if (/jis/gi.test(deviceName)) {
			this.keyJson = keyJsonJis
		} else {
			this.keyJson = keyJsonEn
		}
	}

	private keyJson: Array<any>;


	public getJson(): Array<any> {
		return this.keyJson
	}

	public getByCode(code: string): any {
		const json = this.keyJson ? this.keyJson : keyJsonEn;
		return json
			.flat()
			.map(i => i['keycodes'])
			.flat()
			.find(i => i.code === code) ?? null;
	}

	public getByCategory(category: string): Record<string, any> {
		return this.keyJson.find(i => i['id'] === category) as Record<string, any>
	}

	private isLayerKey(keyByte: number) {
		const EKeycode = KeycodeEnumService.getKeycodeEnum()
		return [
			[EKeycode._QK_TO, EKeycode._QK_TO_MAX],
			[EKeycode._QK_MOMENTARY, EKeycode._QK_MOMENTARY_MAX],
			[EKeycode._QK_DEF_LAYER, EKeycode._QK_DEF_LAYER_MAX],
			[EKeycode._QK_TOGGLE_LAYER, EKeycode._QK_TOGGLE_LAYER_MAX],
			[EKeycode._QK_ONE_SHOT_LAYER, EKeycode._QK_ONE_SHOT_LAYER_MAX],
			[
				EKeycode._QK_LAYER_TAP_TOGGLE,
				EKeycode._QK_LAYER_TAP_TOGGLE_MAX,
			],
			[EKeycode._QK_KB, EKeycode._QK_KB_MAX],
			[EKeycode._QK_MACRO, EKeycode._QK_MACRO_MAX],
		].some(code => keyByte >= code[0] && keyByte <= code[1])
	}

	private code2LayerByte(byte: number, hidDevice: BaseKeyboard) {
		const EKeycode = KeycodeEnumService.getKeycodeEnum()
		if (EKeycode._QK_TO <= byte && EKeycode._QK_TO_MAX >= byte) {
			const layer = byte - EKeycode._QK_TO;
			return `TO(${layer})`;
		} else if (
			EKeycode._QK_MOMENTARY <= byte &&
			EKeycode._QK_MOMENTARY_MAX >= byte
		) {
			const layer = byte - EKeycode._QK_MOMENTARY;
			return `MO(${layer})`;
		} else if (
			EKeycode._QK_DEF_LAYER <= byte &&
			EKeycode._QK_DEF_LAYER_MAX >= byte
		) {
			const layer = byte - EKeycode._QK_DEF_LAYER;
			return `DF(${layer})`;
		} else if (
			EKeycode._QK_TOGGLE_LAYER <= byte &&
			EKeycode._QK_TOGGLE_LAYER_MAX >= byte
		) {
			const layer = byte - EKeycode._QK_TOGGLE_LAYER;
			return `TG(${layer})`;
		} else if (
			EKeycode._QK_ONE_SHOT_LAYER <= byte &&
			EKeycode._QK_ONE_SHOT_LAYER_MAX >= byte
		) {
			const layer = byte - EKeycode._QK_ONE_SHOT_LAYER;
			return `OSL(${layer})`;
		} else if (
			EKeycode._QK_LAYER_TAP_TOGGLE <= byte &&
			EKeycode._QK_LAYER_TAP_TOGGLE_MAX >= byte
		) {
			const layer = byte - EKeycode._QK_LAYER_TAP_TOGGLE;
			return `TT(${layer})`;
		} else if (
			EKeycode._QK_KB <= byte &&
			EKeycode._QK_KB_MAX >= byte
		) {
			const n = byte - EKeycode._QK_KB;
			const custom = hidDevice.definition?.customKeycodes as IKeycode[] ?? []
			const name = custom[n]?.shortName as string;
			return custom.length && n < custom.length ? {title: custom[n].title, shortName: name} : `CUSTOM(${n})`;
		} else if (
			EKeycode._QK_MACRO <= byte &&
			EKeycode._QK_MACRO_MAX >= byte
		) {
			const n = byte - EKeycode._QK_MACRO;
			return `MACRO(${n})`;
		}
		return '';
	}

	public code2Key(keyByte: number, hidDevice: BaseKeyboard) {
		const EKeycode = KeycodeEnumService.getKeycodeEnum()
		const val = EKeycode[keyByte];
		let code: any = '';
		if (val && !val.startsWith('_QK')) {
			code = val;
		} else if (this.isLayerKey(keyByte)) {
			code = this.code2LayerByte(keyByte, hidDevice);
		} else if (
			this.advancedKeycodeToString(keyByte) !== null
		) {
			code = this.advancedKeycodeToString(keyByte) as string
		} else {
			code = '0x' + Number(keyByte).toString(16);
		}

		const v = this.getByCode(code) ? this.getByCode(code) : code
		return {
			keyCode: code,
			keyName: v ? v.shortName || v.name || v : v,
			name: v ? v.name : v,
			keyTitle: v ? v.title : v,
			keyVal: keyByte,
			keyHex: keyByte.toString(16),
			keys: v.keys,
			capName: v ? v.capName : null
		}
	}

	private advancedKeycodeToString(keyByte: number) {
		const EKeycode = KeycodeEnumService.getKeycodeEnum()
		let valueToRange: Array<any> = Object.entries(quantumRanges())
			.map(([key, value]) => [value, key])
			.sort((a, b) => (a[0] as number) - (b[0] as number));
		let lastRange = null;
		let lastValue: number = -1;
		for (let i = 0; i < valueToRange.length; i += 2) {
			if (
				keyByte >= valueToRange[i][0] &&
				keyByte <= valueToRange[i + 1][0]
			) {
				lastRange = valueToRange[i][1];
				lastValue = +valueToRange[i][0];
			}
		}

		const topLevelModKeys = ['_QK_MODS'];
		if (topLevelModKeys.includes(lastRange as string)) {
			return topLevelModToString(keyByte);
		}
		let humanReadable: string | null =
			(topLevelValueToMacro(EKeycode) as any)[lastValue] + '(';
		let remainder = keyByte & ~lastValue;
		let layer = 0;
		let keycode = '';
		let modValue = 0;
		switch (lastRange) {
			case '_QK_KB':
			case '_QK_MACRO':
				humanReadable += keyByte - lastValue + ')';
				break;
			case '_QK_MOMENTARY':
			case '_QK_DEF_LAYER':
			case '_QK_TOGGLE_LAYER':
			case '_QK_ONE_SHOT_LAYER':
			case '_QK_LAYER_TAP_TOGGLE':
			case '_QK_TO':
				humanReadable += remainder + ')';
				break;
			case '_QK_LAYER_TAP':
				layer = remainder >> 8;
				keycode = EKeycode[remainder & 0xff];
				humanReadable += layer + ',' + keycode + ')';
				break;
			case '_QK_ONE_SHOT_MOD':
				humanReadable += modValueToString(remainder) + ')';
				break;
			case '_QK_LAYER_MOD':
				let mask = EKeycode._QK_LAYER_MOD_MASK;
				let shift = Math.log2(mask + 1);
				layer = remainder >> shift;
				modValue = remainder & mask;
				humanReadable += layer + ',' + modValueToString(modValue) + ')';
				break;
			case '_QK_MOD_TAP':
				modValue = (remainder >> 8) & 0x1f;
				keycode = EKeycode[remainder & 0xff];
				humanReadable += modValueToString(modValue) + ',' + keycode + ')';
				break;
			default:
				humanReadable = null;
		}
		return humanReadable;
	}

	private getByteForLayerCode(code: string): number {
		const EKeycode = KeycodeEnumService.getKeycodeEnum()
		const keycodeMatch = code.match(/([A-Za-z]+)\((\d+)\)/);
		if (keycodeMatch) {
			const [, code, layer] = keycodeMatch;
			const numLayer = parseInt(layer);
			switch (code) {
				case 'TO': {
					return Math.min(
						EKeycode._QK_TO + numLayer,
						EKeycode._QK_TO_MAX,
					);
				}
				case 'MO': {
					return Math.min(
						EKeycode._QK_MOMENTARY + numLayer,
						EKeycode._QK_MOMENTARY_MAX,
					);
				}
				case 'DF': {
					return Math.min(
						EKeycode._QK_DEF_LAYER + numLayer,
						EKeycode._QK_DEF_LAYER_MAX,
					);
				}
				case 'TG': {
					return Math.min(
						EKeycode._QK_TOGGLE_LAYER + numLayer,
						EKeycode._QK_TOGGLE_LAYER_MAX,
					);
				}
				case 'OSL': {
					return Math.min(
						EKeycode._QK_ONE_SHOT_LAYER + numLayer,
						EKeycode._QK_ONE_SHOT_LAYER_MAX,
					);
				}
				case 'TT': {
					return Math.min(
						EKeycode._QK_LAYER_TAP_TOGGLE + numLayer,
						EKeycode._QK_LAYER_TAP_TOGGLE_MAX,
					);
				}
				case 'CUSTOM': {
					return Math.min(
						EKeycode._QK_KB + numLayer,
						EKeycode._QK_KB_MAX,
					);
				}
				case 'MACRO': {
					return Math.min(
						EKeycode._QK_MACRO + numLayer,
						EKeycode._QK_MACRO_MAX,
					);
				}
				default: {
					throw new Error('Incorrect code');
				}
			}
		}
		throw new Error('No match found');
	}

	public code2Byte(code: any) {
		const EKeycode = KeycodeEnumService.getKeycodeEnum()
		const val = EKeycode[code] as unknown as number
		const isLayerCode = (code: string) => /([A-Za-z]+)\((\d+)\)/.test(code);
		if (val) {
			return val
		} else if (val === 0) {
			return 0
		} else if (isLayerCode(code)) {
			return this.getByteForLayerCode(code)
		} else if (this.advancedStringToKeycode(code) !== null) {
			return this.advancedStringToKeycode(code);
		}
		return 0
	}

	private advancedStringToKeycode(keyByte: string) {
		const EKeycode = KeycodeEnumService.getKeycodeEnum()
		const upperString = keyByte.toUpperCase();
		const parts = upperString.split(/\(|\)/).map((part) => part.trim());
		if (Object.keys(topLevelMacroToValue).includes(parts[0])) {
			return parseTopLevelMacro(parts, EKeycode);
		} else if (Object.keys(modifierKeyToValue).includes(parts[0])) {
			return parseModifierCode(parts, EKeycode);
		}
		return ByteUtil.hex2Oct(keyByte);
	}

	public buildLayerMenu(layer: number): IKeycodeMenu {
		const hardCodedKeycodes: IKeycode[] = [
			{
				name: 'Fn1\n(Fn3)',
				code: 'FN_MO13',
				title: 'Hold = Layer 1, Hold with Fn2 = Layer 3',
				shortName: 'Fn1(3)',
			},
			{
				name: 'Fn2\n(Fn3)',
				code: 'FN_MO23',
				title: 'Hold = Layer 2, Hold with Fn1 = Layer 3',
				shortName: 'Fn2(3)',
			},
			{
				name: 'Space Fn1',
				code: 'LT(1,KC_SPC)',
				title: 'Hold = Layer 1, Tap = Space',
				shortName: 'Spc Fn1',
			},
			{
				name: 'Space Fn2',
				code: 'LT(2,KC_SPC)',
				title: 'Hold = Layer 2, Tap = Space',
				shortName: 'Spc Fn2',
			},
			{
				name: 'Space Fn3',
				code: 'LT(3,KC_SPC)',
				title: 'Hold = Layer 3, Tap = Space',
				shortName: 'Spc Fn3',
			},
		];

		const menu: IKeycodeMenu = {
			id: 'layers',
			label: 'Layers',
			width: 'label',
			keycodes: [
				{
					name: 'MO',
					code: 'MO(layer)',
					type: 'layer',
					layer: 0,
					title: 'Momentary turn layer on',
				},
				{
					name: 'TG',
					code: 'TG(layer)',
					type: 'layer',
					layer: 0,
					title: 'Toggle layer on/off',
				},
				{
					name: 'TT',
					code: 'TT(layer)',
					type: 'layer',
					layer: 0,
					title:
						'Normally acts like MO unless it\'s tapped multple times which toggles layer on',
				},
				{
					name: 'OSL',
					code: 'OSL(layer)',
					type: 'layer',
					layer: 0,
					title: 'Switch to layer for one keypress',
				},
				{
					name: 'TO',
					code: 'TO(layer)',
					type: 'layer',
					layer: 0,
					title: 'Turn on layer when pressed',
				},
				{
					name: 'DF',
					code: 'DF(layer)',
					type: 'layer',
					layer: 0,
					title: 'Sets the default layer',
				},
			],
		};
		return {
			...menu,
			keycodes: [
				...hardCodedKeycodes,
				...menu.keycodes.flatMap((keycode) => {
					let res: IKeycode[] = [];
					for (let idx = 0; idx < layer; idx++) {
						const newTitle = (keycode.title || '').replace(
							'layer',
							`layer ${idx}`,
						);
						const newCode = keycode.code.replace('layer', `${idx}`);
						const newName = keycode.name + `(${idx})`;
						res = [
							...res,
							{...keycode, name: newName, title: newTitle, code: newCode},
						];
					}
					return res;
				}),
			],
		};
	}

	public nameToJsonKey(s: any) {
		const EKeycode = KeycodeEnumService.getKeycodeEnum()
		const EEventToKeyByte = KeycodeEnumService.keyeventCode2Keycode()
		const byte = EEventToKeyByte[s];
		return byte ? EKeycode[byte[0]] : null
	}

	public codeToJsonName(c: any) {
		const v = this.getByCode(c).name.split('\n');
		return [
			v[1] ? v[1] : v[0].toLowerCase(),
			v[0]
		]
	}
}

export const keycodeService = new KeycodeService()
