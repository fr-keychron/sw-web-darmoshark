import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { filter } from 'rxjs/operators';
import { MsgService } from "src/app/service/msg/msg.service";
import { TranslateService } from "@ngx-translate/core";
import { EEventEnum, HidDeviceEventType, IMouseJson, MouseDevice } from "../../../common/hid-collection";
import { DeviceConnectService } from "../../../service/device-conncet/device-connect.service";


@Component({
    selector: "mouse-dpi",
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
    constructor(
        private readonly service: DeviceConnectService,
        private readonly msgService: MsgService,
        private readonly i18n: TranslateService,
    ) {}

    public jsonConf: IMouseJson;
    public hidDevices: Array<MouseDevice> = [];
    public currentHidDevice?: MouseDevice;
    public dpiValues: number[][] = [[0, 0]];
    public oldLevelVal: number[][] = [[0, 0]]
    public dpiGears: number = 5;
    public dpiColors = ['#ff3643', '#003cb8', '#00f78c', '#8726f1', '#fe7f3e', '#e218ff'];
    public currentProfile = 0;
    public scaleArr = Array(10);
    public dpiLevel = 0; // 当前DPI层级
    public minDpi = 100; // 刻度尺最小DPI
    public maxDpi = 30000; // 刻度尺最大DPI
    public reportRateVal = 0; // 当前回报率
    public reportRateMax = 3; // 最大回报率数量
    public nxySetting = false; 
    public isXYSetting = false;
    public isGear = false;
    public reportRate = [
        { value: 125, color: '#ff3643' },
        { value: 500, color: '#003cb8' },
        { value: 1000, color: '#00f78c' },
        { value: 2000, color: '#8726f1' },
        { value: 4000, color: '#fe7f3e' },
        { value: 8000, color: '#fff' },
    ];

    ngOnInit() {
    }

    private deviceSub: Subscription;
    private updateSub: Subscription;

    ngOnDestroy() {
        if (this.deviceSub) this.deviceSub.unsubscribe();
        if (this.updateSub) this.updateSub.unsubscribe();
    }

    public load($e: number) {
        if (this.deviceSub) this.deviceSub.unsubscribe();
        this.init();
    }

    /**连接初始化 */
    private init() {
        this.currentHidDevice = this.service.getCurrentHidDevice() as MouseDevice;

        const getHidConf = (h: MouseDevice) => {
        const { version, json, baseInfo: {
            gears,
            dpiConf,
            workMode,
            usb, rf, bt,
            profile,
            reportRateMax
        }} = h;
        console.log(h);
        
        const drValue = [usb, rf, bt];
        const value = drValue[workMode];
        this.isXYSetting = version === 'dms' ? true : false;
        this.isGear = version != "M"
        this.jsonConf = json; // 鼠标json信息（鼠标名、键位标识。。）
        this.reportRateVal = value?.reportRate;
        this.dpiLevel = value.dpi;
        this.currentProfile = profile;
        this.oldLevelVal = JSON.parse(JSON.stringify(json.dpi.level)).map((level: number) => [level, level]);
        const convertedLevelVal = dpiConf.levelVal.reduce((acc, value, index, array) => {
            if (index % 2 === 0) {
                acc.push([array[index], array[index + 1]]);
            }
            return acc;
        }, []);
        this.dpiValues = convertedLevelVal.slice(0, gears)
        this.dpiGears = gears || json.dpi.level.length;
        if (json?.dpi) {
            const { dpi } = json;
            this.minDpi = dpi.limit[0] || 100;
            this.maxDpi = dpi.limit[1] || 26000;

            if (dpi.colors) {
                this.dpiColors = dpi.colors;
            }

            if (Object.keys(dpi.reportRate).length > 0) {
            this.reportRate = dpi.reportRate.slice(0, reportRateMax)
                .filter(r => r.type ? r.type.includes(workMode) : true)
                .map(r => ({
                ...r,
                color: Array.isArray(r.color) ? 'linear-gradient(' + r.color + ')' : r.color
                }));
            }
        }
        }

        const sub = this.currentHidDevice?.getBaseInfo().subscribe(v => {
            if (this.currentHidDevice.loaded) {
                getHidConf(this.currentHidDevice);
            } else {
                this.currentHidDevice.event$
                .pipe(
                    filter(v => v.type === HidDeviceEventType.Complete)
                )
                .subscribe(r => {
                    getHidConf(this.currentHidDevice);
                });
            }
            sub.unsubscribe();
        });
    }

    // 切换dpi层数的回调
    public changeLevel(level: number) {
        this.dpiLevel = level;
    }

    public changeScaleX() {
        if (!this.isXYSetting || this.currentHidDevice?.loaded) return;
        console.log('changeScaleX');
        this.dpiValues[this.dpiLevel][1] = this.dpiValues[this.dpiLevel][0];
    }

    // 设置DPI
    public setDpi() {
        this.currentHidDevice.setDpi({
            current: Math.min(this.dpiLevel, this.dpiGears - 1),
            level: null,
            gears: this.dpiGears,
            values: this.dpiValues,
        }).subscribe(() => {
            this.msgService.success(this.i18n.instant('notify.success'));
            this.init();
        });
    }

    public levelCount() {
        this.dpiLevel = Math.min(this.dpiLevel, this.dpiGears - 1)
        if (this.dpiGears > this.dpiValues.length) {
            const additionalValues = this.dpiGears - this.dpiValues.length;
            this.dpiValues = [
                ...this.dpiValues,
                ...Array.from({ length: additionalValues }, (_, index) => {
                    return this.oldLevelVal[this.dpiValues.length + index] || undefined;
                })
            ];
        }else {
            this.dpiValues = this.dpiValues.slice(0, this.dpiGears);
        }
    }

    // 设置回报率
    public setReportRate(i: number) {
        return this.currentHidDevice.setReportRate({level: i,values: this.reportRate.map(i => i.value)})
        .subscribe(() => {
            this.currentHidDevice.setExtConf({
                lod: this.currentHidDevice.baseInfo.sys.lod,
                wave: this.currentHidDevice.baseInfo.sys.wave ? 1 : 2,
                line: this.currentHidDevice.baseInfo.sys.line ? 1 : 2,
                motion: this.currentHidDevice.baseInfo.sys.motion ? 1 : 2,
                scroll: this.currentHidDevice.baseInfo.sys.scroll === 0 ? 1 : 2,
                eSports: i > 3 ? 2 : 1
            }).subscribe(() => {
                const m = this.i18n.instant('notify.success');
                this.msgService.success(m);
                this.init();
            })
        });
    }

    // 恢复出厂设置
    public reset() {
        const device = this.service.getCurrentHidDevice() as MouseDevice;
        this.currentHidDevice.setDpi({
            current: 1,
            level: null,
            gears: 5,
            values: this.oldLevelVal,
        }).subscribe(() => {
    device.getBaseInfo().subscribe(() => {
        this.init();
        this.msgService.success(this.i18n.instant('notify.success'));
    });
        });
    }

    public validateDpiValue($event: { target: HTMLInputElement; }, index: number) {
        const inputElement = $event.target as HTMLInputElement;
        if (this.dpiValues[this.dpiLevel][index] < this.minDpi) {
        this.dpiValues[this.dpiLevel][index] = this.minDpi;
        inputElement.value =  this.minDpi.toString();
        } else if (this.dpiValues[this.dpiLevel][index] > this.maxDpi) {
        this.dpiValues[this.dpiLevel][index] = this.maxDpi;
        inputElement.value =  this.maxDpi.toString();
        } else {
        this.dpiValues[this.dpiLevel][index] = Number(inputElement.value);
        }
    }

    public validateDpiInput(event: KeyboardEvent): void {
        const allowedKeys = [
            'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', // 常用功能键
        ]
        const isNumber = /^[0-9]$/.test(event.key)
        if (!isNumber && !allowedKeys.includes(event.key)) {
            event.preventDefault()
        }
    }
}
