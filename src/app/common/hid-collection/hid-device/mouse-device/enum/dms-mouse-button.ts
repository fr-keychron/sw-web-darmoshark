export enum EDmsMouseBtnActionKey {
	leftClick = 0x0100f000,
	rightClick = 0x0100f100,
	middleClick = 0x0100f200,
	button4Click = 0x0100f300,
	button5Click = 0x0100f400,
	leftScroll = 0x0100f500,
	rightScroll = 0x0100f600,
	upScroll = 0x0100f801,
	downScroll = 0x0100f8ff,
	lickDoubleClick = 0x0100f900
}

export let EDmsMouseBtnAction = [
	{key: 'leftClick', value: EDmsMouseBtnActionKey.leftClick, mouseKey: 0},
	{key: 'rightClick', value: EDmsMouseBtnActionKey.rightClick, mouseKey: 1},
	{key: 'middleClick', value: EDmsMouseBtnActionKey.middleClick, mouseKey: 2}, 
	{key: 'button4Click', value: EDmsMouseBtnActionKey.button4Click, mouseKey: 3},
	{key: 'button5Click', value: EDmsMouseBtnActionKey.button5Click, mouseKey: 4},
	{key: 'lickDoubleClick', value: EDmsMouseBtnActionKey.lickDoubleClick},
	{key: 'upScroll', value: EDmsMouseBtnActionKey.upScroll, mouseKey: 7},
	{key: 'downScroll', value: EDmsMouseBtnActionKey.downScroll, mouseKey: 8},
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
	cut = 0x0001100,
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
export const EDmsMouseKeycodeDefault: any = [
	{ key: 'Digit1', value: EDmsMouseKeycode.KC_1 },
	{ key: 'Digit2', value: EDmsMouseKeycode.KC_2 },
	{ key: 'Digit3', value: EDmsMouseKeycode.KC_3 },
	{ key: 'Digit4', value: EDmsMouseKeycode.KC_4 },
	{ key: 'Digit5', value: EDmsMouseKeycode.KC_5 },
	{ key: 'Digit6', value: EDmsMouseKeycode.KC_6 },
	{ key: 'Digit7', value: EDmsMouseKeycode.KC_7 },
	{ key: 'Digit8', value: EDmsMouseKeycode.KC_8 },
	{ key: 'Digit9', value: EDmsMouseKeycode.KC_9 },
	{ key: 'Digit0', value: EDmsMouseKeycode.KC_0 },
	{ key: 'KeyA', value: EDmsMouseKeycode.KC_A },
	{ key: 'KeyB', value: EDmsMouseKeycode.KC_B },
	{ key: 'KeyC', value: EDmsMouseKeycode.KC_C },
	{ key: 'KeyD', value: EDmsMouseKeycode.KC_D },
	{ key: 'KeyE', value: EDmsMouseKeycode.KC_E },
	{ key: 'KeyF', value: EDmsMouseKeycode.KC_F },
	{ key: 'KeyG', value: EDmsMouseKeycode.KC_G },
	{ key: 'KeyH', value: EDmsMouseKeycode.KC_H },
	{ key: 'KeyI', value: EDmsMouseKeycode.KC_I },
	{ key: 'KeyJ', value: EDmsMouseKeycode.KC_J },
	{ key: 'KeyK', value: EDmsMouseKeycode.KC_K },
	{ key: 'KeyL', value: EDmsMouseKeycode.KC_L },
	{ key: 'KeyM', value: EDmsMouseKeycode.KC_M },
	{ key: 'KeyN', value: EDmsMouseKeycode.KC_N },
	{ key: 'KeyO', value: EDmsMouseKeycode.KC_O },
	{ key: 'KeyP', value: EDmsMouseKeycode.KC_P },
	{ key: 'KeyQ', value: EDmsMouseKeycode.KC_Q },
	{ key: 'KeyR', value: EDmsMouseKeycode.KC_R },
	{ key: 'KeyS', value: EDmsMouseKeycode.KC_S },
	{ key: 'KeyT', value: EDmsMouseKeycode.KC_T },
	{ key: 'KeyU', value: EDmsMouseKeycode.KC_U },
	{ key: 'KeyV', value: EDmsMouseKeycode.KC_V },
	{ key: 'KeyW', value: EDmsMouseKeycode.KC_W },
	{ key: 'KeyX', value: EDmsMouseKeycode.KC_X },
	{ key: 'KeyY', value: EDmsMouseKeycode.KC_Y },
	{ key: 'KeyZ', value: EDmsMouseKeycode.KC_Z },
	{ key: 'Comma', value: EDmsMouseKeycode.KC_COMMA },
	{ key: 'Period', value: EDmsMouseKeycode.KC_QUOT },
	{ key: 'Semicolon', value: EDmsMouseKeycode.KC_SCLN },
	{ key: 'Quote', value: EDmsMouseKeycode.KC_APOSTROPHE },
	{ key: 'BracketLeft', value: EDmsMouseKeycode.KC_LBRC },
	{ key: 'BracketRight', value: EDmsMouseKeycode.KC_RBRC },
	{ key: 'Backspace', value: EDmsMouseKeycode.USB_USAGE_BACKSPACE },
	{ key: 'Backquote', value: EDmsMouseKeycode.KC_GRV },
	{ key: 'Slash', value: EDmsMouseKeycode.KC_SLSH },
	{ key: 'Backslash', value: EDmsMouseKeycode.KC_BSLS },
	{ key: 'Minus', value: EDmsMouseKeycode.KC_MINS },
	{ key: 'Equal', value: EDmsMouseKeycode.KC_EQL },
	{ key: 'AltLeft', value: EDmsMouseKeycode.KC_LALT },
	{ key: 'AltRight', value: EDmsMouseKeycode.KC_RALT },
	{ key: 'CapsLock', value: EDmsMouseKeycode.KC_CAPS },
	{ key: 'ControlLeft', value: EDmsMouseKeycode.KC_LCTL },
	{ key: 'ControlRight', value: EDmsMouseKeycode.KC_RCTL },
	{ key: 'MetaLeft', value: EDmsMouseKeycode.KC_LGUI },
	{ key: 'MetaRight', value: EDmsMouseKeycode.KC_RGUI },
	{ key: 'ShiftLeft', value: EDmsMouseKeycode.KC_LSFT },
	{ key: 'ShiftRight', value: EDmsMouseKeycode.KC_RSFT },
	{ key: 'ContextMenu', value: EDmsMouseKeycode.KC_APP },
	{ key: 'Enter', value: EDmsMouseKeycode.KC_ENT },
	{ key: 'Space', value: EDmsMouseKeycode.KC_SPC },
	{ key: 'Tab', value: EDmsMouseKeycode.USB_USAGE_TAB },
	{ key: 'Delete', value: EDmsMouseKeycode.KC_DEL },
	{ key: 'End', value: EDmsMouseKeycode.KC_END },
	{ key: 'Home', value: EDmsMouseKeycode.KC_HOME },
	{ key: 'Insert', value: EDmsMouseKeycode.KC_INS },
	{ key: 'PageDown', value: EDmsMouseKeycode.KC_PGDN },
	{ key: 'PageUp', value: EDmsMouseKeycode.KC_UP },
	{ key: 'ArrowDown', value: EDmsMouseKeycode.KC_DOWN },
	{ key: 'ArrowLeft', value: EDmsMouseKeycode.KC_LEFT },
	{ key: 'ArrowRight', value: EDmsMouseKeycode.KC_RGHT },
	{ key: 'ArrowUp', value: EDmsMouseKeycode.KC_PGUP },
	{ key: 'Escape', value: EDmsMouseKeycode.KC_ESC },
	{ key: 'PrintScreen', value: EDmsMouseKeycode.KC_PSCR },
	{ key: 'ScrollLock', value: EDmsMouseKeycode.KC_SLCK },
	{ key: 'Pause', value: EDmsMouseKeycode.KC_PAUS },
	{ key: 'F1', value: EDmsMouseKeycode.KC_F1 },
	{ key: 'F2', value: EDmsMouseKeycode.KC_F2 },
	{ key: 'F3', value: EDmsMouseKeycode.KC_F3 },
	{ key: 'F4', value: EDmsMouseKeycode.KC_F4 },
	{ key: 'F5', value: EDmsMouseKeycode.KC_F5 },
	{ key: 'F6', value: EDmsMouseKeycode.KC_F6 },
	{ key: 'F7', value: EDmsMouseKeycode.KC_F7 },
	{ key: 'F8', value: EDmsMouseKeycode.KC_F8 },
	{ key: 'F9', value: EDmsMouseKeycode.KC_F9 },
	{ key: 'F10', value: EDmsMouseKeycode.KC_F10 },
	{ key: 'F11', value: EDmsMouseKeycode.KC_F11 },
	{ key: 'F12', value: EDmsMouseKeycode.KC_F12 },
	{ key: 'F13', value: EDmsMouseKeycode.KC_F13 },
	{ key: 'F14', value: EDmsMouseKeycode.KC_F14 },
	{ key: 'F15', value: EDmsMouseKeycode.KC_F15 },
	{ key: 'F16', value: EDmsMouseKeycode.KC_F16 },
	{ key: 'F17', value: EDmsMouseKeycode.KC_F17 },
	{ key: 'F18', value: EDmsMouseKeycode.KC_F18 },
	{ key: 'F19', value: EDmsMouseKeycode.KC_F19 },
	{ key: 'F20', value: EDmsMouseKeycode.KC_F20 },
	{ key: 'F21', value: EDmsMouseKeycode.KC_F21 },
	{ key: 'F22', value: EDmsMouseKeycode.KC_F22 },
	{ key: 'F23', value: EDmsMouseKeycode.KC_F23 },
	{ key: 'F24', value: EDmsMouseKeycode.KC_F24 },
	{ key: 'NumLock', value: EDmsMouseKeycode.KC_NLCK },
	{ key: 'Numpad0', value: EDmsMouseKeycode.KC_P0 },
	{ key: 'Numpad1', value: EDmsMouseKeycode.KC_P1 },
	{ key: 'Numpad2', value: EDmsMouseKeycode.KC_P2 },
	{ key: 'Numpad3', value: EDmsMouseKeycode.KC_P3 },
	{ key: 'Numpad4', value: EDmsMouseKeycode.KC_P4 },
	{ key: 'Numpad5', value: EDmsMouseKeycode.KC_P5 },
	{ key: 'Numpad6', value: EDmsMouseKeycode.KC_P6 },
	{ key: 'Numpad7', value: EDmsMouseKeycode.KC_P7 },
	{ key: 'Numpad8', value: EDmsMouseKeycode.KC_P8 },
	{ key: 'Numpad9', value: EDmsMouseKeycode.KC_P9 },
	{ key: 'NumpadAdd', value: EDmsMouseKeycode.KC_PPLS },
	{ key: 'NumpadComma', value: EDmsMouseKeycode.KC_COMM },
	{ key: 'NumpadDecimal', value: EDmsMouseKeycode.KC_DOT },
	{ key: 'NumpadDivide', value: EDmsMouseKeycode.KC_PSLS },
	{ key: 'NumpadEnter', value: EDmsMouseKeycode.KC_PENT },
	{ key: 'NumpadMultiply', value: EDmsMouseKeycode.KC_PAST },
	{ key: 'NumpadSubtract', value: EDmsMouseKeycode.KC_PMNS },
	{ key: 'Nothing', value: EDmsMouseKeycode.KC_NO },
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
