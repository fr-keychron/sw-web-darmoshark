import {
	EMouseBtn,
	EMouseBtnAction,
	EMouseBtnDpi,
	EMouseBtnGameKey,
	EMouseBtnGameMouse,
	EMouseBtnMedia,
	EMousseBtnShortcut,
	EMouseKeycodeDefault,
	EDmsMouseBtnAction,
	EDmsMouseBtnDpi,
	EDmsMouseBtnMedia,
	EDmsMouseBtnShortcut,
	EDmsMousseBtnLight,
	EMdsMouseBtnDisabled,
	EDmsMouseKeycode,
	EMdsMouseBtnGameDefault,
	EDmsMouseKeycodeDefault
} from "../enum";
import {ByteUtil} from "src/app/utils";
import keyJson from 'src/assets/json/mouse.json';
import {IMacroItem, RecordList} from "../types";
import {EMacroLoop, EKey, EMacroMouseButton} from "../enum";

export const deserializeMouseButton = (type: EMouseBtn, data: Uint8Array) => {
	const handle = {
		[EMouseBtn.Mouse]: () => {
			const value = ByteUtil.byteToNum([data[0], data[1], data[2]])
			return EMouseBtnAction.find(i => i.value === value);
		},
		[EMouseBtn.Keyboard]: () => {
			const shiftKey = data[0];
			const key1 = data[1];
			const key2 = data[2];

			const keyVal1 = EMouseKeycodeDefault[key1]
			const keyVal2 = EMouseKeycodeDefault[key2]
			const keyItem1 = (<any[]>keyJson[0].keycodes).find((i: any) => i.code === keyVal1);
			const keyItem2 = (<any[]>keyJson[0].keycodes).find((i: any) => i.code === keyVal2);
			return {
				shiftKey: shiftKey ? shiftKey : null,
				key1: keyItem1, key2: keyItem2
			}
		},
		[EMouseBtn.Media]: () => {
			const value = ByteUtil.byteToNum([data[1], data[0]])
			return EMouseBtnMedia.find(i => i.value === value)
		},
		[EMouseBtn.Dpi]: () => {
			return EMouseBtnDpi.find(i => i.value === data[0]);
		},
		[EMouseBtn.GameReinforce]: () => {
			const type = data[0]
			const keycode = data[1]
			const speed = ByteUtil.byteToNum([data[3], data[2]])
			const count = ByteUtil.byteToNum([data[5], data[4]])

			let k;
			if (type === EMouseBtnGameKey.mouse) {
				k = EMouseBtnGameMouse.find(i => i.value === keycode);
			}

			if (type === EMouseBtnGameKey.keyboard) {
				k = EMouseKeycodeDefault[keycode]
			}

			return {type, speed, count, keycode: k}
		},
		[EMouseBtn.ShortCut]: () => {
			const value = ByteUtil.byteToNum([data[0], data[1], data[2]])
			return EMousseBtnShortcut.find(i => i.value === value)
		}
	}
	return type in handle ? Reflect.get(handle, type).call(handle) : {}
}


// export const serializeMacro = (s: Array<IMacroItem>): Array<number[]> => {
// 	if (!s.length) return [];
// 	const result: Array<number[]> = [];
// 	const delay = (v: number) => [0, 0xf, v & 255, v >>> 8];
// 	s.forEach(m => {
// 		const {type, action, key} = m;
// 		if (action === EMacroEventTypeKey.delay) return result.push(delay(m.key.val))
// 		if (type === EMouseBtnGameKey.keyboard) {
// 			const eventType = action << 7 | 0b1;
// 			result.push([0, eventType, key.val, 0])
// 		}

// 		if (type === EMouseBtnGameKey.mouse) {
// 			const eventType = action << 7 | 0b1000;
// 			result.push([0, eventType, key.val, 0])
// 		}
// 	})
// 	return result
// }

export const serializeMacro = (s: Array<RecordList>): Array<number[]> => {
  if (!s.length) return [];
  const result: Array<number[]> = [];
  const delay = (v: number) => [0, 0xf, v & 255, v >>> 8];
  s.forEach(m => {
    const { type, action, key } = m;
    if (action === EKey.delay) return result.push(delay(m.key.value))
    if (type === 'keyboard') {
      const eventType = action << 7 | 0b1;
      result.push([0, eventType, key.value, 0])
    }

    if (type === 'mouse') {
      const eventType = action << 7 | 0b1000;
      result.push([0, eventType, key.value, 0])
    }
  })
  return result
}

export const deserializeMacroByShort = (v: number[]): Record<string, any> => {
	const loop = ByteUtil.oct2Bin(ByteUtil.byteToNum([v[1], v[2]], 'LowToHigh'), 16)
	const delay = ByteUtil.byteToNum([v[3], v[4]], 'LowToHigh')
	const loopEnd = ByteUtil.bin2Oct(loop.substring(0, 3))
	const loopCount = ByteUtil.bin2Oct(loop.substring(5, 15))
	const mBytes = v.slice(6, v.length);
	const m: any[] = []
	for (let i = 0; i < mBytes.length; i += 4) {
		const byte = mBytes.slice(i, i + 4);
		const result: any = {
			action: null, type: null,
			key: {value: null, code: null, name: null, keys: null}
		}

		if (byte[1] === 0xf) {
			result.action = EKey.delay
			result.type = EMouseBtnGameKey.keyboard
			result.key.value = ByteUtil.byteToNum([byte[2], byte[3]], 'LowToHigh')
		} else {
			const byte1 = ByteUtil.oct2Bin(byte[1]);
			const type = ByteUtil.bin2Oct(byte1.substring(3, 8));

			if (type === 1) {
				result.type = EMouseBtnGameKey.keyboard
				result.action = Number(byte1.charAt(0))
				const keyVal = ByteUtil.byteToNum([byte[2], byte[3]], 'LowToHigh')
				const key = EMouseKeycodeDefault[keyVal]
				const keyItem = (<any[]>keyJson[0].keycodes).find((i: any) => i.code === key);
				result.key = {...keyItem, value: keyVal}
			}

			if (type === 8) {
				result.type = EMouseBtnGameKey.mouse
				result.action = Number(byte1.charAt(0))
				const keyVal = ByteUtil.byteToNum([byte[2], byte[3]], 'LowToHigh')
				const keyItem = EMacroMouseButton.find(i => i.value === keyVal);
				result.key = {...keyItem, value: keyVal, name: keyItem.key}
			}
		}

		m.push(result)
	}
	return {
		loop: {
			end: EMacroLoop.find(i => i.value === loopEnd),
			count: loopCount
		},
		macros: m,
		delay
	}
}
export const deserializeMacroByLong = (v: number[]): Record<string, any> => {
	const loop = ByteUtil.oct2Bin(ByteUtil.byteToNum([v[6], v[7]], 'LowToHigh'), 16)
	const delay = ByteUtil.byteToNum([v[8], v[9]], 'LowToHigh')
	const loopEnd = ByteUtil.bin2Oct(loop.substring(0, 3))
	const loopCount = ByteUtil.bin2Oct(loop.substring(5, 15))

	const mBytes = v.slice(11, v.length);
	const m: any[] = []
	for (let i = 0; i < mBytes.length; i += 4) {
		const byte = mBytes.slice(i, i + 4);
		const result: any = {
			action: null, type: null,
			key: {value: null, code: null, name: null, keys: null}
		}
		if (byte[1] === 0xf) {
			result.action = EKey.delay
			result.type = EMouseBtnGameKey.keyboard
			result.key.value = ByteUtil.byteToNum([byte[2], byte[3]], 'LowToHigh')
		} else {
			const byte1 = ByteUtil.oct2Bin(byte[1]);
			const type = ByteUtil.bin2Oct(byte1.substring(3, 8));
			if (type === 1) {
				result.type = EMouseBtnGameKey.keyboard
				result.action = Number(byte1.charAt(0))
				const keyVal = ByteUtil.byteToNum([byte[2], byte[3]], 'LowToHigh')
				const key = EMouseKeycodeDefault[keyVal]
				const keyItem = (<any[]>keyJson[0].keycodes).find((i: any) => i.code === key);
				result.key = {...keyItem, value: keyVal}
			}

			if (type === 8) {
				result.type = EMouseBtnGameKey.mouse
				result.action = Number(byte1.charAt(0))
				const keyVal = ByteUtil.byteToNum([byte[2], byte[3]], 'LowToHigh')
				const keyItem = EMacroMouseButton.find(i => i.value === keyVal);
				result.key = {...keyItem, value: keyVal, name: keyItem.key}
			}
		}
		m.push(result)
	}

	return {
		loop: {
			end: EMacroLoop.find(i => i.value === loopEnd),
			count: loopCount
		},
		macros: m,
		delay
	}
}

export const getMouseButtonInfo = (bufferArr: number[]) => {
	const value = ByteUtil.arrayToNumber(bufferArr)
	
	if(bufferArr[0] === 9){
		return  {EMouseBtn: 4}
	}
	
	if (bufferArr.every(value => value === 0)) {
		return { EMouseBtn: 9 };
	}
	
	//按钮设置
	const mouseBtnAction = EDmsMouseBtnAction.find(i => i.value === value)
	if(mouseBtnAction) {
		return  { EMouseBtn: 1, ...mouseBtnAction }
	}

	//DPI
	const mouseBtnDpi = EDmsMouseBtnDpi.find(i => i.value === value)
	if(mouseBtnDpi) {
		return  { EMouseBtn: 5, ...mouseBtnDpi }
	}

	//多媒体
	const mouseBtnMedia = EDmsMouseBtnMedia.find(i => i.value === value)
	if(mouseBtnMedia) {
		return  { EMouseBtn: 3, ...mouseBtnMedia }
	}
	
	//灯光
	const mouseBtnLight = EDmsMousseBtnLight.find(i => i.value === value)
	if(mouseBtnLight) {
		return  { EMouseBtn: 6, ...mouseBtnLight }
	}

	//键盘组合键
	if(bufferArr[0] === 0 &&  bufferArr[1] <= 8){
		let keycode = EDmsMouseKeycode[bufferArr[2]]
		const keyItem = (<any[]>keyJson[0].keycodes).find((i: any) => i.code === keycode);
		let keyValue = EDmsMouseKeycodeDefault.find((i: { value: number; }) => i.value === bufferArr[2]); 
		return  {EMouseBtn: 2, shiftKey:bufferArr[1], key1:{...keyItem, value: keyValue.value}}
	}

	//快捷键
	const mouseBtnShortcut = EDmsMouseBtnShortcut.find(i => i.value === value)
	if(mouseBtnShortcut) {
		return  { EMouseBtn: 8, ...mouseBtnShortcut }
	}

	//禁用
	const mouseBtnDisabled = EMdsMouseBtnDisabled.find(i => i.value === value)
	if(mouseBtnDisabled) {
		return  { EMouseBtn: 9 }
	}
	

	//游戏增强键
	if(bufferArr[0] &&  bufferArr[0] > 8){
		if (bufferArr[0] >= 0x10 && bufferArr[0] <= 0x1F) {
			let mouseCode = EMdsMouseBtnGameDefault.find(i => i.value === bufferArr[1]);
			if(mouseCode) {
				return  {EMouseBtn: 7, type:0, count:bufferArr[2], speed:bufferArr[3],keycode:mouseCode}
			}
		} else if (bufferArr[0] >= 0x20 && bufferArr[0] <= 0x2F) {
			let keycode = EDmsMouseKeycodeDefault.find((i: { value: number; }) => i.value === bufferArr[1]);
			if(keycode) {
				return  {EMouseBtn: 7, type:1, count: bufferArr[2], speed: bufferArr[3],keycode: keycode}
			}
		} else if (bufferArr[0] >= 0x30 && bufferArr[0] <= 0x3F) {
			let keycode = EDmsMouseKeycodeDefault.find((i: { value: number; }) => i.value === bufferArr[1]);
			
			if(keycode) {
				return  {EMouseBtn: 7, type: 2, count: bufferArr[2], speed: bufferArr[3],keycode: keycode}
			}
		}
	}
}

export const dmsSerializeMacro = (s: Array<RecordList>): Array<number[]> => {
	if (!s.length) return [];
	const result: Array<number[]> = [];
	s.forEach((m, index )=> {
		const { type, action, key } = m;
		const buf =[]
		if (type === 'mouse') {
			buf[0] = action === EKey.press ? 4 : 0x80 | 4
			buf[1] = key.value & 0xFF;
			if(s[index+1] && s[index+1].action === EKey.delay){
				buf[2] = (s[index+1].key.value >> 8) & 0xFF;
				buf[3] = s[index+1].key.value & 0xFF; 
			}else{
				buf[2] = 10 & 0xFF;
				buf[3] = (10 >> 8) & 0xFF; 
			}   
			result.push(buf)
		}
		if (type === 'keyboard') {
			buf[0] = action === EKey.press ? 1 : 0x80 | 1
			buf[1] = key.value & 0xFF;
			if(s[index+1] && s[index+1].action === EKey.delay){
				buf[2] = s[index+1].key.value & 0xFF; 
				buf[3] = (s[index+1].key.value >> 8) & 0xFF;
			}else{
				buf[2] = 10 & 0xFF;
				buf[3] = (10 >> 8) & 0xFF; 
			}
			result.push(buf)
		}
	})
	return result
}