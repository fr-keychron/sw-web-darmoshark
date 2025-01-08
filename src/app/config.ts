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
	KeyboardJsonVersion: "1.0.0"
}

export const setConfVal = (k: string, v: any) => {
	if (k in GLOBAL_CONFIG) {
		GLOBAL_CONFIG[k] = v
	}
}
