import {BaseBootLoader, KeyboardDevice} from "../index";

export class BootloaderFactory {
	static rules: Array<{ rule: (s: string) => boolean, instance: (hid: any, keyboard: KeyboardDevice) => BaseBootLoader }> = []

	static inject(rule: (s: string) => boolean, instance: any) {
		BootloaderFactory.rules.push({rule, instance})
	}

	get(name: string, hid: any, keyboard: KeyboardDevice): BaseBootLoader {
		const r = BootloaderFactory.rules.find(i => i.rule(name))
		if (r) {
			return r.instance(hid, keyboard);
		}
		return null
	}
}

export const bootloaderFactory = new BootloaderFactory()
