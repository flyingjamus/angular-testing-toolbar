import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  input,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatMenu } from '@angular/material/menu';
import { DESIGNER_HEADER_STUBS } from './designer-header.stubs';

/**
 * Determines whether the center content should wrap to its own row.
 *
 * In the single-row grid, the center column is `auto` and left/right are `1fr`.
 * That means the remaining space (after center + gaps) is split evenly between
 * left and right, regardless of their intrinsic sizes. So we need to wrap the
 * center if either side cannot fit within its half.
 */
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
  const centerContentWidth = Number.isFinite(params.centerContentWidth)
    ? params.centerContentWidth
    : 0;
  const gap = Number.isFinite(params.gap) ? params.gap : 0;

  if (containerWidth <= 0 || centerContentWidth <= 0) return false;

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
    (el): el is HTMLElement => el instanceof HTMLElement
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

function getGapPx(el: HTMLElement): number {
  const computed = getComputedStyle(el);
  return Number.parseFloat(computed.columnGap) || Number.parseFloat(computed.gap) || 0;
}

function measureFixedPlusFlexibleWidth(params: {
  sectionEl: HTMLElement;
  fixedEl: HTMLElement | null;
  flexibleEl: HTMLElement | null;
}): number {
  const fixedWidth = params.fixedEl ? params.fixedEl.scrollWidth : 0;
  const flexibleWidth = params.flexibleEl ? measureMinWidthOfFlexRow(params.flexibleEl) : 0;
  const gap = params.fixedEl && params.flexibleEl ? getGapPx(params.sectionEl) : 0;

  return fixedWidth + gap + flexibleWidth;
}

/**
 * ## lds-designer-header Component
 *
 * The top block in all Lightico's designer pages (workflows, forms, html, pdf) providing back button,
 * title text, editable and expandable input field, primary, secondary and menu buttons as well as
 * optional injectable content block at the center/left/right.
 */
@Component({
  selector: 'lds-designer-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ...DESIGNER_HEADER_STUBS],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LdsDesignerHeader),
      multi: true,
    },
  ],
  templateUrl: './designer-header.component.html',
  styleUrl: './designer-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LdsDesignerHeader implements ControlValueAccessor, AfterViewInit, OnDestroy {
  /**
   * Header title text that appears to the right of the back arrow.
   */
  @Input() titleText!: string;

  /**
   * Header input text that appears to the right of the inner divider.
   */
  @Input()
  get inputValue(): string {
    return this.value;
  }
  set inputValue(val: string) {
    if (val !== this.value) {
      this.value = val ?? '';
      this.onChange(this.value);
      this.cdr.markForCheck();
    }
  }

  /**
   * ARIA label for the input.
   */
  @Input() ariaLabel = '';

  /**
   * Whether secondary button is disabled.
   */
  @Input() secondaryBtnDisabled = false;

  /**
   * Whether primary button is disabled.
   */
  @Input() primaryBtnDisabled = false;

  /**
   * Whether menu button is disabled.
   */
  @Input() menuBtnDisabled = false;

  /**
   * Whether menu button is visible.
   */
  @Input({ transform: booleanAttribute }) menuBtnVisible = false;

  /**
   * Whether primary button is visible.
   */
  @Input({ transform: booleanAttribute }) primaryBtnVisible = true;

  /**
   * Whether secondary button is visible.
   */
  @Input({ transform: booleanAttribute }) secondaryBtnVisible = true;

  /**
   * Whether the divider between right actions and right extra content is visible.
   */
  @Input({ transform: booleanAttribute }) actionsDividerVisible = false;

  /**
   * Whether the input interactions are disabled.
   */
  @Input({ transform: booleanAttribute }) inputInteractionDisable = false;

  /**
   * Secondary button text.
   */
  @Input() secondaryBtnText?: string;

  /**
   * Primary button text.
   */
  @Input() primaryBtnText?: string;

  /**
   * Secondary button test id.
   */
  secondaryBtnTestId = input<string | undefined>(undefined);

  /**
   * Primary button test id.
   */
  primaryBtnTestId = input<string | undefined>(undefined);

  /**
   * Menu button test id.
   */
  menuBtnTestId = input<string | undefined>(undefined);

  /**
   * Back button test id.
   */
  backBtnTestId = input<string | undefined>(undefined);

  /**
   * Back button id.
   */
  backBtnId = input<string | null>(null);

  /**
   * Primary button id.
   */
  primaryBtnId = input<string | undefined>(undefined);

  /**
   * Input test id.
   */
  inputTestId = input<string>('');

  /**
   * Whether the passive input style should be applied.
   */
  @Input() passiveInputStyle = false;

  /**
   * Headers input placeholder text.
   */
  @Input() inputPlaceholder = 'Type...';

  /**
   * Menu reference for the menu button.
   */
  @Input() menu!: MatMenu;

  /**
   * Whether the input field is disabled.
   */
  @Input({ transform: booleanAttribute }) disabled = false;

  /**
   * Whether the screen is medium-sized (affects layout/button sizes).
   */
  mediumScreen = input<boolean>(false);

  /**
   * Emits when the primary button is clicked.
   */
  @Output() primaryClicked = new EventEmitter<void>();

  /**
   * Emits when the menu button is clicked.
   */
  @Output() menuClicked = new EventEmitter<void>();

  /**
   * Emits when the secondary button is clicked.
   */
  @Output() secondaryClicked = new EventEmitter<void>();

  /**
   * Emits when the back button is clicked.
   */
  @Output() backClicked = new EventEmitter<void>();

  /**
   * Emits when the input value changes.
   */
  @Output() inputValueChange = new EventEmitter<string>();

  /**
   * @ignore
   */
  @ViewChild('hiddenText') textEl!: ElementRef;

  // ViewChild refs for layout measurement
  @ViewChild('headerContainer', { static: true })
  private headerContainerRef!: ElementRef<HTMLElement>;

  @ViewChild('leftSection', { static: true })
  private leftSectionRef!: ElementRef<HTMLElement>;

  @ViewChild('centerSection', { static: true })
  private centerSectionRef!: ElementRef<HTMLElement>;

  @ViewChild('centerInner', { static: true })
  private centerInnerRef!: ElementRef<HTMLElement>;

  @ViewChild('rightSection', { static: true })
  private rightSectionRef!: ElementRef<HTMLElement>;

  private resizeObserver?: ResizeObserver;
  private layoutUpdateScheduled = false;
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  hasCenterContent = false;
  public value = '';

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * @ignore
   */
  primaryClick(): void {
    this.primaryClicked.emit();
  }

  /**
   * @ignore
   */
  menuClick(): void {
    this.menuClicked.emit();
  }

  /**
   * @ignore
   */
  secondaryClick(): void {
    this.secondaryClicked.emit();
  }

  /**
   * @ignore
   */
  backClick(): void {
    this.backClicked.emit();
  }

  /**
   * @ignore
   */
  inputChange(newValue: string): void {
    this.value = newValue;
    this.onChange(newValue);
    this.inputValueChange.emit(newValue);
    this.cdr.markForCheck();
  }

  /**
   * @ignore
   */
  writeValue(v: string): void {
    this.value = v ?? '';
    this.cdr.markForCheck();
  }

  /**
   * @ignore
   */
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  /**
   * @ignore
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * @ignore
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  ngAfterViewInit(): void {
    // Content presence is based on projected DOM. Initialize it once here and
    // immediately reconcile bindings to avoid ExpressionChanged errors in dev/test.
    this.updateCenterContentPresence();
    this.cdr.detectChanges();

    if (typeof ResizeObserver === 'undefined') {
      this.scheduleLayoutCheck();
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.scheduleLayoutCheck());
      this.resizeObserver.observe(this.headerContainerRef.nativeElement);
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

  private updateCenterContentPresence(): void {
    const centerEl = this.centerSectionRef?.nativeElement;
    if (centerEl) {
      const innerEl = centerEl.querySelector('.lds-designer-header-center-inner');
      this.hasCenterContent = innerEl ? innerEl.children.length > 0 : false;
    }
  }

  private scheduleLayoutCheck(): void {
    if (this.layoutUpdateScheduled) return;
    this.layoutUpdateScheduled = true;

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.layoutUpdateScheduled = false;
        this.updateCenterContentPresence();
        this.updateCenterWrapState();
      }, 0);
    });
  }

  private updateCenterWrapState(): void {
    const containerEl = this.headerContainerRef.nativeElement;

    if (!this.hasCenterContent) {
      containerEl.classList.remove('lds-designer-header-center-wrap');
      containerEl.classList.remove('lds-designer-header-measuring');
      return;
    }

    // Always decide based on the "single row" layout.
    containerEl.classList.remove('lds-designer-header-center-wrap');
    containerEl.classList.add('lds-designer-header-measuring');

    const leftEl = this.leftSectionRef.nativeElement;
    const rightEl = this.rightSectionRef.nativeElement;
    const centerInnerEl = this.centerInnerRef.nativeElement;

    const centerContentWidth = centerInnerEl.scrollWidth;

    const computed = getComputedStyle(containerEl);
    const paddingLeft = Number.parseFloat(computed.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(computed.paddingRight) || 0;
    const containerWidth = Math.max(
      0,
      containerEl.getBoundingClientRect().width - paddingLeft - paddingRight
    );
    const gap = Number.parseFloat(computed.columnGap) || Number.parseFloat(computed.gap) || 8;

    // The designer header has a fixed "back" column before the left/center/right
    // trio. When deciding whether the center should wrap, measure available width
    // for just those three columns by subtracting the back column and its gap.
    const backEl = containerEl.querySelector<HTMLElement>('.back-btn-container');
    const backWidth = backEl ? backEl.getBoundingClientRect().width : 0;
    const availableForLeftCenterRight = Math.max(0, containerWidth - backWidth - gap);

    const leftWidth = measureFixedPlusFlexibleWidth({
      sectionEl: leftEl,
      fixedEl: leftEl.querySelector<HTMLElement>('.title-container'),
      flexibleEl: leftEl.querySelector<HTMLElement>('.lds-designer-header-left-content'),
    });

    const rightWidth = measureFixedPlusFlexibleWidth({
      sectionEl: rightEl,
      fixedEl: rightEl.querySelector<HTMLElement>('.actions-container'),
      flexibleEl: rightEl.querySelector<HTMLElement>('.lds-designer-header-right-content'),
    });

    const shouldWrap = shouldWrapCenter({
      containerWidth: availableForLeftCenterRight,
      leftWidth,
      rightWidth,
      centerContentWidth,
      gap,
    });

    containerEl.classList.remove('lds-designer-header-measuring');
    containerEl.classList.toggle('lds-designer-header-center-wrap', shouldWrap);
  }
}

// Backwards-compatible alias for the renamed class
export { LdsDesignerHeader as LdsDesignerHeaderComponent };
