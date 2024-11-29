import {EKeycodeDefault} from '../../model'
export const matrixKeycodes = [
	// Row 0
	EKeycodeDefault.KC_ESC,
	EKeycodeDefault.KC_F1,
	EKeycodeDefault.KC_F2,
	EKeycodeDefault.KC_F3,
	EKeycodeDefault.KC_F4,
	EKeycodeDefault.KC_F5,
	EKeycodeDefault.KC_F6,
	EKeycodeDefault.KC_F7,
	EKeycodeDefault.KC_F8,
	EKeycodeDefault.KC_F9,
	EKeycodeDefault.KC_F10,
	EKeycodeDefault.KC_F11,
	EKeycodeDefault.KC_F12,
	EKeycodeDefault.KC_PSCR,
	EKeycodeDefault.KC_SLCK,
	EKeycodeDefault.KC_PAUS,
	EKeycodeDefault.KC_SLEP,
	EKeycodeDefault.KC_MUTE,
	EKeycodeDefault.KC_VOLD,
	EKeycodeDefault.KC_VOLU,
	// Row 1
	EKeycodeDefault.KC_GRV,
	EKeycodeDefault.KC_1,
	EKeycodeDefault.KC_2,
	EKeycodeDefault.KC_3,
	EKeycodeDefault.KC_4,
	EKeycodeDefault.KC_5,
	EKeycodeDefault.KC_6,
	EKeycodeDefault.KC_7,
	EKeycodeDefault.KC_8,
	EKeycodeDefault.KC_9,
	EKeycodeDefault.KC_0,
	EKeycodeDefault.KC_MINS,
	EKeycodeDefault.KC_EQL,
	EKeycodeDefault.KC_BSPC,
	EKeycodeDefault.KC_INS,
	EKeycodeDefault.KC_HOME,
	EKeycodeDefault.KC_PGUP,
	EKeycodeDefault.KC_NLCK,
	EKeycodeDefault.KC_PSLS,
	EKeycodeDefault.KC_PAST,
	EKeycodeDefault.KC_PMNS,
	// Row 2
	EKeycodeDefault.KC_TAB,
	EKeycodeDefault.KC_Q,
	EKeycodeDefault.KC_W,
	EKeycodeDefault.KC_E,
	EKeycodeDefault.KC_R,
	EKeycodeDefault.KC_T,
	EKeycodeDefault.KC_Y,
	EKeycodeDefault.KC_U,
	EKeycodeDefault.KC_I,
	EKeycodeDefault.KC_O,
	EKeycodeDefault.KC_P,
	EKeycodeDefault.KC_LBRC,
	EKeycodeDefault.KC_RBRC,
	EKeycodeDefault.KC_BSLS,
	EKeycodeDefault.KC_DEL,
	EKeycodeDefault.KC_END,
	EKeycodeDefault.KC_PGDN,
	EKeycodeDefault.KC_P7,
	EKeycodeDefault.KC_P8,
	EKeycodeDefault.KC_P9,
	EKeycodeDefault.KC_PPLS,
	// Row 3
	EKeycodeDefault.KC_CAPS,
	EKeycodeDefault.KC_A,
	EKeycodeDefault.KC_S,
	EKeycodeDefault.KC_D,
	EKeycodeDefault.KC_F,
	EKeycodeDefault.KC_G,
	EKeycodeDefault.KC_H,
	EKeycodeDefault.KC_J,
	EKeycodeDefault.KC_K,
	EKeycodeDefault.KC_L,
	EKeycodeDefault.KC_SCLN,
	EKeycodeDefault.KC_QUOT,
	EKeycodeDefault.KC_ENT,
	EKeycodeDefault.KC_P4,
	EKeycodeDefault.KC_P5,
	EKeycodeDefault.KC_P6,
	// Row 4
	EKeycodeDefault.KC_LSFT,
	EKeycodeDefault.KC_Z,
	EKeycodeDefault.KC_X,
	EKeycodeDefault.KC_C,
	EKeycodeDefault.KC_V,
	EKeycodeDefault.KC_B,
	EKeycodeDefault.KC_N,
	EKeycodeDefault.KC_M,
	EKeycodeDefault.KC_COMM,
	EKeycodeDefault.KC_DOT,
	EKeycodeDefault.KC_SLSH,
	EKeycodeDefault.KC_RSFT,
	EKeycodeDefault.KC_UP,
	EKeycodeDefault.KC_P1,
	EKeycodeDefault.KC_P2,
	EKeycodeDefault.KC_P3,
	EKeycodeDefault.KC_PENT,
	// Row 5
	EKeycodeDefault.KC_LCTL,
	EKeycodeDefault.KC_LGUI,
	EKeycodeDefault.KC_LALT,
	EKeycodeDefault.KC_SPC,
	EKeycodeDefault.KC_RALT,
	EKeycodeDefault.KC_RGUI,
	EKeycodeDefault.KC_MENU,
	EKeycodeDefault.KC_RCTL,
	EKeycodeDefault.KC_LEFT,
	EKeycodeDefault.KC_DOWN,
	EKeycodeDefault.KC_RGHT,
	EKeycodeDefault.KC_P0,
	EKeycodeDefault.KC_PDOT,
];

const evtToKeyByte = {
	Digit1: EKeycodeDefault.KC_1,
	Digit2: EKeycodeDefault.KC_2,
	Digit3: EKeycodeDefault.KC_3,
	Digit4: EKeycodeDefault.KC_4,
	Digit5: EKeycodeDefault.KC_5,
	Digit6: EKeycodeDefault.KC_6,
	Digit7: EKeycodeDefault.KC_7,
	Digit8: EKeycodeDefault.KC_8,
	Digit9: EKeycodeDefault.KC_9,
	Digit0: EKeycodeDefault.KC_0,
	KeyA: EKeycodeDefault.KC_A,
	KeyB: EKeycodeDefault.KC_B,
	KeyC: EKeycodeDefault.KC_C,
	KeyD: EKeycodeDefault.KC_D,
	KeyE: EKeycodeDefault.KC_E,
	KeyF: EKeycodeDefault.KC_F,
	KeyG: EKeycodeDefault.KC_G,
	KeyH: EKeycodeDefault.KC_H,
	KeyI: EKeycodeDefault.KC_I,
	KeyJ: EKeycodeDefault.KC_J,
	KeyK: EKeycodeDefault.KC_K,
	KeyL: EKeycodeDefault.KC_L,
	KeyM: EKeycodeDefault.KC_M,
	KeyN: EKeycodeDefault.KC_N,
	KeyO: EKeycodeDefault.KC_O,
	KeyP: EKeycodeDefault.KC_P,
	KeyQ: EKeycodeDefault.KC_Q,
	KeyR: EKeycodeDefault.KC_R,
	KeyS: EKeycodeDefault.KC_S,
	KeyT: EKeycodeDefault.KC_T,
	KeyU: EKeycodeDefault.KC_U,
	KeyV: EKeycodeDefault.KC_V,
	KeyW: EKeycodeDefault.KC_W,
	KeyX: EKeycodeDefault.KC_X,
	KeyY: EKeycodeDefault.KC_Y,
	KeyZ: EKeycodeDefault.KC_Z,
	Comma: EKeycodeDefault.KC_COMM,
	Period: EKeycodeDefault.KC_DOT,
	Semicolon: EKeycodeDefault.KC_SCLN,
	Quote: EKeycodeDefault.KC_QUOT,
	BracketLeft: EKeycodeDefault.KC_LBRC,
	BracketRight: EKeycodeDefault.KC_RBRC,
	Backspace: EKeycodeDefault.KC_BSPC,
	Backquote: EKeycodeDefault.KC_GRV,
	Slash: EKeycodeDefault.KC_SLSH,
	Backslash: EKeycodeDefault.KC_BSLS,
	Minus: EKeycodeDefault.KC_MINS,
	Equal: EKeycodeDefault.KC_EQL,
	IntlRo: EKeycodeDefault.KC_RO,
	IntlYen: EKeycodeDefault.KC_JYEN,
	AltLeft: EKeycodeDefault.KC_LALT,
	AltRight: EKeycodeDefault.KC_RALT,
	CapsLock: EKeycodeDefault.KC_CAPS,
	ControlLeft: EKeycodeDefault.KC_LCTL,
	ControlRight: EKeycodeDefault.KC_RCTL,
	MetaLeft: EKeycodeDefault.KC_LGUI,
	MetaRight: EKeycodeDefault.KC_RGUI,
	OSLeft: EKeycodeDefault.KC_LGUI,
	OSRight: EKeycodeDefault.KC_RGUI,
	ShiftLeft: EKeycodeDefault.KC_LSFT,
	ShiftRight: EKeycodeDefault.KC_RSFT,
	ContextMenu: EKeycodeDefault.KC_APP,
	Enter: EKeycodeDefault.KC_ENT,
	Space: EKeycodeDefault.KC_SPC,
	Tab: EKeycodeDefault.KC_TAB,
	Delete: EKeycodeDefault.KC_DEL,
	End: EKeycodeDefault.KC_END,
	Help: EKeycodeDefault.KC_HELP,
	Home: EKeycodeDefault.KC_HOME,
	Insert: EKeycodeDefault.KC_INS,
	PageDown: EKeycodeDefault.KC_PGDN,
	PageUp: EKeycodeDefault.KC_PGUP,
	ArrowDown: EKeycodeDefault.KC_DOWN,
	ArrowLeft: EKeycodeDefault.KC_LEFT,
	ArrowRight: EKeycodeDefault.KC_RGHT,
	ArrowUp: EKeycodeDefault.KC_UP,
	Escape: EKeycodeDefault.KC_ESC,
	PrintScreen: EKeycodeDefault.KC_PSCR,
	ScrollLock: EKeycodeDefault.KC_SLCK,
	AudioVolumeUp: EKeycodeDefault.KC_VOLU,
	AudioVolumeDown: EKeycodeDefault.KC_VOLD,
	AudioVolumeMute: EKeycodeDefault.KC_MUTE,
	Pause: EKeycodeDefault.KC_PAUS,
	F1: EKeycodeDefault.KC_F1,
	F2: EKeycodeDefault.KC_F2,
	F3: EKeycodeDefault.KC_F3,
	F4: EKeycodeDefault.KC_F4,
	F5: EKeycodeDefault.KC_F5,
	F6: EKeycodeDefault.KC_F6,
	F7: EKeycodeDefault.KC_F7,
	F8: EKeycodeDefault.KC_F8,
	F9: EKeycodeDefault.KC_F9,
	F10: EKeycodeDefault.KC_F10,
	F11: EKeycodeDefault.KC_F11,
	F12: EKeycodeDefault.KC_F12,
	F13: EKeycodeDefault.KC_F13,
	F14: EKeycodeDefault.KC_F14,
	F15: EKeycodeDefault.KC_F15,
	F16: EKeycodeDefault.KC_F16,
	F17: EKeycodeDefault.KC_F17,
	F18: EKeycodeDefault.KC_F18,
	F19: EKeycodeDefault.KC_F19,
	F20: EKeycodeDefault.KC_F20,
	F21: EKeycodeDefault.KC_F21,
	F22: EKeycodeDefault.KC_F22,
	F23: EKeycodeDefault.KC_F23,
	F24: EKeycodeDefault.KC_F24,
	NumLock: EKeycodeDefault.KC_NLCK,
	Numpad0: EKeycodeDefault.KC_P0,
	Numpad1: EKeycodeDefault.KC_P1,
	Numpad2: EKeycodeDefault.KC_P2,
	Numpad3: EKeycodeDefault.KC_P3,
	Numpad4: EKeycodeDefault.KC_P4,
	Numpad5: EKeycodeDefault.KC_P5,
	Numpad6: EKeycodeDefault.KC_P6,
	Numpad7: EKeycodeDefault.KC_P7,
	Numpad8: EKeycodeDefault.KC_P8,
	Numpad9: EKeycodeDefault.KC_P9,
	NumpadAdd: EKeycodeDefault.KC_PPLS,
	NumpadComma: EKeycodeDefault.KC_COMM,
	NumpadDecimal: EKeycodeDefault.KC_PDOT,
	NumpadDivide: EKeycodeDefault.KC_PSLS,
	NumpadEnter: EKeycodeDefault.KC_PENT,
	NumpadEqual: EKeycodeDefault.KC_PEQL,
	NumpadMultiply: EKeycodeDefault.KC_PAST,
	NumpadSubtract: EKeycodeDefault.KC_PMNS,
};

export function getIndexByEvent(evt: KeyboardEvent): number {
	const code = evt.code;
	const byte =
		evtToKeyByte[code as keyof typeof evtToKeyByte] ||
		evtToKeyByte[evt.key as keyof typeof evtToKeyByte];
	if (byte) {
		return matrixKeycodes.indexOf(byte);
	}
	return -1;
}

export function mapEvtToKeycode(evt: KeyboardEvent) {
	switch (evt.code) {
		case 'Digit1': {
			return 'KC_1';
		}
		case 'Digit2': {
			return 'KC_2';
		}
		case 'Digit3': {
			return 'KC_3';
		}
		case 'Digit4': {
			return 'KC_4';
		}
		case 'Digit5': {
			return 'KC_5';
		}
		case 'Digit6': {
			return 'KC_6';
		}
		case 'Digit7': {
			return 'KC_7';
		}
		case 'Digit8': {
			return 'KC_8';
		}
		case 'Digit9': {
			return 'KC_9';
		}
		case 'Digit0': {
			return 'KC_0';
		}
		case 'KeyA': {
			return 'KC_A';
		}
		case 'KeyB': {
			return 'KC_B';
		}
		case 'KeyC': {
			return 'KC_C';
		}
		case 'KeyD': {
			return 'KC_D';
		}
		case 'KeyE': {
			return 'KC_E';
		}
		case 'KeyF': {
			return 'KC_F';
		}
		case 'KeyG': {
			return 'KC_G';
		}
		case 'KeyH': {
			return 'KC_H';
		}
		case 'KeyI': {
			return 'KC_I';
		}
		case 'KeyJ': {
			return 'KC_J';
		}
		case 'KeyK': {
			return 'KC_K';
		}
		case 'KeyL': {
			return 'KC_L';
		}
		case 'KeyM': {
			return 'KC_M';
		}
		case 'KeyN': {
			return 'KC_N';
		}
		case 'KeyO': {
			return 'KC_O';
		}
		case 'KeyP': {
			return 'KC_P';
		}
		case 'KeyQ': {
			return 'KC_Q';
		}
		case 'KeyR': {
			return 'KC_R';
		}
		case 'KeyS': {
			return 'KC_S';
		}
		case 'KeyT': {
			return 'KC_T';
		}
		case 'KeyU': {
			return 'KC_U';
		}
		case 'KeyV': {
			return 'KC_V';
		}
		case 'KeyW': {
			return 'KC_W';
		}
		case 'KeyX': {
			return 'KC_X';
		}
		case 'KeyY': {
			return 'KC_Y';
		}
		case 'KeyZ': {
			return 'KC_Z';
		}
		case 'Comma': {
			return 'KC_COMM';
		}
		case 'Period': {
			return 'KC_DOT';
		}
		case 'Semicolon': {
			return 'KC_SCLN';
		}
		case 'Quote': {
			return 'KC_QUOT';
		}
		case 'BracketLeft': {
			return 'KC_LBRC';
		}
		case 'BracketRight': {
			return 'KC_RBRC';
		}
		case 'Backquote': {
			return 'KC_GRV';
		}
		case 'Slash': {
			return 'KC_SLSH';
		}
		case 'Backspace': {
			return 'KC_BSPC';
		}
		case 'Backslash': {
			return 'KC_BSLS';
		}
		case 'Minus': {
			return 'KC_MINS';
		}
		case 'Equal': {
			return 'KC_EQL';
		}
		case 'IntlRo': {
			return 'KC_RO';
		}
		case 'IntlYen': {
			return 'KC_JYEN';
		}
		case 'AltLeft': {
			return 'KC_LALT';
		}
		case 'AltRight': {
			return 'KC_RALT';
		}
		case 'CapsLock': {
			return 'KC_CAPS';
		}
		case 'ControlLeft': {
			return 'KC_LCTL';
		}
		case 'ControlRight': {
			return 'KC_RCTL';
		}
		case 'MetaLeft': {
			return 'KC_LGUI';
		}
		case 'MetaRight': {
			return 'KC_RGUI';
		}
		case 'OSLeft': {
			return 'KC_LGUI';
		}
		case 'OSRight': {
			return 'KC_RGUI';
		}
		case 'ShiftLeft': {
			return 'KC_LSFT';
		}
		case 'ShiftRight': {
			return 'KC_RSFT';
		}
		case 'ContextMenu': {
			return 'KC_APP';
		}
		case 'Apps': {
			return 'KC_APP';
		}
		case 'Enter': {
			return 'KC_ENT';
		}
		case 'Space': {
			return 'KC_SPC';
		}
		case 'Tab': {
			return 'KC_TAB';
		}
		case 'Delete': {
			return 'KC_DEL';
		}
		case 'End': {
			return 'KC_END';
		}
		case 'Help': {
			return 'KC_HELP';
		}
		case 'Home': {
			return 'KC_HOME';
		}
		case 'Insert': {
			return 'KC_INS';
		}
		case 'PageDown': {
			return 'KC_PGDN';
		}
		case 'PageUp': {
			return 'KC_PGUP';
		}
		case 'ArrowDown': {
			return 'KC_DOWN';
		}
		case 'ArrowLeft': {
			return 'KC_LEFT';
		}
		case 'ArrowRight': {
			return 'KC_RGHT';
		}
		case 'ArrowUp': {
			return 'KC_UP';
		}
		case 'Escape': {
			return 'KC_ESC';
		}
		case 'PrintScreen': {
			return 'KC_PSCR';
		}
		case 'ScrollLock': {
			return 'KC_SLCK';
		}
		case 'Pause': {
			return 'KC_PAUS';
		}
		case 'F1': {
			return 'KC_F1';
		}
		case 'F2': {
			return 'KC_F2';
		}
		case 'F3': {
			return 'KC_F3';
		}
		case 'F4': {
			return 'KC_F4';
		}
		case 'F5': {
			return 'KC_F5';
		}
		case 'F6': {
			return 'KC_F6';
		}
		case 'F7': {
			return 'KC_F7';
		}
		case 'F8': {
			return 'KC_F8';
		}
		case 'F9': {
			return 'KC_F9';
		}
		case 'F10': {
			return 'KC_F10';
		}
		case 'F11': {
			return 'KC_F11';
		}
		case 'F12': {
			return 'KC_F12';
		}
		case 'F13': {
			return 'KC_F13';
		}
		case 'F14': {
			return 'KC_F14';
		}
		case 'F15': {
			return 'KC_F15';
		}
		case 'F16': {
			return 'KC_F16';
		}
		case 'F17': {
			return 'KC_F17';
		}
		case 'F18': {
			return 'KC_F18';
		}
		case 'F19': {
			return 'KC_F19';
		}
		case 'F20': {
			return 'KC_F20';
		}
		case 'F21': {
			return 'KC_F21';
		}
		case 'F22': {
			return 'KC_F22';
		}
		case 'F23': {
			return 'KC_F23';
		}
		case 'F24': {
			return 'KC_F24';
		}
		case 'NumLock': {
			return 'KC_NLCK';
		}
		case 'Numpad0': {
			return 'KC_P0';
		}
		case 'Numpad1': {
			return 'KC_P1';
		}
		case 'Numpad2': {
			return 'KC_P2';
		}
		case 'Numpad3': {
			return 'KC_P3';
		}
		case 'Numpad4': {
			return 'KC_P4';
		}
		case 'Numpad5': {
			return 'KC_P5';
		}
		case 'Numpad6': {
			return 'KC_P6';
		}
		case 'Numpad7': {
			return 'KC_P7';
		}
		case 'Numpad8': {
			return 'KC_P8';
		}
		case 'Numpad9': {
			return 'KC_P9';
		}
		case 'NumpadAdd': {
			return 'KC_PPLS';
		}
		case 'NumpadComma': {
			return 'KC_COMM';
		}
		case 'NumpadDecimal': {
			return 'KC_PDOT';
		}
		case 'NumpadDivide': {
			return 'KC_PSLS';
		}
		case 'NumpadEnter': {
			return 'KC_PENT';
		}
		case 'NumpadEqual': {
			return 'KC_PEQL';
		}
		case 'NumpadMultiply': {
			return 'KC_PAST';
		}
		case 'NumpadSubtract': {
			return 'KC_PMNS';
		}
		case 'AudioVolumeUp': {
			return 'KC_VOLU';
		}
		case 'AudioVolumeDown': {
			return 'KC_VOLD';
		}
		case 'AudioVolumeMute': {
			return 'KC_MUTE';
		}
		default:
			console.error('Unreacheable keydown code', evt);
	}
}
