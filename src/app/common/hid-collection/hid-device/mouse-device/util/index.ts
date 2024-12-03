import {
	EDmsMouseBtnAction,
	EDmsMouseBtnDpi,
	EDmsMouseBtnMedia,
	EDmsMouseBtnShortcut,
	EDmsMousseBtnLight,
	EMdsMouseBtnGameDefault,
	EDmsMouseKeycodeDefault,
	EDmsMouseKeycode,
	EMdsMouseBtnDisabled
} from "../enum";
import {ByteUtil} from "src/app/utils";
import keyJson from 'src/assets/json/mouse.json';
import {RecordList} from "../types";
import {EKey} from "../enum";
const allArrays = [
	EDmsMouseBtnAction,
	EDmsMouseBtnDpi,
	EDmsMouseBtnMedia,
	EDmsMouseBtnShortcut,
	EDmsMousseBtnLight,
	EMdsMouseBtnDisabled
].flat();
export const getMouseButtonInfo = (bufferArr: number[]) => {
	const value = ByteUtil.arrayToNumber(bufferArr);
	const data =  allArrays.find(i => (i as unknown as { value: number }).value === value);
	if(data){
		return  data
	}
	if(bufferArr[0] === 9){
		return  {type: 'mouseMacro'}
	}
	if(bufferArr[0] === 0 &&  bufferArr[1] <= 8){
		let keycode = EDmsMouseKeycode[bufferArr[2]]
		const keyItem = (<any[]>keyJson[0].keycodes).find((i: any) => i.code === keycode);
		return  {type: 'mouseKeyboard', shift:bufferArr[1], code:keyItem}
	}

	if(bufferArr[0] &&  bufferArr[0] > 8){
		if (bufferArr[0] >= 0x10 && bufferArr[0] <= 0x1F) {
			let mouseCode = EMdsMouseBtnGameDefault.find(i => i.value === bufferArr[1]);
			if(mouseCode) {
				return  {type: 'mouseGame', count:bufferArr[2], speed:bufferArr[3],...mouseCode}
			}
		} else if (bufferArr[0] >= 0x20 && bufferArr[0] <= 0x2F) {
			let keycode = EDmsMouseKeycodeDefault.find((i: { value: number; }) => i.value === bufferArr[1]);
			if(keycode) {
				return  {type: 'keyboardGame', count:bufferArr[2], speed:bufferArr[3],...keycode}
			}
		} else if (bufferArr[0] >= 0x30 && bufferArr[0] <= 0x3F) {
			let keycode = EDmsMouseKeycodeDefault.find((i: { value: number; }) => i.value === bufferArr[1]);
			
			if(keycode) {
				return  {type: 'keyboardGame', count:bufferArr[2], speed:bufferArr[3],...keycode}
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
			buf[0] = action === EKey.press ? 4 : 0x80+4
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
			buf[0] = action === EKey.press ? 1 : 0x80+1
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