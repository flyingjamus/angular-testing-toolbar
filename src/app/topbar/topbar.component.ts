import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TopbarLeftContentDirective,
  TopbarCenterContentDirective,
  TopbarRightContentDirective,
} from './topbar.directives';

export function shouldWrapCenter(params: {
  containerWidth: number;
  leftWidth: number;
  rightWidth: number;
  centerContentWidth: number;
  gap: number;
}): boolean {
  const containerWidth = Number.isFinite(params.containerWidth) ? params.containerWidth : 0;
  const leftWidth = Number.isFinite(params.leftWidth) ? params.leftWidth : 0;
  const rightWidth = Number.isFinite(params.rightWidth) ? params.rightWidth : 0;
  const centerContentWidth = Number.isFinite(params.centerContentWidth) ? params.centerContentWidth : 0;
  const gap = Number.isFinite(params.gap) ? params.gap : 0;

  if (containerWidth <= 0 || centerContentWidth <= 0) return false;
  const required = leftWidth + rightWidth + centerContentWidth + 2 * gap;
  return required > containerWidth;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() showBackButton = false;

  @Output() backClick = new EventEmitter<void>();

  @ViewChild('topbar', { static: true })
  private topbarRef!: ElementRef<HTMLElement>;

  @ViewChild('leftSection', { static: true })
  private leftSectionRef!: ElementRef<HTMLElement>;

  @ViewChild('centerSection', { static: true })
  private centerSectionRef!: ElementRef<HTMLElement>;

  @ViewChild('centerInner', { static: true })
  private centerInnerRef!: ElementRef<HTMLElement>;

  @ViewChild('rightSection', { static: true })
  private rightSectionRef!: ElementRef<HTMLElement>;

  @ContentChild(TopbarLeftContentDirective, { read: TemplateRef })
  leftContent?: TemplateRef<unknown>;

  @ContentChild(TopbarCenterContentDirective, { read: TemplateRef })
  centerContent?: TemplateRef<unknown>;

  @ContentChild(TopbarRightContentDirective, { read: TemplateRef })
  rightContent?: TemplateRef<unknown>;

  private resizeObserver?: ResizeObserver;
  private layoutUpdateScheduled = false;

  constructor(private ngZone: NgZone) {}

  onBackClick(): void {
    this.backClick.emit();
  }

  ngAfterViewInit(): void {
    if (typeof ResizeObserver === 'undefined') {
      this.scheduleLayoutCheck();
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.scheduleLayoutCheck());
      this.resizeObserver.observe(this.topbarRef.nativeElement);
      this.resizeObserver.observe(this.leftSectionRef.nativeElement);
      this.resizeObserver.observe(this.centerSectionRef.nativeElement);
      this.resizeObserver.observe(this.rightSectionRef.nativeElement);
    });

    this.scheduleLayoutCheck();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleLayoutCheck();
  }

  private scheduleLayoutCheck(): void {
    if (this.layoutUpdateScheduled) return;
    this.layoutUpdateScheduled = true;

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.layoutUpdateScheduled = false;
        this.updateCenterWrapState();
      }, 0);
    });
  }

  private updateCenterWrapState(): void {
    const topbarEl = this.topbarRef.nativeElement;

    if (!this.centerContent) {
      topbarEl.classList.remove('topbar--center-wrapped');
      return;
    }

    // Always decide based on the "single row" layout.
    topbarEl.classList.remove('topbar--center-wrapped');

    const leftEl = this.leftSectionRef.nativeElement;
    const rightEl = this.rightSectionRef.nativeElement;
    const centerInnerEl = this.centerInnerRef.nativeElement;

    const containerWidth = topbarEl.getBoundingClientRect().width;
    const leftWidth = leftEl.getBoundingClientRect().width;
    const rightWidth = rightEl.getBoundingClientRect().width;
    const centerContentWidth = centerInnerEl.scrollWidth;

    const computed = getComputedStyle(topbarEl);
    const gap = Number.parseFloat(computed.columnGap) || Number.parseFloat(computed.gap) || 8;

    const shouldWrap = shouldWrapCenter({
      containerWidth,
      leftWidth,
      rightWidth,
      centerContentWidth,
      gap,
    });

    topbarEl.classList.toggle('topbar--center-wrapped', shouldWrap);
  }
}
