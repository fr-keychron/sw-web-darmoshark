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
		{label: '繁體中文', value: 'zh-HK', includes: ['zh-HK', 'zh-TW']}, // 繁体中文
		{label: '한국어', value: 'ko-KR', includes: ['ko-KR']},
		{label: '日本語', value: 'ja-JP', includes: ['ja-JP']},
		{label: 'Русский', value: 'ru-RU', includes: ['ru-RU']},
		{label: 'Italiano', value: 'it-IT', includes: ['it-IT']},
		{label: 'Polski', value: 'pl-PL', includes: ['pl-PL']},
		{label: 'Français', value: 'fr-FR', includes: ['fr-FR']}, // 法文
		{label: 'Español', value: 'es-ES', includes: ['es-ES']}, // 西班牙文
		{label: 'Tiếng Việt', value: 'vi-VN', includes: ['vi-VN']}, // 越南语
		{label: 'עברית', value: 'he-IL', includes: ['he-IL']}, // 希伯来语
		{label: 'lietuvių', value: 'lt-LT', includes: ['lt-LT']}, // 立陶宛语
		{label: 'ภาษาไทย', value: 'th-TH', includes: ['th-TH']}, // 泰语
		{label: 'Português', value: 'pt-PT', includes: ['pt-PT']}, // 葡萄牙语
		{label: 'Українська', value: 'uk-UA', includes: ['uk-UA']}, // 乌克兰语
		{label: 'عربي', value: 'ar-SA', includes: ['ar-SA']}, // 阿拉伯语
		{label: 'Deutsch', value: 'de-DE', includes: ['de-DE']}, // 德语
	],
	lang: "zh-CN",
	KeyboardJsonVersion: "1.0.0"
}

export const setConfVal = (k: string, v: any) => {
	if (k in GLOBAL_CONFIG) {
		GLOBAL_CONFIG[k] = v
	}
}
