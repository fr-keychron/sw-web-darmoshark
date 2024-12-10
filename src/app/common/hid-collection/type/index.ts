import {KeyboardDevice} from "../hid-device/keyboard-device";
import {MouseDevice, IMouseJson} from "../hid-device/mouse-device";
import {EDeviceType} from "../enum";
import {IKeyBoardDef} from "../../../model";

export interface IHidCollection {
	collection: {
		keyboard: Array<KeyboardDevice>,
		mouse: Array< MouseDevice >,
		bridge: Array< any >
	}

	createKeyboard(hid: any): void

	createMouse(hid: any): void

	createBridgeDevice(hid: any): void
}

export enum EEventEnum {
	ADDED,
	CONNECT,
	DISCONNECT,
	CLOSED,
	ERROR,
	Change,
	Update
}

export interface IEvent {
	type: EEventEnum,
	data: any,
	deviceType?: EDeviceType ,
}


export interface IKeyboardOptions {
	loadByJson?: boolean,
	json?: IKeyBoardDef,
	product?: any
}

export interface IMouseOptions {
	product?: any,
	json?: IMouseJson
}