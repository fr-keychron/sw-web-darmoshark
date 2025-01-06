import { Component, OnInit, ViewChild, ElementRef } from "@angular/core"
import { MsgService } from "src/app/service/msg/msg.service"
import { TranslateService } from "@ngx-translate/core"
import { fromEvent, map, merge, Subscription } from "rxjs";
import {
  EKey,
  EDmsMouseKeycodeDefault,
  EDmsMouseKeycode,
  MacroList,
  RecordList,
  MouseDevice,
  EMdsMouseBtnGameMouse,
  EDmsMacroLoop
} from 'src/app/common/hid-collection/hid-device/mouse-device'
import keyJson from 'src/assets/json/mouse.json';
import {DeviceConnectService} from "../../../service/device-conncet/device-connect.service";

const unit = ' ms'

@Component({
  selector: "mouse-macro-index",
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class Macro implements OnInit {
    constructor(
        private readonly msgService: MsgService,
        private readonly i18n: TranslateService,
        private readonly service: DeviceConnectService,
    ) {
        window.oncontextmenu = e => {
        if (this.recordFlag || this.recflag) e.preventDefault()
        }
    }
    private keyCodes: Array<any> = keyJson[0].keycodes.slice(2);

    public recordVisible: boolean
    public formatterPercent = (value: number): string => value + unit
    public parserPercent = (value: string): string => value.replace(unit, '')
    public MacroLoopList = EDmsMacroLoop
    public macroList: MacroList[] = [] // 宏列表
    public currentMacro: MacroList// 当前宏
    public currentRecord: RecordList // 当前宏记录
    public insertModal: boolean = false
    public activeItem:any
    public macroItem:any
    public macroMenu:boolean = false
    ngOnInit(): void {
        const device = this.service.getCurrentHidDevice() as MouseDevice
        const data = JSON.parse(localStorage.getItem('macroList'))
        if (data && data.length > 0) {
            this.macroList = data 
            this.currentMacro = this.macroList[0]
        } else {
            this.addMacroItem()
        } 
    }
    ngOnDestroy() {
        if (this.keyEvent$) this.keyEvent$.unsubscribe()
        if (this.mouseEvent$) this.mouseEvent$.unsubscribe()
        this.updateTime = 0
    }
    public onInsertModal(e:boolean){
        setTimeout(()=>{
            this.insertModal = e
        },100)
    }
    // 数值文本处理
    public getValueText(v: RecordList): string {
        const textPre: any = {
            mouse: this.i18n.instant('mouse.key_game.' + v.key.name),
            keyboard: v.key.name,
            delay: v.key.value || ''
        }
        const textAfter: any = {
            0: '↑',
            1: '↓',
            15: unit
        }
        return textPre[v.type] + textAfter[v.action]
    }
    // 长度限制提示
    public overLengthTip(): boolean{
        if(this.currentMacro && this.currentMacro.list.length>=200){
            this.currentMacro.list.length = 200
            this.msgService.warn(this.i18n.instant('notify.macroSizeLimit'))
            return true
        }
    }

    // 保存宏
    public save() {
        this.macroList = this.macroList?.map(m =>
        m.id === this.currentMacro.id ? this.currentMacro : m
        ) || []
        localStorage.setItem('macroList', JSON.stringify(this.macroList))
    }

    // 新增宏
    public addMacroItem() {
        const len = this.macroList.length
        const defaultItem: MacroList = {
            id: 'M' + Date.now(),
            name: len ? 'M' + (len + 1) : 'M1',
            delayNum: 200,
            delayMode: 'none',
            loopNum: 1,
            loopMode: 'loopTilRelease',
            list: []
        }
        this.macroList.push(defaultItem)
        this.selectMacro(defaultItem)
        this.save()
    }
    // 选择宏
    public selectMacro(v: MacroList): void {
        this.currentMacro = v
    }
    // 切换延迟
    public handleDelay(v: string): void {
        if (v === 'dynamic') {
            this.updateTime = 0
        }
        this.save()
    }
    // 切换循环
    public handleLoop(v: string): void {
        this.save()
    }
    // 复制宏
    public copyMarc() {
        const len = this.macroList.length
        const copyItem: MacroList = {
            id: 'M' + Date.now(),
            name: len ? 'M' + (len + 1) : 'M1',
            delayNum:  this.currentMacro.delayNum,
            delayMode:  this.currentMacro.delayMode,
            loopNum:  this.currentMacro.loopNum,
            loopMode:  this.currentMacro.loopMode,
            list:  this.currentMacro.list
        }
        this.macroList.push(copyItem)
        this.selectMacro(copyItem)
        this.save()
    }
    // 删除宏
    public delMarco() {
        this.macroList = this.macroList.filter(l => l.id !== this.currentMacro.id)
        this.save()
        if (!this.macroList.length) {
            this.addMacroItem()
        } else {
            this.currentMacro = this.macroList[0]
        }
    }
    // 操作项点击时更新列表
    moveItem(action: string) {
        const index = this.currentMacro.list.indexOf(this.currentRecord)
        if (index === -1) return

        let newIndex = index

        switch (action) {
        case 'top': 
            newIndex = 0
            break
        case 'up':
            if (index > 0) {
                newIndex = index - 1
            }
            break
        case 'down':
            if (index < this.currentMacro.list.length - 1) {
             newIndex = index + 1
            }
            break
        case 'bottom':
            newIndex = this.currentMacro.list.length - 1
            break
        }

        // 如果新的位置不一样，更新列表
        if (newIndex !== index) {
            const movedItem = this.currentMacro.list.splice(index, 1)[0];
            this.currentMacro.list.splice(newIndex, 0, movedItem);
        }
    }
    // 控制菜单的显示
    public toggleEventRemoveModal(item: any) {
        if (this.activeItem === item) {
            this.activeItem = null;
        } else {
            this.activeItem = item;
        }
    }
    // 控制宏菜单的显示
    public macroModal(item: any) {
        if (this.macroItem === item) {
            this.macroItem = null;
        } else {
            this.macroItem = item;
        }
    }
    // 录制操作
    public recordFlag: boolean = false // 录制状态
    public mouseEvent$: Subscription
    public keyEvent$: Subscription
    public handleRecord(): void {
        this.recordFlag = !this.recordFlag
        if (this.recordFlag) { // 开始录制
            this.updateTime = Date.now()
            this.watchMouseEvent()
            this.watchKeyboardEvent()
        } else { // 停止录制
            this.updateTime = 0
            this.mouseEvent$.unsubscribe()
            this.keyEvent$.unsubscribe()
            this.save()
        }
    }

    // 监听鼠标事件
    public updateTime: number = 0
    @ViewChild('macro') public macroRef: ElementRef;
    private watchMouseEvent(): void {
        const el = this.macroRef.nativeElement as HTMLDivElement
        const mouseDownMap = new Map<string, string>();
        this.mouseEvent$ = merge(
            fromEvent(el, 'mousedown'),
            fromEvent(el, 'mouseup')
        ).pipe(
        map((e: Event) => {
            if (this.updateTime === 0) this.updateTime = Date.now()
            e.stopPropagation()
            e.preventDefault()
            const mouseEvent = e as MouseEvent;
            let id = mouseDownMap.get(mouseEvent.button.toString());
            if (e.type === 'mousedown' && !id) {
                id = 'R' + Date.now(); 
                mouseDownMap.set(mouseEvent.button.toString(), id);
            } else if (e.type === 'mouseup' && id) {
                mouseDownMap.delete(mouseEvent.button.toString());
            }
            const action = e.type === 'mouseup' ? EKey.release : EKey.press
            const button = Reflect.get(e, 'button') as number
            const buttonKey = EMdsMouseBtnGameMouse.find(i => i.event === button)
            return {
                id, 
                action, 
                type: 'mouse', 
                key: {
                    name: buttonKey.key,
                    value: buttonKey.value
                }
            }
        })
        ).subscribe((res) => {
        this.addEvent(res)
        })
    }
    // 监听键盘事件
    private watchKeyboardEvent(): void {
        const keyDownMap = new Map<string, string>();
        this.keyEvent$ = merge(
            fromEvent(document.body, 'keydown'),
            fromEvent(document.body, 'keyup')
        ).pipe(
        map((e: any) => {
            const action = e.type === 'keyup' ? EKey.release : EKey.press
            const keyVal = EDmsMouseKeycodeDefault.find((value: any) => value.code === e.code); 
            if (!keyVal) return;

            let id = keyDownMap.get(e.code);
            if (e.type === 'keydown' && !id) {
            id = 'R' + Date.now();
                keyDownMap.set(e.code, id);
            } else if (e.type === 'keyup' && id) {
                keyDownMap.delete(e.code);
            }
            
            const keyName = this.keyCodes.find(i => i.code === keyVal.key)
            if (keyName && /<br\/>/.test(keyName.name)) {
                const a = keyName.name.split('<br/>')
                keyName.name = a[1]
            }
            return { id, action, type: 'keyboard', key: { name: keyName?.name || keyVal.key, value: keyVal.value } }
        })
        )
        .subscribe(res => {
            this.addEvent(res)
        })
    }
    // 事件新增
    private addEvent(res: RecordList): void {
        if(!res) return
        if(this.overLengthTip()){
            this.updateTime = 0
            this.recordFlag = false
            this.mouseEvent$?.unsubscribe()
            this.keyEvent$?.unsubscribe()
            this.save()
            return
        };
        if (this.currentMacro.list.length >= 1 && this.currentMacro.delayMode === 'dynamic') {
            const delay = Date.now() - this.updateTime
            const id = 'R' + Date.now()
            this.currentMacro.list.push({
                id,
                type: 'delay',
                action: EKey.delay,
                key: {
                    name: delay + unit,
                    value: delay
                }
            })
        }
      
        
        this.currentMacro.list.push(res)
        this.updateTime = Date.now()
        // 置底
        const el = this.macroRef.nativeElement
        el.scrollTo({top: el.scrollHeight})
    }
    // 删除事件
    public delEvent() {
        this.currentMacro.list = this.currentMacro.list
        .filter(l => l.id !== this.currentRecord.id)
        this.currentRecord = undefined
        this.save()
    }
    // 更新事件
    public setEvent() {
        switch (this.currentRecord.type) {
            case 'mouse':
                const activeMouse = this.macroMouses.find((e)=>{
                    return e.value === this.currentRecord.key.value
                })
                this.currentRecord={
                    ...this.currentRecord,
                    key:{
                        name: activeMouse.key, 
                        value: activeMouse.value
                    }
                }
                this.currentMacro.list = this.currentMacro.list.map(item => 
                    item.id === this.currentRecord.id  ?  {
                        ...item,
                        key:{
                            name: activeMouse.key, 
                            value: activeMouse.value
                        }} 
                        : item
                );
                break;
            case 'delay':
                const value = this.currentRecord.key.value
                 this.currentRecord={
                    ...this.currentRecord,
                    key:{
                        name: `${value || ''}ms`,
                        value: this.currentRecord.key.value
                    }
                }
                this.currentMacro.list = this.currentMacro.list.map(item => 
                    item.id === this.currentRecord.id ?  this.currentRecord : item
                );
            break;
        }
        this.save()
    }
    public currentRecordClick(event:any){
        this.currentRecord = event
    }
    // 插入
    public macroType: string = ''
    public macroMouses = EMdsMouseBtnGameMouse
    public insert(type:string) {
        if (this.enterEvent$) this.enterEvent$.unsubscribe();
        this.recflag = false;
        if(this.overLengthTip()){
            return
        };
        let newArr: RecordList[]

        switch (type) {
            case 'keyboard': 
            const commonItemKeyboard = {
                key: { name: 'A', value: 4 },
                id: "R" + Date.now(),
                type: type ,
            }
                newArr = [
                    { ...commonItemKeyboard, action: EKey.press },
                    { ...commonItemKeyboard, action: EKey.release },
                ]
                break;
            case 'mouse':
                const commonItemMouse = {
                    key: { name: 'left', value: 1 },
                    id: "R" + Date.now(),
                    type: type,
                }
                newArr = [
                    { ...commonItemMouse, action: EKey.press },
                    { ...commonItemMouse, action: EKey.release },
                ]
                break;
            case 'delay':
                newArr = [{ 
                    key: {
                        name: '200 ms',
                        value: 200
                    },
                    id: "R" + Date.now(),
                    type: type,
                    action: EKey.delay 
                }]
            break;
        }
        const index = this.currentMacro.list.findIndex(l => l.id === this.currentRecord.id)
        this.currentMacro.list.splice(index+1, 0, ...newArr)
        this.insertModal = false;
        this.save()
    }

    // 监听事件记录
    public recflag: boolean
    public enterEvent$: Subscription
    @ViewChild('enter') public enterRef: ElementRef;
    public recEvent(): void {
        this.recflag = !this.recflag
        if (this.recflag) {
            if (this.enterEvent$) this.enterEvent$.unsubscribe();
            if ( this.currentRecord.type === 'keyboard') {
                this.enterEvent$ = merge(
                    fromEvent(document.body, 'keydown'),
                    fromEvent(document.body, 'keyup')
                ).subscribe((e: any) => {
                    let key: { name: string, value: number }
                    const keyVal = EDmsMouseKeycodeDefault.find((value: any) => value.key === e.code)
                    const keyValue = Object.keys(EDmsMouseKeycode).find(
                        (k) => EDmsMouseKeycode[k as keyof typeof EDmsMouseKeycode] === keyVal.value
                    );
                    const keyName = this.keyCodes.find(i => i.code === keyValue)
                    key = { name: keyName.name, value: keyVal.value }
                    if (keyName && /<br\/>/.test(keyName.name)) {
                        const a = keyName.name.split('<br/>')
                        key = { name: a[1], value: keyVal.value }
                    } 
                    this.currentRecord.key = key
                    this.currentMacro.list = this.currentMacro.list.map((item) => {
                        if (item.id === this.currentRecord.id) {
                            return { ...item, key }
                        }
                        return item
                    });
                    this.save()
                })
            }
        } else {
            this.currentMacro.list = this.currentMacro.list.map((item) => {
                if (item.id === this.currentMacro.id) {
                    return { ...item, key:{name:'',value:null} }
                }
                return item
            });
        }
    }

    // 导入
    public handleImport(f: any) {
        const _this = this
        const file = f.target.files[0]
        if (file.type.indexOf('json') < 0) {
        this.msgService.error(this.i18n.instant("macro.fileTypeError"))
        }

        const reader = new FileReader();
        reader.readAsText(file)
        reader.onload = () => {
        const list = JSON.parse(reader.result as string)
        if (list[0].id.indexOf('M') > -1) {
            list.forEach((l: MacroList) => {
            if(l.list.length > 200) {
                l.list.length = 200
                this.msgService.warn(this.i18n.instant('notify.macroSizeLimit'))
            }
            _this.macroList.push({...l, id: "M"+l.id.split('M')[1]+1})
            });
            localStorage.setItem('macroList', JSON.stringify(_this.macroList))
        } else {
            this.msgService.error('error!')
        }
        }
    }
    // 导出
    public handleExport() {
        const currentDevice = this.service.currentDevice as MouseDevice
        const filename = `${currentDevice?.name} Macro.json`;
        const link = document.createElement('a')
        const json = JSON.stringify(this.macroList)
        var blob = new Blob([json]);
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.target = '_blank'
        link.click()
        link.remove()
    }
    // 验证键盘输入
    public validateInput(event: KeyboardEvent): void {
        const allowedKeys = [
            'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', // 常用功能键
        ]
        const isNumber = /^[0-9]$/.test(event.key)
        if (!isNumber && !allowedKeys.includes(event.key)) {
            event.preventDefault()
        }
    }

    // 验证范围
    public checkRange(event: Event, max: number, min: number, model:any,key:string): void {
        const input = event.target as HTMLInputElement
        const value = parseInt(input.value, 10)
        if (value < min) {
            input.value = min.toString()
            model[key] = min
        } else if (value > max) {
            input.value = max.toString()
            model[key] = max
        } else {
            model[key]= value
        }
        if(key === 'value'){
            this.setEvent()
        }else {
            this.save()
        }
    }
}
