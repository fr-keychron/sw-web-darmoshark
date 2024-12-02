const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { execSync } = require('child_process');

// 定义 API 地址
const apiHosts = {
	"us": 'https://launcher.keychron.com/',
	'cn': 'https://launcher.keychron.cn/',
	'local': 'https://192.168.31.92:23333/'
};

// 解析命令行参数
const argv = yargs
	.option('api', {
		alias: 'a',
		description: 'Set the API environment (us, cn, local)',
		type: 'string',
		default: 'local',
	})
	.option('env', {
		alias: 'e',
		description: 'Set the environment (PROD, DEV)',
		type: 'string',
		default: 'DEV',
	})
	.argv;

// 获取 API 地址
const apiEnv = argv.api;
const apiUrl = apiHosts[apiEnv] || apiHosts.local;  // 默认使用 'local'

// 创建 version.json 文件
const versionData = {
	api: apiEnv,
	env: argv.env,
	apiHost: apiUrl,
};

// 将 version.json 写入 src/app/version.json
const versionFilePath = path.resolve(__dirname, 'src/app/version.json');
fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

// 启动 Angular 应用
execSync('ng build', { stdio: 'inherit' });
