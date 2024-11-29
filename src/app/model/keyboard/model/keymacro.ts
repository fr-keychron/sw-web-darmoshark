// import {KeycodeEnumService} from "src/app/service/keycode/keycode-enum.service";
import {EMacro} from "../../enum/macro";
import {IKeyMacros} from "../types";
// import {keycodeService} from "src/app/service/keycode/keycode.service";

const splitExpression = (expression: string): string[] => {
	let regex;
	try {
		regex = eval("/(?<!\\\\)({.*?})/g");
		return expression.split(regex).filter((s) => s.length);
	} catch (e) {
		console.error("Lookbehind is not supported in this browser.");
		return [];
	}
};

export class KeyMacro {
	private seq: IKeyMacros = [];

	constructor(v: IKeyMacros) {
		this.seq = v;
	}

	static toMacroStr(v: IKeyMacros = []): Array<string> {
		return v.map((j) =>
			j
				.map((i) => {
					let v: any;
					switch (i[0]) {
						case EMacro.Delay:
							v = `{${i[1]}}`;
							break;

						case EMacro.Tap:
							v = `{${i[2]}}`;
							break;

						case EMacro.Up:
							v = `{-${i[2]}}`;
							break;

						case EMacro.Down:
							v = `{+${i[2]}}`;
							break;

						case EMacro.CharacterStream:
							v = i[1];
							break;
					}
					return v;
				})
				.join("")
		);
	}

	// static toMacroBufForV11(sequences: IKeyMacros) {
	// 	return sequences.flatMap((sequence) => {
	// 		const bytes: number[] = [];
	// 		const EKeycode = KeycodeEnumService.getKeycodeEnum();
	// 		sequence.forEach((element) => {
	// 			switch (element[0]) {
	// 				case EMacro.Tap:
	// 					bytes.push(1, EMacro.Tap, EKeycode[element[2]]);
	// 					break;
	// 				case EMacro.Down:
	// 					bytes.push(1, EMacro.Down, EKeycode[element[2]]);
	// 					break;
	// 				case EMacro.Up:
	// 					bytes.push(1, EMacro.Up, EKeycode[element[2]]);
	// 					break;
	// 				case EMacro.Delay:
	// 					let delay: string = `${Number(element[1])}`;
	// 					bytes.push(
	// 						1,
	// 						EMacro.Delay,
	// 						...delay.split("").map((char) => char.charCodeAt(0)),
	// 						EMacro.DelayTerminate
	// 					);
	// 					break;
	// 				case EMacro.CharacterStream:
	// 					bytes.push(
	// 						...(element[1] as string)
	// 							.split("")
	// 							.map((char) => char.charCodeAt(0))
	// 					);
	// 					break;
	// 			}
	// 		});
	// 		bytes.push(0);
	// 		return bytes;
	// 	});
	// }

	// static toMacroBufForV9(sequences: IKeyMacros) {
	// 	return sequences.flatMap((sequence) => {
	// 		const bytes: number[] = [];
	// 		const EKeycode = KeycodeEnumService.getKeycodeEnum();
	// 		sequence.forEach((element) => {
	// 			switch (element[0]) {
	// 				case EMacro.Tap:
	// 					bytes.push(EMacro.Tap, EKeycode[element[2]]);
	// 					break;
	// 				case EMacro.Down:
	// 					bytes.push(EMacro.Down, EKeycode[element[2]]);
	// 					break;
	// 				case EMacro.Up:
	// 					bytes.push(EMacro.Up, EKeycode[element[2]]);
	// 					break;
	// 				case EMacro.Delay:
	// 					break;
	// 				case EMacro.CharacterStream:
	// 					bytes.push(
	// 						...(element[1] as string)
	// 							.split("")
	// 							.map((char) => char.charCodeAt(0))
	// 					);
	// 					break;
	// 			}
	// 		});
	// 		bytes.push(0);
	// 		return bytes;
	// 	});
	// }

	static toMacroSeq(v: IKeyMacros): Array<any> {
		return v.map((i) => {
			return i.map((j) => [j[0], j[1]]);
		});
	}

	// static strToMarcoItem(s: string) {
	// 	let expression: string[] = splitExpression(s);
	// 	let result: any[] = [];
	// 	expression.forEach((element) => {
	// 		if (/^{.*}$/.test(element)) {
	// 			element = element.slice(1, -1);
	// 			if (/^\d+$/.test(element)) {
	// 				result.push([EMacro.Delay, parseInt(element)]);
	// 			} else {
	// 				const downOrUpAction = /^[+-]/.test(element)
	// 					? element.slice(0, 1)
	// 					: null;
	// 				const keycodes = element
	// 					.replace(/^[+-]/, "")
	// 					.split(",")
	// 					.map((keycode) => keycode.trim().toUpperCase())
	// 					.filter((keycode) => keycode.length);

	// 				const keyName = keycodeService.codeToJsonName(keycodes[0])[0]
	// 				if (keycodes.length > 0) {
	// 					if (downOrUpAction == null) {
	// 						if (keycodes.length == 1) {
	// 							result.push([EMacro.Tap, keyName, keycodes[0]]);
	// 						} else {
	// 							result.push([6, keycodes]);
	// 						}
	// 					} else {
	// 						const action: any =
	// 							downOrUpAction == "+" ? EMacro.Down : EMacro.Up;
	// 						result.push([action, keyName, keycodes[0]]);
	// 					}
	// 				}
	// 			}
	// 		} else {
	// 			element = element.replace(/\\{/g, "{");
	// 			result.push([EMacro.CharacterStream, element]);
	// 		}
	// 	});
	// 	return result;
	// }

	public toMacroStr(v: IKeyMacros): Array<string> {
		return KeyMacro.toMacroStr(v);
	}
}
