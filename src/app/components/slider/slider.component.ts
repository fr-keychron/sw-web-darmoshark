import { Component, Input, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'g-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ]
})
export class SliderComponent implements ControlValueAccessor {
  @Input() min = 0;
  @Input() max = 1000;
  @Input() step = 50;
  @Input() type = 'Track'; //进度条类型
  @Input() isRealTimeUpdate = false;  // 控制是否实时更新值
  @Input() tip = '';

  public progress = 0;
  private innerValue = this.min;
  private dragging = false;
  private hovering  = false;
  get value(): number {
    return this.innerValue;
  }

  set value(val: number) {
    if (val !== this.innerValue) {
      this.innerValue = val;
      this.updateProgress();
      this.onChange(val);
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

  // Mouse events
  onMouseDown(event: MouseEvent): void {
    this.dragging = true;
    event.preventDefault();
  }

  onTrackClick(event: MouseEvent): void {
    // 点击时根据 isRealTimeUpdate 控制是否更新值
    this.updateValueFromEvent(event.clientX);
  }

  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  onStopDrag(event: MouseEvent | TouchEvent): void {
    if (this.dragging) {
      this.dragging = false;
      this.onTouched();
      if (event) {
        const clientX = event instanceof MouseEvent ? event.clientX : (event.touches[0] && event.touches[0].clientX);
        this.updateValueFromEvent(clientX); // 停止拖动时更新值
      }
    }
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent): void {
    if (this.dragging) {
      // 根据 isRealTimeUpdate 判断是否实时更新值
      if (this.isRealTimeUpdate) {
        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        this.updateValueFromEvent(clientX);  // 拖动时实时更新值
      } else {
        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        this.updateProgressFromEvent(clientX);  // 仅更新进度条
      }
    }
  }

  private updateValueFromEvent(clientX: number): void {
    const trackElement = document.querySelector(this.type === 'Thumb' ? '.slider-track-Thumb' : '.slider-track') as HTMLElement;
    const rect = trackElement.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const totalWidth = rect.width;

    const newProgress = Math.max(0, Math.min(1, offsetX / totalWidth));
    const range = this.max - this.min;
    const rawValue = Math.round((newProgress * range) / this.step) * this.step + this.min;

    this.value = Math.max(this.min, Math.min(this.max, rawValue)); // 更新值
  }

  private updateProgressFromEvent(clientX: number): void {
    const trackElement = document.querySelector(this.type === 'Thumb' ? '.slider-track-Thumb' : '.slider-track') as HTMLElement;
    const rect = trackElement.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const totalWidth = rect.width;

    const newProgress = Math.max(0, Math.min(1, offsetX / totalWidth));
    this.progress = newProgress * 100;  // 更新进度条
  }

  private updateProgress(): void {
    const range = this.max - this.min;
    this.progress = ((this.value - this.min) / range) * 100;
    if (this.progress > 100) {
      this.progress = 100;
    } else if (this.progress < 0) {
      this.progress = 0;
    }
  }
}
