export const productFirmware = [
	{productName: 'M3Pro', productID: "0x0711", PID: "0x072D"},
	{productName: 'M3ProMax', productID: "0x071A", PID: "0x073A"},
	{productName: 'M3SMax', productID: "0x071F", PID: "0x0740"},
	{productName: 'M3MICCROPRO', productID: "0x071E", PID: "0x073E"},
	{productName: 'M2MOUSE', productID: "0x0713", PID: "0x0733"},
	{productName: 'M5PRO', productID: "0x071C", PID: "0x073D"},
	{productName: 'M3SPRO', productID: "0x0710", PID: "0x0722"},
]

export enum EDmsMouseBtnActionKey {
	leftClick = 0x0100f000,
	rightClick = 0x0100f100,
	middleClick = 0x0100f200,
	button4Click = 0x0100f300,
	button5Click = 0x0100f400,
	leftScroll = 0x0100f501,
	rightScroll = 0x0100f6FF,
	upScroll = 0x0100f801,
	downScroll = 0x0100f8ff,
	lickDoubleClick = 0x0100f900
}

export let EDmsMouseBtnAction = [
	{key: 'leftClick', value: EDmsMouseBtnActionKey.leftClick},
	{key: 'rightClick', value: EDmsMouseBtnActionKey.rightClick},
	{key: 'middleClick', value: EDmsMouseBtnActionKey.middleClick}, 
	{key: 'button4Click', value: EDmsMouseBtnActionKey.button4Click},
	{key: 'button5Click', value: EDmsMouseBtnActionKey.button5Click},
	{key: 'lickDoubleClick', value: EDmsMouseBtnActionKey.lickDoubleClick},
	{key: 'upScroll', value: EDmsMouseBtnActionKey.upScroll},
	{key: 'downScroll', value: EDmsMouseBtnActionKey.downScroll},
	{key: 'leftScroll', value: EDmsMouseBtnActionKey.leftScroll},
	{key: 'rightScroll', value: EDmsMouseBtnActionKey.rightScroll}
]

export enum EDmsMouseBtnDpiKey {
	loop = 0x07000300,
	up = 0x07000100,
	down = 0x07000200,
}

export const EDmsMouseBtnDpi = [
	{key: "loop", value: EDmsMouseBtnDpiKey.loop},
	{key: "up", value: EDmsMouseBtnDpiKey.up},
	{key: "down", value: EDmsMouseBtnDpiKey.down}
]

export enum EDmsMouseBtnMediaKey {
	volumeUp = 0x0300E900,
	volumeDown = 0x0300EA00,
	mute = 0x0300E200,
	player = 0x03008301, 
	pause = 0x0300CD00,
	previous = 0x0300B600,
	next = 0x0300B500,
	stop = 0x0300B700
}

export const EDmsMouseBtnMedia = [
	{key: 'volumeUp', value: EDmsMouseBtnMediaKey.volumeUp},
	{key: 'volumeDown', value: EDmsMouseBtnMediaKey.volumeDown},
	{key: 'mute', value: EDmsMouseBtnMediaKey.mute},
	{key: 'player', value: EDmsMouseBtnMediaKey.player},
	{key: 'pause', value: EDmsMouseBtnMediaKey.pause},
	{key: 'previous', value: EDmsMouseBtnMediaKey.previous},
	{key: 'next', value: EDmsMouseBtnMediaKey.next},
	{key: 'stop', value: EDmsMouseBtnMediaKey.stop},
]

export enum EDmsMouseBtnShortcutKey {
	brightnessUp = 0x03006f00,
	brightnessDown = 0x03007000,
	calculate = 0x03009201,
	myComputer = 0x03009401,
	homePage =  0x03002302,
	email =  0x03008a01,
	refresh =  0x00003e00,
	switchApp = 0x0a010000,
	copy = 0x00010600,
	cut = 0x00011000,
	paste = 0x0001900
}

export const EDmsMouseBtnShortcut = [
	{key: 'brightnessUp', value: EDmsMouseBtnShortcutKey.brightnessUp},
	{key: 'brightnessDown', value: EDmsMouseBtnShortcutKey.brightnessDown},
	{key: 'calculate', value: EDmsMouseBtnShortcutKey.calculate},
	{key: 'myComputer', value: EDmsMouseBtnShortcutKey.myComputer},
	{key: 'homePage', value: EDmsMouseBtnShortcutKey.homePage},
	{key: 'email', value: EDmsMouseBtnShortcutKey.email},
	{key: 'refresh', value: EDmsMouseBtnShortcutKey.refresh},
	{key: 'switchApp', value: EDmsMouseBtnShortcutKey.switchApp},
	{key: 'copy', value: EDmsMouseBtnShortcutKey.copy},
	{key: 'cut', value: EDmsMouseBtnShortcutKey.cut},
	{key: 'paste', value: EDmsMouseBtnShortcutKey.paste},
]

export enum EDmsMousseBtnLightKey {
	swichLight = 0x0a020000,
	speedSwitch = 0x0a030000,
	colorSwitch = 0x0a040000,
	lightBrightnessUp = 0x0a050000,
	lightBrightnessDown = 0x0a060000
}

export const EDmsMousseBtnLight = [
	{key: 'swichLight', value: EDmsMousseBtnLightKey.swichLight},
	{key: 'speedSwitch', value: EDmsMousseBtnLightKey.speedSwitch},
	{key: 'colorSwitch', value: EDmsMousseBtnLightKey.colorSwitch},
	{key: 'lightBrightnessUp', value: EDmsMousseBtnLightKey.lightBrightnessUp},
	{key: 'lightBrightnessDown', value: EDmsMousseBtnLightKey.lightBrightnessDown}
] 

export enum EDmsMouseBtnGameMouseKey {
	left = 0x01,
	right = 0x02,
	middle = 0x04,
	front = 0x08,
	back = 0x10,
}

export const EMdsMouseBtnGameMouse = [
	{key: 'left', value: EDmsMouseBtnGameMouseKey.left, event: 0},
	{key: 'right', value: EDmsMouseBtnGameMouseKey.right, event: 2},
	{key: 'middle', value: EDmsMouseBtnGameMouseKey.middle, event: 1},
	{key: 'front', value: EDmsMouseBtnGameMouseKey.front, event: 4},
	{key: 'back', value: EDmsMouseBtnGameMouseKey.back, event: 3}
]
export const EMdsMouseBtnGameDefault = [
	{key: 'left', value: EDmsMouseBtnGameMouseKey.left},
	{key: 'right', value: EDmsMouseBtnGameMouseKey.right},
	{key: 'middle', value: EDmsMouseBtnGameMouseKey.middle},
	{key: 'front', value: EDmsMouseBtnGameMouseKey.front},
	{key: 'back', value: EDmsMouseBtnGameMouseKey.back}
]
export const EMdsMouseBtnDisabled= [
	{key: 'disabled', value: 0}
]
export enum EDmsMouseGame {
	mouseGame,
	keyboardGame,
	modifierGame
}
export enum EDmsMouseBtnGameKey {
	mouse = 0x01,
	keyboard = 0x02
}

export enum EDmsMouseKeycode {
	KC_NO = 0x00,
	KC_OVERRUN_ERROR = 0x01,
	KC_POST_FAIL = 0x02,
	KC_ERROR_UNDEFINED = 0x03,
	KC_A = 0x04,
	KC_B = 0x05,
	KC_C = 0x06,
	KC_D = 0x07,
	KC_E = 0x08,
	KC_F = 0x09,
	KC_G = 0x0A,
	KC_H = 0x0B,
	KC_I = 0x0C,
	KC_J = 0x0D,
	KC_K = 0x0E,
	KC_L = 0x0F,
	KC_M = 0x10,
	KC_N = 0x11,
	KC_O = 0x12,
	KC_P = 0x13,
	KC_Q = 0x14,
	KC_R = 0x15,
	KC_S = 0x16,
	KC_T = 0x17,
	KC_U = 0x18,
	KC_V = 0x19,
	KC_W = 0x1A,
	KC_X = 0x1B,
	KC_Y = 0x1C,
	KC_Z = 0x1D,
	KC_1 = 0x1E,
	KC_2 = 0x1F,
	KC_3 = 0x20,
	KC_4 = 0x21,
	KC_5 = 0x22,
	KC_6 = 0x23,
	KC_7 = 0x24,
	KC_8 = 0x25,
	KC_9 = 0x26,
	KC_0 = 0x27,
	KC_ENT = 0x28,
	KC_ESC = 0x29,
	USB_USAGE_BACKSPACE = 0x2A,
	USB_USAGE_TAB = 0x2B,
	KC_SPC = 0x2C,
	KC_MINS = 0x2D,
	KC_EQL = 0x2E,
	KC_LBRC = 0x2F,
	KC_RBRC = 0x30,
	KC_BSLS = 0x31,
	KC_EUROPE_1 = 0x32,
	KC_SCLN = 0x33,
	KC_APOSTROPHE = 0x34,
	KC_GRV = 0x35,
	KC_COMMA = 0x36,
	KC_QUOT = 0x37,
	KC_SLSH = 0x38,
	KC_CAPS = 0x39,
	KC_F1 = 0x3A,
	KC_F2 = 0x3B,
	KC_F3 = 0x3C,
	KC_F4 = 0x3D,
	KC_F5 = 0x3E,
	KC_F6 = 0x3F,
	KC_F7 = 0x40,
	KC_F8 = 0x41,
	KC_F9 = 0x42,
	KC_F10 = 0x43,
	KC_F11 = 0x44,
	KC_F12 = 0x45,
	KC_PSCR = 0x46,
	KC_SLCK = 0x47,
	KC_PAUS = 0x48,
	KC_INS = 0x49,
	KC_HOME = 0x4A,
	KC_UP = 0x4B,
	KC_DEL = 0x4C,
	KC_END = 0x4D,
	KC_PGDN = 0x4E,
	KC_RGHT = 0x4F,
	KC_LEFT = 0x50,
	KC_DOWN = 0x51,
	KC_PGUP = 0x52,
	KC_NLCK = 0x53,
	KC_PSLS = 0x54,
	KC_PAST = 0x55,
	KC_PMNS = 0x56,
	KC_PPLS = 0x57,
	KC_PENT = 0x58,
	KC_P1 = 0x59,
	KC_P2 = 0x5A,
	KC_P3 = 0x5B,
	KC_P4 = 0x5C,
	KC_P5 = 0x5D,
	KC_P6 = 0x5E,
	KC_P7 = 0x5F,
	KC_P8 = 0x60,
	KC_P9 = 0x61,
	KC_P0 = 0x62,
	KC_DOT = 0x63,
	KC_EUROPE_2 = 0x64,
	KC_APP = 0x65,
	KC_POWER = 0x66,
	KC_KEYPAD_EQUAL = 0x67,
	KC_F13 = 0x68,
	KC_F14 = 0x69,
	KC_F15 = 0x6A,
	KC_F16 = 0x6B,
	KC_F17 = 0x6C,
	KC_F18 = 0x6D,
	KC_F19 = 0x6E,
	KC_F20 = 0x6F,
	KC_F21 = 0x70,
	KC_F22 = 0x71,
	KC_F23 = 0x72,
	KC_F24 = 0x73,
	KC_COMM = 0x85,
	KC_INTL1 = 0x87,
	KC_INTL2 = 0x88,
	KC_INTL3 = 0x89,
	KC_INTL4 = 0x8A,
	KC_INTL5 = 0x8B,
	KC_LANG1 = 0x90,
	KC_LCTL = 0xE0,
	KC_LSFT = 0xE1,
	KC_LALT = 0xE2,
	KC_LGUI = 0xE3,
	KC_RCTL = 0xE4,
	KC_RSFT = 0xE5,
	KC_RALT = 0xE6,
	KC_RGUI = 0xE7,
}
export const EDmsMouseKeycodeDefault = [
	{ key: 'KC_1', value: EDmsMouseKeycode.KC_1, code: 'Digit1' },
	{ key: 'KC_2', value: EDmsMouseKeycode.KC_2, code: 'Digit2' },
	{ key: 'KC_3', value: EDmsMouseKeycode.KC_3, code: 'Digit3' },
	{ key: 'KC_4', value: EDmsMouseKeycode.KC_4, code: 'Digit4' },
	{ key: 'KC_5', value: EDmsMouseKeycode.KC_5, code: 'Digit5' },
	{ key: 'KC_6', value: EDmsMouseKeycode.KC_6, code: 'Digit6' },
	{ key: 'KC_7', value: EDmsMouseKeycode.KC_7, code: 'Digit7' },
	{ key: 'KC_8', value: EDmsMouseKeycode.KC_8, code: 'Digit8' },
	{ key: 'KC_9', value: EDmsMouseKeycode.KC_9, code: 'Digit9' },
	{ key: 'KC_0', value: EDmsMouseKeycode.KC_0, code: 'Digit0' },
	{ key: 'KC_A', value: EDmsMouseKeycode.KC_A, code: 'KeyA' },
	{ key: 'KC_B', value: EDmsMouseKeycode.KC_B, code: 'KeyB' },
	{ key: 'KC_C', value: EDmsMouseKeycode.KC_C, code: 'KeyC' },
	{ key: 'KC_D', value: EDmsMouseKeycode.KC_D, code: 'KeyD' },
	{ key: 'KC_E', value: EDmsMouseKeycode.KC_E, code: 'KeyE' },
	{ key: 'KC_F', value: EDmsMouseKeycode.KC_F, code: 'KeyF' },
	{ key: 'KC_G', value: EDmsMouseKeycode.KC_G, code: 'KeyG' },
	{ key: 'KC_H', value: EDmsMouseKeycode.KC_H, code: 'KeyH' },
	{ key: 'KC_I', value: EDmsMouseKeycode.KC_I, code: 'KeyI' },
	{ key: 'KC_J', value: EDmsMouseKeycode.KC_J, code: 'KeyJ' },
	{ key: 'KC_K', value: EDmsMouseKeycode.KC_K, code: 'KeyK' },
	{ key: 'KC_L', value: EDmsMouseKeycode.KC_L, code: 'KeyL' },
	{ key: 'KC_M', value: EDmsMouseKeycode.KC_M, code: 'KeyM' },
	{ key: 'KC_N', value: EDmsMouseKeycode.KC_N, code: 'KeyN' },
	{ key: 'KC_O', value: EDmsMouseKeycode.KC_O, code: 'KeyO' },
	{ key: 'KC_P', value: EDmsMouseKeycode.KC_P, code: 'KeyP' },
	{ key: 'KC_Q', value: EDmsMouseKeycode.KC_Q, code: 'KeyQ' },
	{ key: 'KC_R', value: EDmsMouseKeycode.KC_R, code: 'KeyR' },
	{ key: 'KC_S', value: EDmsMouseKeycode.KC_S, code: 'KeyS' },
	{ key: 'KC_T', value: EDmsMouseKeycode.KC_T, code: 'KeyT' },
	{ key: 'KC_U', value: EDmsMouseKeycode.KC_U, code: 'KeyU' },
	{ key: 'KC_V', value: EDmsMouseKeycode.KC_V, code: 'KeyV' },
	{ key: 'KC_W', value: EDmsMouseKeycode.KC_W, code: 'KeyW' },
	{ key: 'KC_X', value: EDmsMouseKeycode.KC_X, code: 'KeyX' },
	{ key: 'KC_Y', value: EDmsMouseKeycode.KC_Y, code: 'KeyY' },
	{ key: 'KC_Z', value: EDmsMouseKeycode.KC_Z, code: 'KeyZ' },
	{ key: 'KC_COMMA', value: EDmsMouseKeycode.KC_COMMA, code: 'Comma' },
	{ key: 'KC_QUOT', value: EDmsMouseKeycode.KC_QUOT, code: 'Quote' },
	{ key: 'KC_SCLN', value: EDmsMouseKeycode.KC_SCLN, code: 'Semicolon' },
	{ key: 'KC_APOSTROPHE', value: EDmsMouseKeycode.KC_APOSTROPHE, code: 'Quote' },
	{ key: 'KC_LBRC', value: EDmsMouseKeycode.KC_LBRC, code: 'BracketLeft' },
	{ key: 'KC_RBRC', value: EDmsMouseKeycode.KC_RBRC, code: 'BracketRight' },
	{ key: 'USB_USAGE_BACKSPACE', value: EDmsMouseKeycode.USB_USAGE_BACKSPACE, code: 'Backspace' },
	{ key: 'KC_GRV', value: EDmsMouseKeycode.KC_GRV, code: 'Backquote' },
	{ key: 'KC_SLSH', value: EDmsMouseKeycode.KC_SLSH, code: 'Slash' },
	{ key: 'KC_BSLS', value: EDmsMouseKeycode.KC_BSLS, code: 'Backslash' },
	{ key: 'KC_MINS', value: EDmsMouseKeycode.KC_MINS, code: 'Minus' },
	{ key: 'KC_EQL', value: EDmsMouseKeycode.KC_EQL, code: 'Equal' },
	{ key: 'KC_LALT', value: EDmsMouseKeycode.KC_LALT, code: 'AltLeft' },
	{ key: 'KC_RALT', value: EDmsMouseKeycode.KC_RALT, code: 'AltRight' },
	{ key: 'KC_CAPS', value: EDmsMouseKeycode.KC_CAPS, code: 'CapsLock' },
	{ key: 'KC_LCTL', value: EDmsMouseKeycode.KC_LCTL, code: 'ControlLeft' },
	{ key: 'KC_RCTL', value: EDmsMouseKeycode.KC_RCTL, code: 'ControlRight' },
	{ key: 'KC_LGUI', value: EDmsMouseKeycode.KC_LGUI, code: 'MetaLeft' },
	{ key: 'KC_RGUI', value: EDmsMouseKeycode.KC_RGUI, code: 'MetaRight' },
	{ key: 'KC_LSFT', value: EDmsMouseKeycode.KC_LSFT, code: 'ShiftLeft' },
	{ key: 'KC_RSFT', value: EDmsMouseKeycode.KC_RSFT, code: 'ShiftRight' },
	{ key: 'KC_APP', value: EDmsMouseKeycode.KC_APP, code: 'ContextMenu' },
	{ key: 'KC_ENT', value: EDmsMouseKeycode.KC_ENT, code: 'Enter' },
	{ key: 'KC_SPC', value: EDmsMouseKeycode.KC_SPC, code: 'Space' },
	{ key: 'USB_USAGE_TAB', value: EDmsMouseKeycode.USB_USAGE_TAB, code: 'Tab' },
	{ key: 'KC_DEL', value: EDmsMouseKeycode.KC_DEL, code: 'Delete' },
	{ key: 'KC_END', value: EDmsMouseKeycode.KC_END, code: 'End' },
	{ key: 'KC_HOME', value: EDmsMouseKeycode.KC_HOME, code: 'Home' },
	{ key: 'KC_INS', value: EDmsMouseKeycode.KC_INS, code: 'Insert' },
	{ key: 'KC_PGDN', value: EDmsMouseKeycode.KC_PGDN, code: 'PageDown' },
	{ key: 'KC_UP', value: EDmsMouseKeycode.KC_UP, code: 'ArrowUp' },
	{ key: 'KC_DOWN', value: EDmsMouseKeycode.KC_DOWN, code: 'ArrowDown' },
	{ key: 'KC_LEFT', value: EDmsMouseKeycode.KC_LEFT, code: 'ArrowLeft' },
	{ key: 'KC_RGHT', value: EDmsMouseKeycode.KC_RGHT, code: 'ArrowRight' },
	{ key: 'KC_PGUP', value: EDmsMouseKeycode.KC_PGUP, code: 'PageUp' },
	{ key: 'KC_ESC', value: EDmsMouseKeycode.KC_ESC, code: 'Escape' },
	{ key: 'KC_PSCR', value: EDmsMouseKeycode.KC_PSCR, code: 'PrintScreen' },
	{ key: 'KC_SLCK', value: EDmsMouseKeycode.KC_SLCK, code: 'ScrollLock' },
	{ key: 'KC_PAUS', value: EDmsMouseKeycode.KC_PAUS, code: 'Pause' },
	{ key: 'KC_NO', value: EDmsMouseKeycode.KC_NO, code: 'None' },
	{ key: 'KC_P0', value: EDmsMouseKeycode.KC_P0, code: 'Numpad0' },
	{ key: 'KC_P1', value: EDmsMouseKeycode.KC_P1, code: 'Numpad1' },
	{ key: 'KC_P2', value: EDmsMouseKeycode.KC_P2, code: 'Numpad2' },
	{ key: 'KC_P3', value: EDmsMouseKeycode.KC_P3, code: 'Numpad3' },
	{ key: 'KC_P4', value: EDmsMouseKeycode.KC_P4, code: 'Numpad4' },
	{ key: 'KC_P5', value: EDmsMouseKeycode.KC_P5, code: 'Numpad5' },
	{ key: 'KC_P6', value: EDmsMouseKeycode.KC_P6, code: 'Numpad6' },
	{ key: 'KC_P7', value: EDmsMouseKeycode.KC_P7, code: 'Numpad7' },
	{ key: 'KC_P8', value: EDmsMouseKeycode.KC_P8, code: 'Numpad8' },
	{ key: 'KC_P9', value: EDmsMouseKeycode.KC_P9, code: 'Numpad9' },
	{ key: 'KC_PPLS', value: EDmsMouseKeycode.KC_PPLS, code: 'NumpadAdd' },
	{ key: 'KC_NLCK', value: EDmsMouseKeycode.KC_NLCK, code: 'NumLock' },
	{ key: 'KC_DOT', value: EDmsMouseKeycode.KC_DOT, code: 'NumpadDecimal' },
	{ key: 'KC_PSLS', value: EDmsMouseKeycode.KC_PSLS, code: 'NumpadDivide' },
	{ key: 'KC_PENT', value: EDmsMouseKeycode.KC_PENT, code: 'NumpadEnter' },
	{ key: 'KC_PAST', value: EDmsMouseKeycode.KC_PAST, code: 'NumpadMultiply' },
	{ key: 'KC_PMNS', value: EDmsMouseKeycode.KC_PMNS, code: 'NumpadSubtract' },
	{ key: 'KC_F1', value: EDmsMouseKeycode.KC_F1, code: 'F1' },
	{ key: 'KC_F2', value: EDmsMouseKeycode.KC_F2, code: 'F2' },
	{ key: 'KC_F3', value: EDmsMouseKeycode.KC_F3, code: 'F3' },
	{ key: 'KC_F4', value: EDmsMouseKeycode.KC_F4, code: 'F4' },
	{ key: 'KC_F5', value: EDmsMouseKeycode.KC_F5, code: 'F5' },
	{ key: 'KC_F6', value: EDmsMouseKeycode.KC_F6, code: 'F6' },
	{ key: 'KC_F7', value: EDmsMouseKeycode.KC_F7, code: 'F7' },
	{ key: 'KC_F8', value: EDmsMouseKeycode.KC_F8, code: 'F8' },
	{ key: 'KC_F9', value: EDmsMouseKeycode.KC_F9, code: 'F9' },
	{ key: 'KC_F10', value: EDmsMouseKeycode.KC_F10, code: 'F10' },
	{ key: 'KC_F11', value: EDmsMouseKeycode.KC_F11, code: 'F11' },
	{ key: 'KC_F12', value: EDmsMouseKeycode.KC_F12, code: 'F12' },
	{ key: 'KC_F13', value: EDmsMouseKeycode.KC_F13, code: 'F13' },
	{ key: 'KC_F14', value: EDmsMouseKeycode.KC_F14, code: 'F14' },
	{ key: 'KC_F15', value: EDmsMouseKeycode.KC_F15, code: 'F15' },
	{ key: 'KC_F16', value: EDmsMouseKeycode.KC_F16, code: 'F16' }

];
  

// 循环结束设置
export enum EDmsMacroLoopKey {
	loopTilCount = 0x04, // 循环次数
	loopTilRelease = 0x02, // 弹起停止循环
	loopTilPress = 0x03, // 按下即停止循环 
	loopTilDoublePress = 0x05 // 重新按下停止循环
}
export const EDmsMacroLoop = [
	{ key: "loopTilCount", value: EDmsMacroLoopKey.loopTilCount },
	{ key: "loopTilRelease", value: EDmsMacroLoopKey.loopTilRelease },
	{ key: "loopTilPress", value: EDmsMacroLoopKey.loopTilPress },
	{ key: "loopTilDoublePress", value: EDmsMacroLoopKey.loopTilDoublePress },
]
