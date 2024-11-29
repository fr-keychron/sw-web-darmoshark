import {BaseBootLoader, BootloaderFactory} from ".";
import {IBootLoaderEvent, IBootLoaderEventType} from "./types";
import {Subject} from "rxjs";
import {ByteUtil} from "src/app/utils";
import {KeyboardDevice} from "../index";

declare const dfu: any
declare const dfuse: any

export class Stm32 extends BaseBootLoader {
	private webdfu: any

	constructor(hid: any, k: KeyboardDevice) {
		super(hid,k);
		this.init()
	}

	public override event$: Subject<IBootLoaderEvent> = new Subject<IBootLoaderEvent>();

	private async init() {
		const inter = dfu.findDeviceDfuInterfaces(this.hid);
		await this.fixInterfaceNames(this.hid, inter)
		this.webdfu = await this.connect(new dfu.Device(this.hid, inter[0]))
	}

	public override flash(f: File) {
		if (!this.webdfu) return
		const {TransferSize, ManifestationTolerant} = this.webdfu.properties
		const fr = new FileReader()
		fr.onload = async (e) => {
			let status = await this.webdfu.getStatus();
			if (status.state == dfu.dfuERROR) {
				await this.webdfu.clearStatus();
			}
			// this.waiting = true
			this.event$.next({type: IBootLoaderEventType.Flashing, data: 0})
			this.webdfu.do_download(TransferSize, fr.result as ArrayBuffer, ManifestationTolerant)
				.then(() => {
					this.event$.next({type: IBootLoaderEventType.Complete, data: null})
				})
			this.webdfu.logProgress = (d: any, t: any) => {
				const data = Number(d / t * 100).toFixed(2) + '%'
				this.event$.next({type: IBootLoaderEventType.Flashing, data})
			}
		}
		fr.readAsArrayBuffer(f)
	}

	private async connect(device: any) {
		try {
			await device.open();
		} catch (error) {
			throw error;
		}

		let desc: any = {};
		try {
			desc = await this.getDFUDescriptorProperties(device);
		} catch (error) {
			throw error;
		}

		let memorySummary = "";
		if (desc && Object.keys(desc).length > 0) {
			device.properties = desc;
			if (desc.DFUVersion == 0x011a && device.settings.alternate.interfaceProtocol == 0x02) {
				device = new dfuse.Device(device.device_, device.settings);
				if (device.memoryInfo) {
					let totalSize = 0;
					for (let segment of device.memoryInfo.segments) {
						totalSize += segment.end - segment.start;
					}
					memorySummary = `Selected memory region: ${device.memoryInfo.name} (${ByteUtil.niceSize(totalSize)})`;
					for (let segment of device.memoryInfo.segments) {
						let properties = [];
						if (segment.readable) {
							properties.push("readable");
						}
						if (segment.erasable) {
							properties.push("erasable");
						}
						if (segment.writable) {
							properties.push("writable");
						}
						let propertySummary = properties.join(", ");
						if (!propertySummary) {
							propertySummary = "inaccessible";
						}

						memorySummary += `\n${ByteUtil.hexAddr8(segment.start)}-${ByteUtil.hexAddr8(segment.end - 1)} (${propertySummary})`;
					}
				}
			}
		}
		device.properties = desc
		return device;
	}

	private getDFUDescriptorProperties(device: any) {
		return device.readConfigurationDescriptor(0).then(
			(data: any) => {
				let configDesc = dfu.parseConfigurationDescriptor(data);
				let funcDesc = null;
				let configValue = device.settings.configuration.configurationValue;
				if (configDesc.bConfigurationValue == configValue) {
					for (let desc of configDesc.descriptors) {
						if (desc.bDescriptorType == 0x21 && desc.hasOwnProperty("bcdDFUVersion")) {
							funcDesc = desc;
							break;
						}
					}
				}

				if (funcDesc) {
					return {
						WillDetach: ((funcDesc.bmAttributes & 0x08) != 0),
						ManifestationTolerant: ((funcDesc.bmAttributes & 0x04) != 0),
						CanUpload: ((funcDesc.bmAttributes & 0x02) != 0),
						CanDnload: ((funcDesc.bmAttributes & 0x01) != 0),
						TransferSize: funcDesc.wTransferSize,
						DetachTimeOut: funcDesc.wDetachTimeOut,
						DFUVersion: funcDesc.bcdDFUVersion
					};
				} else {
					return {};
				}
			},
			(error: any) => {
			}
		);
	}

	private async fixInterfaceNames(device_: any, interfaces: any) {
		if (interfaces.some((intf: any) => (intf.name == null))) {
			let tempDevice = new dfu.Device(device_, interfaces[0]);
			await tempDevice.device_.open();
			await tempDevice.device_.selectConfiguration(1);
			let mapping = await tempDevice.readInterfaceNames();
			await tempDevice.close();

			for (let intf of interfaces) {
				if (intf.name === null) {
					let configIndex = intf.configuration.configurationValue;
					let intfNumber = intf["interface"].interfaceNumber;
					let alt = intf.alternate.alternateSetting;
					intf.name = mapping[configIndex][intfNumber][alt];
				}
			}
		}
	}

	public override close() {
		this.webdfu.close()
	}
}

BootloaderFactory.inject(
	(s: string) => s.includes('STM'),
	(hid: any, keyboard: KeyboardDevice) => new Stm32(hid, keyboard)
)
