export interface IKeycode {
	name: string;
	code: string;
	title?: string;
	shortName?: string;
	capName?: string
	keys?: string;
	width?: number;
	type?: 'container' | 'text' | 'layer';
	layer?: number;
	event?: any
	plat?: string[]
	mode?: string[]
}
 