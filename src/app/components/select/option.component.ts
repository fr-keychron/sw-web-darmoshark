import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'g-option',
    template: `
    <div class="g-option" [class.selected]="isSelected"  (click)="selectOption()">
        <span *ngIf="!useInnerHTML">{{ gLabel | translate }}</span>
        <span *ngIf="useInnerHTML" [innerHTML]="gLabel"></span>
    </div>
    `,
    styles: [`
        .g-option {
            border-bottom: 1px solid #00FFFD;
            color: #f0efef;
            cursor: pointer;
            font-weight: 200;
            padding: 0 .666rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;  
        }

        .g-option:hover {
            color: #00FFFD;
        }
        .selected {
            background: url(../../../assets/icon/bg-select.png)
        }
    `]
})
export class GOptionComponent {
    @Input() gLabel: string = ''; // 显示的选项标签
    @Input() gValue: any;         // 选项值
    @Input() useInnerHTML: boolean = false; // 是否使用 translate
    @Output() optionSelected = new EventEmitter<any>(); // 选项点击事件
    isSelected: boolean;
    selectOption() {
        this.optionSelected.emit(this.gValue);
    }
    
}
