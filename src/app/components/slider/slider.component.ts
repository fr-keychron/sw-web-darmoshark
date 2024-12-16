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

  @ViewChild('sliderTrack', { static: false }) sliderTrack!: ElementRef<HTMLElement>;

  public progress = 0;
  private innerValue = this.min;
  private dragging = false;

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

  onMouseDown(event: MouseEvent): void {
    this.dragging = true;
    window.addEventListener('mousemove', this.onDrag.bind(this));
    window.addEventListener('mouseup', this.onStopDrag.bind(this));
    event.preventDefault();
  }

  onTrackClick(event: MouseEvent | TouchEvent): void {
    const clientX = this.getClientX(event);
    this.updateValueFromEvent(clientX);
  }

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

  onStopDrag(): void {
    if (this.dragging) {
      this.dragging = false;
      window.removeEventListener('mousemove', this.onDrag.bind(this));
      window.removeEventListener('mouseup', this.onStopDrag.bind(this));
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
}
