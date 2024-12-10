import { EDmsMouseBtnActionKey, EDmsMouseBtnDpiKey, EDmsMouseBtnMediaKey, EDmsMouseBtnShortcutKey } from "./dms-mouse"

export enum EMouseBtn {
	remove,
	Mouse,
	Keyboard,
	Media,
	Macro,
	Dpi,
	Light,
	GameReinforce,
	ShortCut,
	disable=9,
	profileSwitch=10
}

export const EMouseBtnKey =[
	{code: 'remove', value: 0},
	{code: 'Mouse', value: 1},
	{code: 'Keyboard', value: 2},
	{code: 'Media', value: 3},
	{code: 'Macro', value: 4},
	{code: 'Dpi', value: 5},
	{code: 'Light', value: 6},
	{code: 'GameReinforce', value: 7},
	{code: 'ShortCut', value: 8},
	{code: 'disable', value: 9},
	{code: 'profileSwitch', value: 10},
]

export enum EMouseBtnMediaKey {
	volumeUp = 0x00e9,
	volumeDown = 0x00ea,
	mute = 0x00e2,
	player = 0x0183,
	pause = 0x00cd,
	previous = 0x00b6,
	next = 0x00b5,
	stop = 0x00b7
}

export const EMouseBtnMedia = [
	{key: 'volumeUp', value: EMouseBtnMediaKey.volumeUp},
	{key: 'volumeDown', value: EMouseBtnMediaKey.volumeDown},
	{key: 'mute', value: EMouseBtnMediaKey.mute},
	// {key: 'player', value: EMouseBtnMediaKey.player},
	{key: 'pause', value: EMouseBtnMediaKey.pause},
	{key: 'previous', value: EMouseBtnMediaKey.previous},
	{key: 'next', value: EMouseBtnMediaKey.next},
	// {key: 'stop', value: EMouseBtnMediaKey.stop}
]


export enum EMouseBtnActionKey {
	leftClick = 0x010000,
	rightClick = 0x020000,
	middleClick = 0x040000,
	button4Click = 0x080000,
	button5Click = 0x100000,
	lickDoubleClick = 0x800000,
	upScroll = 0x000200,
	downScroll = 0x00fe00,
	leftScroll = 0x0000fe,
	rightScroll = 0x000002,
	leftScrollSustain = 0x4000ff,
	rightScrollSustain = 0x400001
}

export let EMouseBtnAction = [
	{key: 'leftClick', value: EMouseBtnActionKey.leftClick},
	{key: 'rightClick', value: EMouseBtnActionKey.rightClick},
	{key: 'middleClick', value: EMouseBtnActionKey.middleClick}, 
	{key: 'button4Click', value: EMouseBtnActionKey.button5Click},
	{key: 'button5Click', value: EMouseBtnActionKey.button4Click},
	{key: 'scrollLeftClick', value: ''},
	{key: 'scrollRightClick', value: ''},
	{key: 'rightScroll', value: EMouseBtnActionKey.rightScroll},
	{key: 'leftScroll', value: EMouseBtnActionKey.leftScroll},
	{key: 'downScroll', value: EMouseBtnActionKey.downScroll},
	{key: 'upScroll', value: EMouseBtnActionKey.upScroll},
	{key: 'lickDoubleClick', value: EMouseBtnActionKey.lickDoubleClick},
	// {key: 'leftScrollSustain', value: EMouseBtnActionKey.leftScrollSustain},
	// {key: 'rightScrollSustain', value: EMouseBtnActionKey.rightScrollSustain},
]
export const setEMouseBtnAction = (key: string, value: number) => {
  EMouseBtnAction = EMouseBtnAction.map(b => b.key === key ? {key, value}:b)
}

export enum EMouseBtnDpiKey {
	loop = 0x01,
	up,
	down
}

export const EMouseBtnDpi = [
	{key: "loop", value: EMouseBtnDpiKey.loop},
	{key: "up", value: EMouseBtnDpiKey.up},
	{key: "down", value: EMouseBtnDpiKey.down}
]

export enum EMouseBtnGameKey {
	mouse = 0x01,
	keyboard = 0x02
}

export const EMouseBtnGame = [
	{key: 'mouse', value: EMouseBtnGameKey.mouse},
	{key: 'keyboard', value: EMouseBtnGameKey.keyboard},
]

export enum EMouseBtnGameMouseKey {
	left = 0b00000001,
	right = 0b00000010,
	middle = 0b00000100,
	front = 0b00001000,
	back = 0b00010000,
}

export const EMouseBtnGameMouse = [
	{key: 'left', value: EMouseBtnGameMouseKey.left, event: 0},
	{key: 'right', value: EMouseBtnGameMouseKey.right, event: 2},
	{key: 'middle', value: EMouseBtnGameMouseKey.middle, event: 1},
	{key: 'front', value: EMouseBtnGameMouseKey.front, event: 4},
	{key: 'back', value: EMouseBtnGameMouseKey.back, event: 3}
]

export enum EMousseBtnShortcutKey {
	brightnessUp = 0x0c6f00,
	brightnessDown = 0x0c7000,
	calculate = 0x0c9201,
	screenshot = 0x070a21,
	myComputer = 0x0c9401,
	homePage = 0x0c2302,
	home = 0x070807,
	email = 0x0c8a01,
	refresh = 0x07003e,
	switchApp = 0x07042b,
	copy = 0x070106,
	cut = 0x07011b,
	paste = 0x070119,
	task = 0x0c9f02,
	launchPad = 0x0ca002
}
// const screenshot = getBrowerType()
export const EMousseBtnShortcut = [
	{key: 'brightnessUp', value: EMousseBtnShortcutKey.brightnessUp, plat: ['Win', 'Mac']},
	{key: 'brightnessDown', value: EMousseBtnShortcutKey.brightnessDown, plat: ['Win', 'Mac']},
	{key: 'screenshot', value: EMousseBtnShortcutKey.screenshot, plat: ['Mac']},
	{key: 'launchPad', value: EMousseBtnShortcutKey.launchPad, plat: ['Mac']},
	{key: 'task', value: EMousseBtnShortcutKey.task, plat: ['Mac']},
	// {key: 'homePage', value: EMousseBtnShortcutKey.homePage, plat: ['Win']},
	{key: 'home', value: EMousseBtnShortcutKey.home, plat: ['Win']},
	{key: 'copy', value: EMousseBtnShortcutKey.copy, plat: ['Win']},
	{key: 'cut', value: EMousseBtnShortcutKey.cut, plat: ['Win']},
	{key: 'paste', value: EMousseBtnShortcutKey.paste, plat: ['Win']},
	// {key: 'calculate', value: EMousseBtnShortcutKey.calculate, plat: ['Win']},
	// {key: 'myComputer', value: EMousseBtnShortcutKey.myComputer, plat: ['Win']},
	// {key: 'email', value: EMousseBtnShortcutKey.email, plat: ['Win']},
	// {key: 'refresh', value: EMousseBtnShortcutKey.refresh, plat: ['Win']},
	// {key: 'switchApp', value: EMousseBtnShortcutKey.switchApp, plat: ['Win']},
]
// function getBrowerType() {
//   const agent = navigator.userAgent.toLowerCase();
//   const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
//   if (agent.indexOf("win") >= 0 || agent.indexOf("wow") >= 0) {
//     return ['Win', 0x070a21 ]
//   }
//   if (isMac) {
//     return ['Mac', 0x070a16 ]
//   }
// }


export const convertMousseBtnShortcut = () => {
    return EMousseBtnShortcut.forEach(item => {
        const newValue = EDmsMouseBtnShortcutKey[item.key as keyof typeof EDmsMouseBtnShortcutKey]
		if (newValue !== undefined) {
            item.value = newValue as unknown as EMousseBtnShortcutKey
        }
    })
};
export const convertMouseBtnDpi = () => {
    return EMouseBtnDpi.forEach(item => {
        const newValue = EDmsMouseBtnDpiKey[item.key as keyof typeof EDmsMouseBtnDpiKey]
		if (newValue !== undefined) {
            item.value = newValue as unknown as EMouseBtnDpiKey
        }
    })
};
export const convertMouseBtnMedia = () => {
    return EMouseBtnMedia.forEach(item => {
        const newValue = EDmsMouseBtnMediaKey[item.key as keyof typeof EDmsMouseBtnMediaKey]
		if (newValue !== undefined) {
            item.value = newValue as unknown as EMouseBtnMediaKey
        }
    })
};
export const convertMouseBtnActionEnum = () => {
    return EMouseBtnAction.forEach(item => {
        const newValue = EDmsMouseBtnActionKey[item.key as keyof typeof EDmsMouseBtnActionKey]
		if (newValue !== undefined) {
            item.value = newValue as unknown as EMouseBtnActionKey;
        }
    })
};