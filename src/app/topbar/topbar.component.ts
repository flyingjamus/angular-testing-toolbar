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

  // In the single-row grid, the center column is `auto` and left/right are `1fr`.
  // That means the remaining space (after center + gaps) is split evenly between
  // left and right, regardless of their intrinsic sizes. So we need to wrap the
  // center if either side cannot fit within its half.
  const remainingForSides = containerWidth - centerContentWidth - 2 * gap;
  if (remainingForSides <= 0) return true;

  const perSide = remainingForSides / 2;
  return leftWidth > perSide || rightWidth > perSide;
}

function getPxNumber(value: string): number | undefined {
  if (!value) return undefined;
  if (value === 'auto') return undefined;
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : undefined;
}

function measureMinWidthOfFlexRow(containerEl: HTMLElement): number {
  const containerStyle = getComputedStyle(containerEl);
  const gap =
    getPxNumber(containerStyle.columnGap) ??
    getPxNumber(containerStyle.gap) ??
    getPxNumber(containerStyle.rowGap) ??
    0;

  const children = Array.from(containerEl.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement,
  );
  if (children.length === 0) return 0;

  let total = 0;
  for (const child of children) {
    const childStyle = getComputedStyle(child);

    const minWidth = getPxNumber(childStyle.minWidth) ?? child.getBoundingClientRect().width;
    const marginLeft = getPxNumber(childStyle.marginLeft) ?? 0;
    const marginRight = getPxNumber(childStyle.marginRight) ?? 0;

    total += Math.max(0, minWidth) + Math.max(0, marginLeft) + Math.max(0, marginRight);
  }

  total += gap * (children.length - 1);
  return total;
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
      topbarEl.classList.remove('topbar--measuring');
      return;
    }

    // Always decide based on the "single row" layout.
    topbarEl.classList.remove('topbar--center-wrapped');
    topbarEl.classList.add('topbar--measuring');

    const leftEl = this.leftSectionRef.nativeElement;
    const rightEl = this.rightSectionRef.nativeElement;
    const centerInnerEl = this.centerInnerRef.nativeElement;

    const rightWidth = measureMinWidthOfFlexRow(rightEl);
    const centerContentWidth = centerInnerEl.scrollWidth;

    const computed = getComputedStyle(topbarEl);
    const paddingLeft = Number.parseFloat(computed.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(computed.paddingRight) || 0;
    const containerWidth = Math.max(0, topbarEl.getBoundingClientRect().width - paddingLeft - paddingRight);
    const gap = Number.parseFloat(computed.columnGap) || Number.parseFloat(computed.gap) || 8;

    // Left side is allowed to shrink only via its projected content (e.g. a chip),
    // but the title should keep its intrinsic width. Wrap the center only once the
    // left content reaches its minimum width.
    let leftWidth = leftEl.getBoundingClientRect().width;
    const backTitleEl = leftEl.querySelector<HTMLElement>('.topbar__back-title');
    const leftContentEl = leftEl.querySelector<HTMLElement>('.topbar__left-content');

    if (backTitleEl) {
      const leftComputed = getComputedStyle(leftEl);
      const leftGap =
        Number.parseFloat(leftComputed.columnGap) || Number.parseFloat(leftComputed.gap) || 8;

      const backTitleWidth = backTitleEl.scrollWidth;
      let leftContentMinWidth = 0;

      if (leftContentEl) {
        leftContentMinWidth = measureMinWidthOfFlexRow(leftContentEl);
      }

      // leftEl is a flex row: [backTitleEl] [leftContentEl]. When leftContentEl exists, a gap applies.
      leftWidth = backTitleWidth + (leftContentEl ? leftGap : 0) + leftContentMinWidth;
    }

    const shouldWrap = shouldWrapCenter({
      containerWidth,
      leftWidth,
      rightWidth,
      centerContentWidth,
      gap,
    });

    topbarEl.classList.remove('topbar--measuring');
    topbarEl.classList.toggle('topbar--center-wrapped', shouldWrap);
  }
}
