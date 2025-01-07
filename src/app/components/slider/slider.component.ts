import { Component, Input, HostListener, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'g-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
})
export class SliderComponent implements ControlValueAccessor {
  @Input() min = 0;
  @Input() max = 1000;
  @Input() step = 50;
  @Input() type: 'Track' | 'Thumb' = 'Track'; // 类型：Track 或 Thumb
  @Input() isRealTimeUpdate = false; // 是否实时更新
  @Input() tip = '';
  @Input() btn = false;

  @ViewChild('sliderTrack', { static: false }) sliderTrack!: ElementRef<HTMLElement>;

  public progress = 0;
  private innerValue = this.min;
  private dragging = false;

  get value(): number {
    return this.innerValue;
  }

  set value(val: number) {
    if (Math.round(val) !== this.innerValue) {
      if (val < this.min) {
        this.innerValue = this.min;
      } else if (val > this.max) {
        this.innerValue = this.max;
      } else {
        this.innerValue = val;
      }
      this.updateProgress();
      this.onChange(this.innerValue);
    }
  }

  writeValue(value: number): void {
    this.value = value || this.min;
    this.updateProgress();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onChange = (value: number) => {};
  onTouched = () => {};

  onMouseDown(event: MouseEvent): void {
    this.dragging = true;
    // 绑定到 window 上，这样鼠标滑出 sliderTrack 时也能继续触发
    window.addEventListener('mousemove', this.onDrag.bind(this));
    window.addEventListener('mouseup', this.onStopDrag.bind(this));
    window.addEventListener('touchmove', this.onDrag.bind(this));
    window.addEventListener('touchend', this.onStopDrag.bind(this));
    event.preventDefault();
  }

  // 点击滑块的轨道时
  onTrackClick(event: MouseEvent | TouchEvent): void {
    const clientX = this.getClientX(event);
    this.updateValueFromEvent(clientX);
    // 防止事件传播
    event.preventDefault();
  }

  // 鼠标/触摸拖动时的处理
  onDrag(event: MouseEvent | TouchEvent): void {
    if (this.dragging) {
      const clientX = this.getClientX(event);
      if (this.isRealTimeUpdate) {
        this.updateValueFromEvent(clientX);
      } else {
        this.updateProgressFromEvent(clientX);
      }
    }
  }

  // 停止拖动时的处理
  onStopDrag(event?: MouseEvent | TouchEvent): void {
    if (this.dragging) {
      this.dragging = false;
      // 鼠标松开时触发更新
      if (event) {
        const clientX = this.getClientX(event);
        this.updateValueFromEvent(clientX);
      }
      // 移除全局的事件监听
      window.removeEventListener('mousemove', this.onDrag.bind(this));
      window.removeEventListener('mouseup', this.onStopDrag.bind(this));
      window.removeEventListener('touchmove', this.onDrag.bind(this));
      window.removeEventListener('touchend', this.onStopDrag.bind(this));
    }
  }

  private updateValueFromEvent(clientX: number): void {
    const rect = this.getTrackRect();
    const offsetX = clientX - rect.left;
    const totalWidth = rect.width;

    const newProgress = Math.max(0, Math.min(1, offsetX / totalWidth));
    const range = this.max - this.min;
    const rawValue = Math.round((newProgress * range) / this.step) * this.step + this.min;

    this.value = Math.max(this.min, Math.min(this.max, rawValue));
  }

  private updateProgressFromEvent(clientX: number): void {
    const rect = this.getTrackRect();
    const offsetX = clientX - rect.left;
    const totalWidth = rect.width;

    const newProgress = Math.max(0, Math.min(1, offsetX / totalWidth));
    this.progress = newProgress * 100;
  }

  private updateProgress(): void {
    const range = this.max - this.min;
    this.progress = ((this.value - this.min) / range) * 100;
  }

  private getClientX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0]?.clientX || 0;
  }

  private getTrackRect(): DOMRect {
    return this.sliderTrack.nativeElement.getBoundingClientRect();
  }

  public increaseValue(): void {
    this.value = Math.min(this.value + this.step, this.max);
  }

  public decreaseValue(): void {
    this.value = Math.max(this.value - this.step, this.min);
  }
}
