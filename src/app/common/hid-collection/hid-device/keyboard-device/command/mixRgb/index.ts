import {IMixEffect, IMixRgbConf, IMixRgbMatrix} from "./type";

export * from './type' ;
export * from './V1' ;

export class MixRgbConf implements IMixRgbConf {
	matrix: Array<IMixRgbMatrix> = []
	name: string = ''
	vp: number = null
	region: Array<Array<IMixEffect>> = []
	current = false;

	constructor(d?: IMixRgbConf) {
		if (!d) return
		if (d.vp) this.vp = d.vp
		if (d.name) this.name = d.name
		if (d.region && d.region.length) this.region = d.region
		if (d.current) this.current = d.current;
	}

	buildName(n: string): this {
		if (n) this.name = n;
		return this
	}

	buildVp(vp: number): this {
		if (/\d+/g.test(vp.toString())) this.vp = vp
		return this
	}

	buildMatrix(n: Array<IMixRgbMatrix>): this {
		if (n.length) this.matrix = n
		return this
	}

	buildRegion(e: Array<Array<IMixEffect>>): this {
		if (e.length) this.region = e
		return this
	}

	buildCurrent(e: boolean): this {
		this.current = e
		return this
	}

	addRegion(e: Array<IMixEffect>): this {
		if (e) this.region.push(e);
		return this
	}
}
