import {of} from "rxjs";
import {result} from "lodash";

const table: Uint32Array = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
	let c = i;
	for (let k = 0; k < 8; k++) {
		c =
			(c & 1) ?
				(c >>> 1) ^ 0xEDB88320
				: c >>> 1;
	}
	table[i] = c;
}

export class ByteUtil {
	//将一个 16 位的整数拆分为两个 8 位的部分
	static shiftFrom16Bit(v: number) {
		return [v >> 8, v & 255]
	}
	//十六进制到二进制的转换
	static hex2Bin(hex: string, pad = 8) {
		return (parseInt(hex, 16).toString(2)).padStart(pad, '0')
	}
	//将一个八进制数转换为十六进制字符串。
	static oct2Hex(n: number, pad = 2, prefix = '0x') {
		return prefix + n.toString(16).padStart(pad, '0')
	}
	//将一个二进制字符串转换为十进制整数。
	static bin2Oct(n: string) {
		return parseInt(n, 2);
	}
	//将一个八进制数或字符串转换为二进制字符串，支持在头部或尾部填充 0。
	static oct2Bin(oct: string | number, pad = 8, dir: 'head' | 'tail' = 'head') {
		if (dir === 'head') return (parseInt(oct.toString(), 10)).toString(2).padStart(pad, '0');
		return (parseInt(oct.toString(), 10)).toString(2).padEnd(pad, '0');
	}
	//将一个十六进制字符串转换为十进制整数。
	static hex2Oct(hex: string) {
		if (/^0x/gi.test(hex)) return parseInt(hex.replace('0x', ''), 16)
		return parseInt(hex, 16)
	}

	static niceSize(n: number) {
		const gigabyte = 1024 * 1024 * 1024;
		const megabyte = 1024 * 1024;
		const kilobyte = 1024;
		if (n >= gigabyte) {
			return n / gigabyte + "GiB";
		} else if (n >= megabyte) {
			return n / megabyte + "MiB";
		} else if (n >= kilobyte) {
			return n / kilobyte + "KiB";
		} else {
			return n + "B";
		}
	}

	static hex4(n: number) {
		let s = n.toString(16)
		while (s.length < 4) {
			s = '0' + s;
		}
		return s;
	}

	static hexAddr8(n: number) {
		let s = n.toString(16)
		while (s.length < 8) {
			s = '0' + s;
		}
		return "0x" + s;
	}

	static byteNor(num: number, bitLength: number = 8): number {
		let binary = num.toString(2).padStart(bitLength, '0')
		let invertedBinary = binary.split('').map(bit => bit === '0' ? 1 : 0).join('');
		return parseInt(invertedBinary, 2);
	}


	static crc32(buf: number[]) {
		let crc32_table = 0;
		let crcval = 0xffffffff;
		let bit = 0;
		let length = buf.length;
		while (length--) {
			crc32_table = (crcval ^ buf.shift()) & 0xff;
			for (bit = 0; bit < 8; bit++) {
				if (crc32_table & 1) {
					crc32_table = ((crc32_table >>> 1) & 0x7FFFFFFF) ^ 0xEDB88320;
				} else {
					crc32_table = ((crc32_table >>> 1) & 0x7FFFFFFF);
				}
			}
			crcval = ((crcval >>> 8) & 0x00FFFFFF) ^ crc32_table;
		}
		return crcval > 0 ? crcval : parseInt(('1' + crcval.toString(2).replace('-', '').padStart(31, '0'))
			.split('').map((i, j) => j === 0 ? '1' : i === '0' ? '1' : '0').join(''), 2) + 1;
	}

	static logBuffer(buffer: Uint8Array): string {
		const ss: string[] = []
		let a: string[] = []
		let j = 0
		let s = ''

		let k = 0
		buffer.forEach(i => {
			k += 1
			if (j <= 3) {
				s += ByteUtil.oct2Hex(i, 2, '') + ' '
				if (k === buffer.length) {
					a.push(s)
				}
			} else {
				a.push(s)
				j = 0
				s = ByteUtil.oct2Hex(i, 2, '') + ' '
			}
			j++
		})
		ss.push(a.join(' '))
		return ss.join('')
	}

	static hexSplit(s: string, len = 2): string[] {
		const result: string[] = []
		const hexStr = s.replace('0x', '');
		for (let i = 0; i < hexStr.length; i += len) {
			result.push(hexStr.charAt(i + 1) ? hexStr.charAt(i) + hexStr.charAt(i + 1) : hexStr.charAt(i))
		}
		return result
	}

	static numToHighLow(
		num: number[] | number,
		length: number = 2,
		offset: number = 8,
		dir: "HighToLow" | "LowToHigh" = "LowToHigh"
	): number[] {
		let result: number[] = [];
		const d = (number: number) => {
			const result: number[] = []
			for (let i = 0; i < length; i++) {
				const offsetHex = Math.pow(2, offset * (i + 1)) - 1;
				result.push((number & offsetHex) >> i * 8)
			}
			if (dir === "HighToLow") return result.reverse()
			if (dir === 'LowToHigh') return result
		}
		if (typeof num === 'number') {
			result = result.concat(d(num))
		}

		if (num instanceof Array) {
			result = result.concat(num.map(n => d(n)).flat())
		}

		return result
	}

	static byteToNum(bytes: number[], dir: "HighToLow" | "LowToHigh" = "HighToLow") {
		const b = dir === "HighToLow" ? bytes : bytes.reverse();
		return b.reduce((previousValue, currentValue, currentIndex) =>
				previousValue | (currentValue << (((b.length - 1) - currentIndex) * 8))
			, 0)
	}

	static byteToAscii(bytes: number[]): string {
		return bytes
			.filter(i => i !== 0)
			.map(i => String.fromCharCode(i))
			.join('')
	}

	static splitArray<T>(arr: Array<T>, size: number): Array<T[]> {
		const result = [];
		for (let i = 0; i < arr.length; i += size) {
			result.push(arr.slice(i, i + size));
		}
		return result;
	}

	static slipPartsToFourBytes(seq: any, dip: any, rp: any, pkt_type: any, pkt_len: any) {
		let ints = [0, 0, 0, 0];
		ints[0] = seq | (((seq + 1) % 8) << 3) | (dip << 6) | (rp << 7);
		ints[1] = pkt_type | ((pkt_len & 0x000F) << 4);
		ints[2] = (pkt_len & 0x0FF0) >> 4;
		ints[3] = (~(ints[0] + ints[1] + ints[2]) + 1) & 0xFF;

		return new Uint8Array(ints);
	}

	static calcCrc16(binaryData: Uint8Array, crc = 0xffff) {
		for (let b of binaryData) {
			crc = ((crc >> 8) & 0x00FF) | ((crc << 8) & 0xFF00);
			crc ^= b;
			crc ^= (crc & 0x00FF) >> 4;
			crc ^= (crc << 8) << 4;
			crc ^= ((crc & 0x00FF) << 4) << 1;
		}
		return crc & 0xFFFF;
	}

	static slipEncodeEscChars(dataIn: Uint8Array, len: number) {
		let result = [];

		for (let i = 0; i < len; i++) {
			let byte = dataIn[i];
			if (byte === 0xC0) {
				result.push(0xDB, 0xDC);
			} else if (byte === 0xDB) {
				result.push(0xDB, 0xDD);
			} else {
				result.push(byte);
			}
		}

		return new Uint8Array(result);
	}
	static numberToArray(num: number): number[] {
		const byteArray: number[] = [];

		// 从最高字节到最低字节提取字节
		for (let i = 3; i >= 0; i--) {
		  // 提取每个字节并添加到数组
		  byteArray.push((num >> (8 * i)) & 0xFF);
		}
	  
		return byteArray;
	}
}
