export type IKeyMacroItem  = any[]
export type IKeyMacro  =  Array< IKeyMacroItem >
export type IKeyMacros  =  Array< IKeyMacro >
export interface  IMacroEvent {
	type: "delete" | "update" ,
	data: IKeyMacro ,
	idx: number
	key?: any
}
