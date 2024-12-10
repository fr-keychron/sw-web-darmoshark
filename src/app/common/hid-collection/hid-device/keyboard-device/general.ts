import {
	getLightingDefinition,
	LightingValue,
	VIADefinitionV2,
} from '@the-via/reader';
import {keycodeService} from "src/app/service/keycode/keycode.service";
import {EMacro} from "src/app/model/enum/macro";
import {KeycodeEnumService} from "src/app/service/keycode/keycode-enum.service";

export const BacklightControls: [
	LightingValue,
	string,
		{ type: string } & Record<string, any>,
	string?
][] = [
	[
		LightingValue.BACKLIGHT_BRIGHTNESS,
		'Brightness',
		{type: 'range', min: 0, max: 255},
	],
	[
		LightingValue.BACKLIGHT_EFFECT,
		'Effect',
		{
			type: 'select',
			getOptions: (definition: VIADefinitionV2 ) =>
				getLightingDefinition(definition.lighting).effects.map(
					([label]) => label,
				),
		},
	],
	[
		LightingValue.BACKLIGHT_EFFECT_SPEED,
		'Effect Speed',
		{type: 'range', min: 0, max: 3},
	], [
		LightingValue.BACKLIGHT_COLOR_1,
		'Color',
		{type: 'color'},
		'{Effect} !== 0'
	], [
		LightingValue.BACKLIGHT_COLOR_1,
		'Color',
		{type: 'color'},
		'{Effect} !== 0'
	],
];

export const UnderglowControls: [
	LightingValue,
	string,
		{ type: string } & Record<string, any>,
	string?
][] = [
	[
		LightingValue.QMK_RGBLIGHT_BRIGHTNESS,
		'Underglow Brightness',
		{type: 'range', min: 0, max: 255},
	],
	[
		LightingValue.QMK_RGBLIGHT_EFFECT,
		'Underglow Effect',
		{
			type: 'select',
			getOptions: (definition: VIADefinitionV2 ) =>
				getLightingDefinition(definition.lighting).underglowEffects.map(
					([label]) => label,
				),
		},
	],
	[
		LightingValue.QMK_RGBLIGHT_EFFECT_SPEED,
		'Underglow Effect Speed',
		{type: 'range', min: 0, max: 3},
		'{Underglow Effect} > 1'
	], [
		LightingValue.QMK_RGBLIGHT_COLOR,
		'Color',
		{type: 'color'},
		'{Underglow Effect} !== 0'
	],
];

export const macroDecodeForV11 = (r: Array<number>, macroCount: number) => {
	const EKeycode = KeycodeEnumService.getKeycodeEnum()
	let i = 0;
	let currentSequence: any = [];
	let macroId = 0;
	const sequences: any[] = [];
	const keyByte2Name = (c: any) => {
		const result = keycodeService.code2Key(c, this)
		return result ? result.capName || result.keyName : c;
	}
	while (i < r.length && macroId < macroCount) {
		let byte = r[i];
		switch (byte) {
			case EMacro.Terminate :
				sequences[macroId] = currentSequence
				macroId++;
				currentSequence = []
				break

			case 1 :
				byte = r[++i];
				switch (byte) {
					case EMacro.Tap :
						byte = r[++i];
						currentSequence.push([
							EMacro.Tap,
							keyByte2Name(byte),
							EKeycode[byte]
						])
						break
					case EMacro.Down :
						byte = r[++i];
						currentSequence.push([
							EMacro.Down,
							keyByte2Name(byte),
							EKeycode[byte]
						])
						break
					case EMacro.Up :
						byte = r[++i];
						currentSequence.push([
							EMacro.Up,
							keyByte2Name(byte),
							EKeycode[byte]
						])
						break
					case EMacro.Delay :
						let delayBytes = [];
						byte = r[++i];
						while (byte !== EMacro.DelayTerminate && i < r.length) {
							delayBytes.push(byte);
							byte = r[++i];
						}
						const delayValue = delayBytes.reduce((acc, byte) => {
							acc += String.fromCharCode(byte);
							return acc;
						}, '');
						currentSequence.push([
							EMacro.Delay,
							parseInt(delayValue),
						]);
						break;
				}
				break;
			default: {
				const char = String.fromCharCode(byte);
				if (
					currentSequence.length &&
					currentSequence[currentSequence.length - 1][0] ===
					EMacro.CharacterStream
				) {
					currentSequence[currentSequence.length - 1] = [
						EMacro.CharacterStream,
						(currentSequence[currentSequence.length - 1][1] as string) + char,
					];
				} else {
					currentSequence.push([
						EMacro.CharacterStream,
						char,
					]);
				}
				break;
			}
		}
		i++;
	}
	return sequences;
}

export const macroDecodeForV9 = (r: Array<number>, macroCount: number) => {
	const EKeycode = KeycodeEnumService.getKeycodeEnum()
	let i = 0;
	let currentSequence: any = [];
	let macroId = 0;
	const sequences: any[] = [];
	const keyByte2Name = (c: any) => {
		const result = keycodeService.code2Key(c, this)
		return result ? result.keys || result.keyName : c;
	}
	while (i < r.length && macroId < macroCount) {
		let byte = r[i];
		switch (byte) {
			case EMacro.Terminate :
				sequences[macroId] = currentSequence
				macroId++;
				currentSequence = []
				break

			case EMacro.Tap :
				byte = r[++i];
				currentSequence.push([
					EMacro.Tap,
					keyByte2Name(byte),
					EKeycode[byte]
				])
				break
			case EMacro.Down :
				byte = r[++i];
				currentSequence.push([
					EMacro.Down,
					keyByte2Name(byte),
					EKeycode[byte]
				])
				break
			case EMacro.Up :
				byte = r[++i];
				currentSequence.push([
					EMacro.Up,
					keyByte2Name(byte),
					EKeycode[byte]
				])
				break
			case EMacro.Delay :
				let delayBytes = [];
				byte = r[++i];
				while (byte !== EMacro.DelayTerminate && i < r.length) {
					delayBytes.push(byte);
					byte = r[++i];
				}
				const delayValue = delayBytes.reduce((acc, byte) => {
					acc += String.fromCharCode(byte);
					return acc;
				}, '');
				currentSequence.push([
					EMacro.Delay,
					parseInt(delayValue),
				]);
				break;
			default: {
				const char = String.fromCharCode(byte);
				if (
					currentSequence.length &&
					currentSequence[currentSequence.length - 1][0] ===
					EMacro.CharacterStream
				) {
					currentSequence[currentSequence.length - 1] = [
						EMacro.CharacterStream,
						(currentSequence[currentSequence.length - 1][1] as string) + char,
					];
				} else {
					currentSequence.push([
						EMacro.CharacterStream,
						char,
					]);
				}
				break;
			}
		}
		i++;
	}
	return sequences;
}
