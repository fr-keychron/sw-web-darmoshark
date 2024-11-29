export interface ISelectEnum {
	label: string
	value: any
}

export type ISelectEnums = Array<ISelectEnum>

export enum EKeycapType {
	Combo,
	Spec,
	Normal
}

export enum EHeWorkMode {
	Global,
	Static,
	QuickTrigger,
}

export enum EDksAction {
	None = 0b0000,
	// Press = 0b0100,
	Release = 0b0001, // 1
	Press = 0b0010, // 2
	ReleaseAndPress = 0b0011, // 3
	PressAndRelease = 0b0110,// 6
	ReleaseAndPressAndRelease = 0b0111,// 7

}

export * from './keyboardCommand'
export * from './keycodes/default'
export * from './keycodes/v10'
export * from './keycodes/v11'
export * from './keycodes/v12'
