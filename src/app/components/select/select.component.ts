import { Component, ContentChildren, QueryList, ChangeDetectorRef, Output, EventEmitter, forwardRef, AfterContentInit,Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GOptionComponent } from './option.component';

@Component({
    selector: 'g-select',
    template: `
        <div class="g-select" (click)="toggleDropdown($event)" [ngStyle]="{'text-align': gCenter ? 'center' : 'left'}">
            <div class="g-select-box" tabindex="0"  >
                <span>{{ getSelectedLabel() | translate}}</span>
                <div class="arrow"></div>
            </div>
            <div class="g-options" *ngIf="dropdownVisible">
                <ng-content></ng-content> <!-- 渲染 g-option 组件 -->
            </div>
        </div>
    `,
    styles: [`
        .g-select {
            position: relative;
            width: 100%;
            min-width: 4rem;
            height:1.7rem;
        }

        .g-select-box {
            width: 100%;
            height: 100%;
            padding-left: .333rem;
            border: 1px solid #00FFFD;
            background-color: #292929;
            color: #f0efef;
            cursor: pointer;
            border-radius: .333rem;
            &:hover {
                box-shadow: 0 0 8px rgba(#00FFFD, 0.5);
            }
        }

        .arrow {
            width: 1rem;
            height: 1rem;
            background: url(../../../assets/icon/selact-arrow-down.png);
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            position: absolute;
            top: 50%;
            right: 4%;
            transform: translateY(-50%);
        }

        .g-options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #0b0b0b;
            border: 1px solid #00FFFD;
            border-radius: .333rem;
            z-index: 1000;
            max-height: 30rem;
            overflow-y: auto;
            &::-webkit-scrollbar {
                width: 8px;
            }

            &::-webkit-scrollbar-track {
                background: #0b0b0b;
                border-radius: .333rem;
            }

            &::-webkit-scrollbar-thumb {
                background-color: #00FFFD;
                border-radius: .333rem;
                border: 2px solid #0b0b0b;
            }

            &::-webkit-scrollbar-thumb:hover {
                background-color: #00ccff;
            }
        }


        .selected {
            background-color: #00FFFD;
        }
        
    `],
    providers: [
        {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => GSelectComponent),
        multi: true
        }
    ]
})
export class GSelectComponent implements ControlValueAccessor, AfterContentInit {
    @ContentChildren(GOptionComponent) options: QueryList<GOptionComponent>;
    @Input() gCenter: boolean = true;
    dropdownVisible = false;
    private innerValue: any;
    constructor(
        private cdr: ChangeDetectorRef
      ) { }
    // ControlValueAccessor 接口
    onChange: (value: any) => void = () => {};
    onTouched: () => void = () => {};
    
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
  
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
  
    // 当外部控件写入一个新值时，更新 innerValue 和显示状态
    writeValue(value: any): void {
        if (value === null || value === undefined) {
            this.innerValue = null;
        } else {
            this.innerValue = value;
        }
        this.updateOptionSelection();
    }
    
    // 获取选中的标签内容
    getSelectedLabel(): string {
        const selectedOption = this.options?.find(option => option.gValue === this.innerValue);
        return selectedOption ? selectedOption.gLabel : '';
    }
  
    // 切换下拉框的显示状态
    toggleDropdown(event: MouseEvent) {
        this.dropdownVisible = !this.dropdownVisible;
    } 

    // 初始化时绑定每个选项的选择事件
    ngAfterContentInit() {
        setTimeout(() => {
          this.options.forEach(option => {
            option.optionSelected.subscribe((value: any) => this.selectOption(value));
          });
          this.cdr.detectChanges(); // 强制变更检测
        });
      }
  
    // 选择选项
    selectOption(value: any) {
        if (this.innerValue !== value) {  // 只有当新值与当前值不一样时才触发事件
            this.innerValue = value;
            this.onChange(value);
            this.updateOptionSelection();
          }
        this.dropdownVisible = false;
    }
    onBlur() {
        setTimeout(() => {
            this.dropdownVisible = false;
        }, 200); 
    }
    // 更新所有选项的选中状态
    private updateOptionSelection() {
        if (this.options) {
            this.options.toArray().forEach(option => {
                option.isSelected = option.gValue === this.innerValue;
            });
        }
    }
    
}