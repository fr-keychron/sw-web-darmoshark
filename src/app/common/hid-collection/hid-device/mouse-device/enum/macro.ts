import { EDmsMacroLoopKey } from "./dms-mouse";

// 触发事件
export enum EKey {
  delay = 0b00001111, // 延时，触发着的时间（ms）
  press = 0b1, // 按下
  release = 0b0, // 弹起
  // text = 0b0, // 文本键入
}
export const EKeyType = [
  { key: 'delay', value: EKey.delay },
  { key: 'press', value: EKey.press },
  { key: 'release', value: EKey.release },
  // {key: 'text', value: EKey.text}
]

// 循环结束设置
export enum EMacroLoopKey {
  loopTilCount = 0b000, // 循环次数
  loopTilRelease = 0b001, // 弹起停止循环
  loopTilPress = 0b010, // 按下即停止循环 
  loopTilDoublePress = 0b011 // 重新按下停止循环
}
export const EMacroLoop = [
  { key: "loopTilCount", value: EMacroLoopKey.loopTilCount },
  { key: "loopTilRelease", value: EMacroLoopKey.loopTilRelease },
  { key: "loopTilPress", value: EMacroLoopKey.loopTilPress },
  { key: "loopTilDoublePress", value: EMacroLoopKey.loopTilDoublePress },
]

// 键入事件类型
export enum EMacroActionKey {
  key = 0b0000001, // 键盘按键
  shift = 0b0000010, // 键盘修饰键
  keyAndShift = 0b0000011, // 修饰键+键盘按键
  media = 0b0000100, // 多媒体按键
  scroll = 0b0000101, // 鼠标滚轮
  moveX = 0b0000110, // 鼠标x轴移动值
  moveY = 0b0000111, // 鼠标y轴移动值
  mouseKey = 0b0001000, // 鼠标按键
  cursor = 0b0001001, // 光标数据，x，y数据
  trigger = 0b0001010, // 触发事件
  delay = 0xf // 独立延时事件，单位ms，16bit，有效值1ms-10s
}
export const EMacroAction = [
  { key: "key", value: EMacroActionKey.key },
  { key: "shift", value: EMacroActionKey.shift },
  { key: "keyAndShift", value: EMacroActionKey.keyAndShift },
  { key: "media", value: EMacroActionKey.media },
  { key: "scroll", value: EMacroActionKey.scroll },
  { key: "moveX", value: EMacroActionKey.moveX },
  { key: "moveY", value: EMacroActionKey.moveY },
]

// 鼠标键入
export enum EMacroMouseButtonKey {
	left = 1,
	right = 2,
	middle = 4,
	front = 8,
	back = 16
}
export const EMacroMouseButton = [
	{key: 'left', value: EMacroMouseButtonKey.left, event: 0},
	{key: 'right', value: EMacroMouseButtonKey.right, event: 2},
	{key: 'middle', value: EMacroMouseButtonKey.middle, event: 1},
	{key: 'front', value: EMacroMouseButtonKey.front, event: 4},
	{key: 'back', value: EMacroMouseButtonKey.back, event: 3}
]

export const convertMacroLoop = () => {
	return  EMacroLoop.forEach(item => {
	    const newValue = EDmsMacroLoopKey[item.key as keyof typeof EDmsMacroLoopKey]
	    if (newValue !== undefined) {
        item.value = newValue as unknown as EMacroLoopKey
      }
  })
};

export const setEMacroMouseButton = (index: number, i: number) => {
  EMacroMouseButton[i].event = index
}