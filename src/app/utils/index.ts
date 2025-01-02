export * from './console.util'
export * from './str.util'
export * from './byte.util'
import lodash from 'lodash';
let scale = 1 ;
export const GetScale = () => 1
export const gen2dMatrix = (rol: number, col: number, initVal: any = undefined) => Array(rol).fill(0).map(() => Array(col).fill(initVal))
export const imageEl2Base64 = (img: HTMLImageElement): string => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.height = img.height
	canvas.width = img.width;
	ctx.drawImage(img, 0, 0);
	return canvas.toDataURL("image/png")
}

export let CSSVarObject = {
	keyWidth: 52 * GetScale(),
	keyXSpacing: 1 * GetScale(),
	keyHeight: 54 * GetScale(),
	keyYSpacing: 1 * GetScale(),
	keyXPos: (52 + 1) * GetScale(),
	keyYPos: (54 + 1) * GetScale(),
	faceXPadding: [6, 6],
	faceYPadding: [2, 10],
	insideBorder: 10,
};

export const UpdateCssVarObject = (s: number) => {
	scale = s ;
	CSSVarObject = {
		keyWidth: 52 * GetScale(),
		keyXSpacing: 2 * GetScale(),
		keyHeight: 54 * GetScale(),
		keyYSpacing: 2 * GetScale(),
		keyXPos: (52 + 2) * GetScale(),
		keyYPos: (54 + 2) * GetScale(),
		faceXPadding: [6, 6],
		faceYPadding: [2, 10],
		insideBorder: 10,
	}
}

export function calculatePointPosition({
	                                       x = 0,
	                                       x2 = 0,
	                                       y = 0,
	                                       r = 0,
	                                       rx = 0,
	                                       ry = 0,
	                                       w = 0,
	                                       w2 = 0,
	                                       h = 0,
                                       }: any) {
	// We express the radians in counter-clockwise form, translate the point by the origin, rotate it, then reverse the translation
	const rRadian = (r * (2 * Math.PI)) / 360;
	const cosR = Math.cos(rRadian);
	const sinR = Math.sin(rRadian);
	const originX = CSSVarObject.keyXPos * rx;
	const originY = CSSVarObject.keyYPos * ry;
	const xPos =
		CSSVarObject.keyXPos * (x + x2) +
		(Math.max(w2, w) * CSSVarObject.keyWidth) / 2 +
		((Math.max(w2, w) - 1) * CSSVarObject.keyXSpacing) / 2;
	const yPos =
		CSSVarObject.keyYPos * y +
		(h * CSSVarObject.keyHeight) / 2 +
		((h - 1) * CSSVarObject.keyYSpacing) / 2;
	const transformedXPos =
		xPos * cosR - yPos * sinR - originX * cosR + originY * sinR + originX;
	const transformedYPos =
		xPos * sinR + yPos * cosR - originX * sinR - originY * cosR + originY;

	return [transformedXPos, transformedYPos];
}

const sortByX = (a: any, b: any) => {
	const aPoint = calculatePointPosition(a);
	const bPoint = calculatePointPosition(b);
	return aPoint[0] - bPoint[0];
};

const sortByYX = (a: any, b: any) => {
	const aPoint = calculatePointPosition(a);
	const bPoint = calculatePointPosition(b);
	return aPoint[1] - bPoint[1] === 0
		? aPoint[0] - bPoint[0]
		: aPoint[1] - bPoint[1];
};

const withinChain = (a: any, b: any) => {
	const aPoint = calculatePointPosition(a);
	const bPoint = calculatePointPosition(b);

	const yDiff = Math.abs(aPoint[1] - bPoint[1]);
	// Fudging factor
	return yDiff < CSSVarObject.keyYPos * 0.9;
};

export const getTraversalOrder = (arr: any[]): any[] => {
	const [car, ...cdr] = [...arr].sort(sortByYX);
	if (car === undefined) {
		return cdr;
	} else {
		const [chain, rest] = lodash.partition([...arr], (a: any) => withinChain(car, a));
		return [...chain.sort(sortByX), ...getTraversalOrder(rest)];
	}
};

export const findMissingIndices = (indexList: Array<any>, totalRange: number) => {
	const indexSet = new Set(indexList);
	const missingIndices = [];
	for (let i = 1; i <= totalRange; i++) {
		if (!indexSet.has(i)) {
			missingIndices.push(i);
		}
	}
	return missingIndices;
}

export const supportHid = () => {
	return 'hid' in navigator;
}
