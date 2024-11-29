const {writeFileSync, copyFileSync, readFileSync} = require('fs');

const statistic = {
	"*.keychron.com": "8e5a4d6f-7df1-4580-8ba2-5af8c4ee5828",
	"*.lemokey.com": "34bc625a-9404-4f0f-8ffb-7a2a4a12a9cf",
	"*.ikeyboard.net": "5942855f-f447-4852-9fc4-8e3410a8e466",
	"*.jamesdonkey.com.cn": "a0788652-a882-4da0-bbbb-cb78c760085d",
	"*.keychron.cn": "1340fe9b-5621-4d04-967d-4f63fe647904",
	"*.lemokey.cn": "76c10be5-da14-4699-86fc-6effb84e02d8",
	"*.skn.net.cn": "e032b08f-bf37-41fc-bca1-082a9b67a2c6"
}

const siteConf = {
	"dev": {
		"title": "Launcher",
		"logo": "skn.png",
		"ico": "favicon-skn.ico",
		"showLogo": false,
		"i18n": "skn",
		"growthbook": {
			"enable": false,
			"host": "https://feature.keychron.cn/feat/",
			"key": "sdk-WESjHoIhf8M7y"
		},
		'feat': {
			"mouse_home":true,
			"mouse_setKey":true,
			"mouse_pointer":true,
			"mouse_setMacro":true,
			"mouse_setLight":true,
			"mouse_ability":true,
			"mouse_setSys":true
		}
	},
	"keychron": {
		"title": "Launcher",
		"logo": "keychron.png",
		"ico": "favicon-k.ico",
		"i18n": "keychron",
		"showLogo": false,
		"growthbook": {
			"enable": true,
			"host": "https://feature.keychron.cn/feat/",
			"key": "sdk-oJgjBYOoSrvWy0Vx"
		},
		'feat': {
			"bridge_firmware": false ,
			"keyboard_fr_firmware": false ,
			"keyboard_bluetooth_firmware": false ,
			"issue": true ,
			"keyboard_firmware": true ,
			"keyboard_he": true ,
			"keyboard_light": true ,
			"keyboard_macro": true ,
			"keyboard_map": true ,
			"keyboard_test": true ,
			"mouse_dpi": true ,
			"mouse_firmware": true ,
			"mouse_fr_firmware": true ,
			"mouse_key": true ,
			"mouse_light": true ,
			"mouse_macro": true ,
			"mouse_sys": true ,
			"same_firmware_upgrade": true
		}
	},
	"lemokey": {
		"title": "Launcher",
		"logo": "lemokey.png",
		"ico": "favicon-l.ico",
		"showLogo": true,
		"i18n": "lemokey",
		"growthbook": {
			"enable": true,
			"host": "https://feature.keychron.cn/feat",
			"key": "sdk-jyJIKIG0acAyiag"
		},
		'feat': {
			"bridge_firmware": false ,
			"keyboard_fr_firmware": false ,
			"keyboard_bluetooth_firmware": false ,
			"issue": true ,
			"keyboard_firmware": true ,
			"keyboard_he": true ,
			"keyboard_light": true ,
			"keyboard_macro": true ,
			"keyboard_map": true ,
			"keyboard_test": true ,
			"mouse_dpi": true ,
			"mouse_firmware": true ,
			"mouse_fr_firmware": true ,
			"mouse_key": true ,
			"mouse_light": true ,
			"mouse_macro": true ,
			"mouse_sys": true ,
			"same_firmware_upgrade": true
		}
	},
	"skn": {
		"title": "Launcher",
		"logo": "skn.png",
		"ico": "favicon-skn.ico",
		"showLogo": true,
		"i18n": "skn",
		"growthbook": {
			"enable": true,
			"host": "https://feature.keychron.cn/feat/",
			"key": "sdk-WESjHoIhf8M7y"
		},
		'feat': {
			"bridge_firmware": true ,
			"keyboard_fr_firmware": true ,
			"keyboard_bluetooth_firmware": true ,
			"issue": true ,
			"keyboard_firmware": true ,
			"keyboard_he": true ,
			"keyboard_light": true ,
			"keyboard_macro": true ,
			"keyboard_map": true ,
			"keyboard_test": true ,
			"mouse_dpi": true ,
			"mouse_firmware": true ,
			"mouse_fr_firmware": true ,
			"mouse_key": true ,
			"mouse_light": true ,
			"mouse_macro": true ,
			"mouse_sys": true ,
			"same_firmware_upgrade": true
		}
	},
	"wukong": {
		"title": "京东京造 x《黑神话：悟空》联名键盘《墨染乾坤》",
		"logo": "wukong.png",
		"ico": "favicon-wukong.ico",
		"showLogo": true,
		"i18n": "skn",
		"growthbook": {
			"enable": false,
			"host": "https://feature.keychron.cn/feat/",
			"key": "sdk-WESjHoIhf8M7y"
		},
		'feat': {
			"bridge_firmware": false ,
			"keyboard_fr_firmware": false ,
			"keyboard_bluetooth_firmware": false ,
			"issue": true ,
			"keyboard_firmware": true ,
			"keyboard_he": true ,
			"keyboard_light": true ,
			"keyboard_macro": true ,
			"keyboard_map": true ,
			"keyboard_test": true ,
			"mouse_dpi": true ,
			"mouse_firmware": true ,
			"mouse_fr_firmware": true ,
			"mouse_key": true ,
			"mouse_light": true ,
			"mouse_macro": true ,
			"mouse_sys": true ,
			"same_firmware_upgrade": true
		}
	},
	"antgamer": {
		"title": "Launcher",
		"logo": "antgamer.png",
		"ico": "favicon-antgamer.ico",
		"showLogo": true,
		"i18n": "antgamer",
		"growthbook": {
			"enable": true,
			"host": "https://feature.keychron.cn/feat",
			"key": "sdk-jyJIKIG0acAyiag"
		},
		'feat': {
			"bridge_firmware": false ,
			"keyboard_fr_firmware": false ,
			"keyboard_bluetooth_firmware": false ,
			"issue": true ,
			"keyboard_firmware": true ,
			"keyboard_he": true ,
			"keyboard_light": true ,
			"keyboard_macro": true ,
			"keyboard_map": true ,
			"keyboard_test": true ,
			"mouse_dpi": true ,
			"mouse_firmware": true ,
			"mouse_fr_firmware": true ,
			"mouse_key": true ,
			"mouse_light": true ,
			"mouse_macro": true ,
			"mouse_sys": true ,
			"same_firmware_upgrade": true
		}
	},
	"donkey": {
		"title": "Launcher",
		"logo": "donkey.png",
		"ico": "favicon-donkey.ico",
		"showLogo": true,
		"i18n": "donkey",
		"growthbook": {
			"enable": true,
			"host": "https://feature.keychron.cn/feat/",
			"key": "sdk-yzu2mCJGPiYMW5u"
		},
		'feat': {
			"bridge_firmware": false ,
			"keyboard_fr_firmware": false ,
			"keyboard_bluetooth_firmware": false ,
			"issue": true ,
			"keyboard_firmware": true ,
			"keyboard_he": true ,
			"keyboard_light": true ,
			"keyboard_macro": true ,
			"keyboard_map": true ,
			"keyboard_test": true ,
			"mouse_dpi": true ,
			"mouse_firmware": true ,
			"mouse_fr_firmware": true ,
			"mouse_key": true ,
			"mouse_light": true ,
			"mouse_macro": true ,
			"mouse_sys": true ,
			"same_firmware_upgrade": true
		}
	},
	'icp': {
		"keychron": {
			"no": "粤ICP备2021099938号",
			"copyRight": "Copyright © 2024. 渴创技术（深圳）有限公司 All Rights Reserved. "
		},
		"skn": {
			"no": "粤ICP备2021099938号-2",
			"copyRight": "Copyright © 2024. 渴创技术（深圳）有限公司 All Rights Reserved. "
		},
		"donkey": {
			"no": "粤ICP备2021099938号-3",
			"copyRight": "Copyright © 2024. 渴创技术（深圳）有限公司 All Rights Reserved. "
		},
		"wukong": {
			"no": "粤ICP备2021099938号-3",
			"copyRight": "Copyright © 2024. 渴创技术（深圳）有限公司 All Rights Reserved. "
		},
		"ant": {
			"no": "粤ICP备2021099938号-2",
			"copyRight": "Copyright © 2024. 渴创技术（深圳）有限公司 All Rights Reserved. "
		},
	},
	"icpHost": {
		"wukong.jd.com": {
			"no": "京ICP备11041704号",
			"copyRight": "Copyright © 2024. 北京京东世纪信息技术有限公司 All Rights Reserved. "
		}
	}
}
let env = "DEV"
let site = 'keychron'
let api = 'us'
let icpConf = '';
let track = '';
process.argv.forEach(k => {
	if (k.includes('--env')) {
		const siteResult = /--env=(.*)/gi.exec(k)
		if (siteResult && siteResult.length) {
			env = siteResult[1]
		}
	}

	if (k.includes('--site')) {
		const siteResult = /--site=(.*)/gi.exec(k)
		if (siteResult && siteResult.length) {
			site = siteResult[1]
		}
	}
	if (k.includes('--api')) {
		const siteResult = /--api=(.*)/gi.exec(k)
		if (siteResult && siteResult.length) {
			api = siteResult[1]
		}
	}

	if (k.includes('--icp')) {
		const siteResult = /--icp=(.*)/gi.exec(k)
		if (siteResult && siteResult.length) {
			icpConf = siteResult[1]
		}
	}

	if (k.includes('--t')) {
		const siteResult = /--t=(.*)/gi.exec(k)
		if (siteResult && siteResult.length) {
			track = siteResult[1]
		}
	}
})


const siteC = siteConf[site];
const s = 'https://statistic.keychron.com/script.js'
let script = ''
if (track) {
	script = `<script defer src="${s}" data-website-id="${statistic[track]}"></script>`
}
const writeTemplate = () => {
	let template = readFileSync('./index.temp.html', 'utf-8');
	Object.keys(siteC).forEach(k => {
		template = template.replaceAll(`{{${k}}}`, siteC[k])
	})
	template = template.replaceAll('{{siteStatistic}}', script)
	writeFileSync('./src/index.html', template, 'utf-8')
}

const moveIconFile = () => {
	copyFileSync(`./src/${siteC.ico}`, './src/favicon.ico')
	copyFileSync(`./src/assets/logo/${siteC.logo}`, './src/assets//logo.png')
}
writeTemplate()
if (siteC.showLogo) {
	moveIconFile()
}

let icp = '';
if (icpConf) {
	icp = siteConf.icp[icpConf]
}
const obj = {
	// "git": {shortHash: commit.shortHash, branch: 'dev'},
	env,
	icp,
	icpHost: siteConf.icpHost,
	api,
	siteConf: siteConf[site]
}
console.log(obj)
writeFileSync('./src/app/version.json', JSON.stringify(obj), 'utf-8')
