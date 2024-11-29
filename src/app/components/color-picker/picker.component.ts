import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'g-color-picker',
    template: `
        <div class="color-wheel-container">
            <canvas #colorWheelCanvas [width]="radius * 2" [height]="radius * 2" (click)="onClick($event)"></canvas>
        </div>
    `,
    styles: [`
        .color-wheel-container {
            position: relative;
        }
        canvas {
            border: 1px solid #fff;
            border-radius: 50%;
        }
    `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: ColorWheelComponent,
            multi: true
        }
    ]
})
export class ColorWheelComponent implements OnInit, AfterViewInit, ControlValueAccessor {
    @ViewChild('colorWheelCanvas') canvasRef: ElementRef;
    @Output() colorChanged: EventEmitter<string> = new EventEmitter();
    @Input() radius: number = 100; // 半径，默认100
    private isUserInteraction = false;
    private _selectedColor: string = '#ffffff';
    onChange: (value: any) => void;
    onTouched: () => void;

    get selectedColor(): string {
        return this._selectedColor;
    }

    set selectedColor(value: string) {
        if (this.isUserInteraction) {
            if (this._selectedColor !== value) { // 仅当颜色更改时才更新
                this._selectedColor = value;
                this.colorChanged.emit(value);  // 当颜色变化时，发射事件
                if (this.onChange) {
                    this.onChange(value); // Notify change to ngModel
                }
            }
        }
    }
    
    ngOnInit(): void {
        // 不在这里访问 canvasRef.nativeElement
    }

    ngAfterViewInit(): void {
        // 在 ngAfterViewInit 中访问 canvasRef.nativeElement
        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');
        this.drawColorWheel(ctx, canvas.width, canvas.height);
    }

    // Draw color wheel (same logic as before)
    drawColorWheel(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        const radius = width / 2;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let angle = 0; angle < 360; angle++) {
        const radian = (angle * Math.PI) / 180;
        const startX = centerX + Math.cos(radian) * radius;
        const startY = centerY + Math.sin(radian) * radius;

        const gradient = ctx.createLinearGradient(centerX, centerY, startX, startY);
        gradient.addColorStop(0, `hsl(${angle}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${angle + 10}, 100%, 50%)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(startX, startY);
        ctx.stroke();
        }
    }

    // 处理点击事件，选择颜色
    onClick(event: MouseEvent): void {
        this.isUserInteraction = true;
        const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
        const x = event.clientX - canvasRect.left - this.canvasRef.nativeElement.width / 2;
        const y = event.clientY - canvasRect.top - this.canvasRef.nativeElement.height / 2;

        const angle = Math.atan2(y, x);
        const distance = Math.sqrt(x * x + y * y);

        if (distance < this.canvasRef.nativeElement.width / 2) {
        // 根据点击角度计算色相
        const hue = (angle * 180 / Math.PI + 360) % 360;

        // 转换为 RGB
        const rgb = this.hslToRgb(hue, 100, 50);  // 假设饱和度为100，亮度为50
        const newColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // 如果颜色有变动，才更新
        if (this.selectedColor !== newColor) {
            this.selectedColor = newColor;  // 更新颜色
        }
        }
    }

    // 将 HSL 转换为 RGB
    hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;

        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
        } else {
        r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return { r, g, b };
    }

    writeValue(value: any): void {
        if (value) {
            this.isUserInteraction = false;
            this.selectedColor = value;
        }
    }

    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
}