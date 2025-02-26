const host = 'https://launcher.keychron.com/';
// const host = 'http://localhost:4001/'
export const GLOBAL_CONFIG: any = {
	API: host + "api/",
	STATIC: host + "api/",
	version: '1.6.3-beta',
	websocket: 'ws://localhost:23333',
	KeyboardLayout: {
		width: 46,
		height: 48,
		gap: 5
	},
	langs: [
		{label: 'English', value: 'en-US', includes: ['en-US', 'en']},
		{label: '简体中文', value: 'zh-CN', includes: ['zh-CN']},
		{label: '한국어', value: 'ko-KR', includes: ['ko-KR']},
		{label: '日本語', value: 'ja-JP', includes: ['ja-JP']},
	],

	lang: "zh-CN",
	KeyboardJsonVersion: "1.0.0",
	deviceFilters: [
		{ vendorId: 0x1915, productId: 0x0733 }, //M2
		{ vendorId: 0x1915, productId: 0x073f }, //M2 PRO
		{ vendorId: 0x1915, productId: 0x072d }, //M3 PRO
		{ vendorId: 0x1915, productId: 0x0722 }, //M3S Pro
		{ vendorId: 0x1915, productId: 0x073d }, //M5 PRO
		{ vendorId: 0x1915, productId: 0x073e }, //M3 MICCRO PRO
		{ vendorId: 0x1915, productId: 0x0740 }, //M3S MAX
		{ vendorId: 0x1915, productId: 0x073a }, //M3 Pro Max
		{ vendorId: 0x1915, productId: 0x0744 }, //M7
		{ vendorId: 0x1915, productId: 0x0745 }, //M7 MAX
		{ vendorId: 0x1915, productId: 0x0735 }, //N5
		{ vendorId: 0x248a, productId: 0xff12 }, //M3
		{ vendorId: 0x0bda, productId: 0xfff0 }, //N3 PRO
		{ vendorId: 0x0bda, productId: 0xffd5 }, //M3 8K
		{ vendorId: 0x248a, productId: 0xff18 }, //M3S
		{ vendorId: 0x248a, productId: 0xff10 }, //N3
		{ vendorId: 0x1915, productId: 0x0723 }, //接收器1k
		{ vendorId: 0x1915, productId: 0x0725 }, //接收器 4k
		{ vendorId: 0x1915, productId: 0x0734 }, //接收器 8k
		{ vendorId: 0x248a, productId: 0xff30 }, //接收器 telink
		{ vendorId: 0x0bda, productId: 0xffe0 }, //接收器 realtek
	]
}

export const setConfVal = (k: string, v: any) => {
	if (k in GLOBAL_CONFIG) {
		GLOBAL_CONFIG[k] = v
	}
}
