import {IKeycode} from "./keycode";

export interface IKeycodeMenu {
	id: string;
	label: string;
	keycodes: IKeycode[];
	width?: 'label';
	detailed?: string;
}
