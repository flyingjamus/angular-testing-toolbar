import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { LdsDesignerHeader, shouldWrapCenter } from './designer-header.component';

// ----------------------------
// Test host for center wrapping
// ----------------------------
@Component({
  standalone: true,
  imports: [LdsDesignerHeader],
  template: `
    <div class="test-container" [style.width.px]="containerWidth">
      <lds-designer-header titleText="Designer" inputPlaceholder="Search...">
        <span lds-designer-header-left-content class="chip">
          <span class="chip__text">Chip</span>
        </span>
        <span lds-designer-header-center-content class="center-content">Center</span>
        <button lds-designer-header-right-content class="right-button">Right</button>
      </lds-designer-header>
    </div>
  `,
})
class CenterWrapTestHostComponent {
  containerWidth = 1000;
}

// ----------------------------
// Test host for basic inputs/outputs
// ----------------------------
@Component({
  standalone: true,
  imports: [LdsDesignerHeader],
  template: `
    <lds-designer-header
      [titleText]="titleText"
      [inputValue]="inputValue"
      [inputPlaceholder]="inputPlaceholder"
      [disabled]="disabled"
      [primaryBtnVisible]="primaryBtnVisible"
      [primaryBtnText]="primaryBtnText"
      [primaryBtnDisabled]="primaryBtnDisabled"
      [secondaryBtnVisible]="secondaryBtnVisible"
      [secondaryBtnText]="secondaryBtnText"
      [secondaryBtnDisabled]="secondaryBtnDisabled"
      [menuBtnVisible]="menuBtnVisible"
      [menuBtnDisabled]="menuBtnDisabled"
      [actionsDividerVisible]="actionsDividerVisible"
      (backClicked)="onBackClicked()"
      (primaryClicked)="onPrimaryClicked()"
      (secondaryClicked)="onSecondaryClicked()"
      (menuClicked)="onMenuClicked()"
      (inputValueChange)="onInputValueChange($event)"
    ></lds-designer-header>
  `,
})
class BasicTestHostComponent {
  titleText = 'Test Title';
  inputValue = '';
  inputPlaceholder = 'Enter text...';
  disabled = false;
  primaryBtnVisible = true;
  primaryBtnText = 'Save';
  primaryBtnDisabled = false;
  secondaryBtnVisible = true;
  secondaryBtnText = 'Cancel';
  secondaryBtnDisabled = false;
  menuBtnVisible = false;
  menuBtnDisabled = false;
  actionsDividerVisible = true;

  backClickCount = 0;
  primaryClickCount = 0;
  secondaryClickCount = 0;
  menuClickCount = 0;
  lastInputValue = '';

  onBackClicked(): void {
    this.backClickCount++;
  }

  onPrimaryClicked(): void {
    this.primaryClickCount++;
  }

  onSecondaryClicked(): void {
    this.secondaryClickCount++;
  }

  onMenuClicked(): void {
    this.menuClickCount++;
  }

  onInputValueChange(value: string): void {
    this.lastInputValue = value;
  }
}

// ----------------------------
// Test host for ControlValueAccessor
// ----------------------------
@Component({
  standalone: true,
  imports: [LdsDesignerHeader, FormsModule, ReactiveFormsModule],
  template: `
    <lds-designer-header
      titleText="CVA Test"
      [formControl]="formControl"
    ></lds-designer-header>
  `,
})
class CVATestHostComponent {
  formControl = new FormControl('');
}

// ----------------------------
// Test host for ngModel binding
// ----------------------------
@Component({
  standalone: true,
  imports: [LdsDesignerHeader, FormsModule],
  template: `
    <lds-designer-header
      titleText="NgModel Test"
      [(ngModel)]="modelValue"
    ></lds-designer-header>
  `,
})
class NgModelTestHostComponent {
  modelValue = '';
}

// ============================================================================
// shouldWrapCenter function tests
// ============================================================================
describe('shouldWrapCenter', () => {
  it('returns false when containerWidth is 0', () => {
    expect(shouldWrapCenter({
      containerWidth: 0,
      leftWidth: 100,
      rightWidth: 100,
      centerContentWidth: 100,
      gap: 8,
    })).toBe(false);
  });

  it('returns false when centerContentWidth is 0', () => {
    expect(shouldWrapCenter({
      containerWidth: 1000,
      leftWidth: 100,
      rightWidth: 100,
      centerContentWidth: 0,
      gap: 8,
    })).toBe(false);
  });

  it('returns true when there is no remaining space for sides', () => {
    expect(shouldWrapCenter({
      containerWidth: 100,
      leftWidth: 50,
      rightWidth: 50,
      centerContentWidth: 100,
      gap: 8,
    })).toBe(true);
  });

  it('returns true when left side is too wide', () => {
    expect(shouldWrapCenter({
      containerWidth: 500,
      leftWidth: 300,
      rightWidth: 50,
      centerContentWidth: 100,
      gap: 8,
    })).toBe(true);
  });

  it('returns true when right side is too wide', () => {
    expect(shouldWrapCenter({
      containerWidth: 500,
      leftWidth: 50,
      rightWidth: 300,
      centerContentWidth: 100,
      gap: 8,
    })).toBe(true);
  });

  it('returns false when there is enough space for all', () => {
    expect(shouldWrapCenter({
      containerWidth: 1000,
      leftWidth: 200,
      rightWidth: 200,
      centerContentWidth: 300,
      gap: 8,
    })).toBe(false);
  });

  it('handles non-finite values gracefully', () => {
    expect(shouldWrapCenter({
      containerWidth: NaN,
      leftWidth: 100,
      rightWidth: 100,
      centerContentWidth: 100,
      gap: 8,
    })).toBe(false);

    expect(shouldWrapCenter({
      containerWidth: 1000,
      leftWidth: Infinity,
      rightWidth: 100,
      centerContentWidth: 100,
      gap: 8,
    })).toBe(false);
  });
});

// ============================================================================
// LdsDesignerHeader component tests - Center wrapping
// ============================================================================
describe('LdsDesignerHeader (center wrapping)', () => {
  let fixture: ComponentFixture<CenterWrapTestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterWrapTestHostComponent],
    }).compileComponents();
  });

  function createFixture(config: { containerWidth?: number } = {}): void {
    fixture = TestBed.createComponent(CenterWrapTestHostComponent);
    if (config.containerWidth !== undefined) {
      fixture.componentInstance.containerWidth = config.containerWidth;
    }
    fixture.detectChanges();
  }

  function getHeaderContainer(): HTMLElement {
    return fixture.debugElement.query(By.css('.lds-designer-header-container')).nativeElement;
  }

  function applyMockedMeasurementsAndUpdate(measurements: {
    containerWidth: number;
    backWidth: number;
    leftFixedWidth?: number;
    leftFlexibleWidth?: number;
    rightFixedWidth?: number;
    rightFlexibleWidth?: number;
    centerContentWidth: number;
  }): void {
    const containerEl = getHeaderContainer();

    containerEl.getBoundingClientRect = () =>
      ({
        width: measurements.containerWidth,
        height: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: measurements.containerWidth,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const backEl = containerEl.querySelector<HTMLElement>('.back-btn-container');
    if (backEl) {
      backEl.getBoundingClientRect = () =>
        ({
          width: measurements.backWidth,
          height: 0,
          top: 0,
          bottom: 0,
          left: 0,
          right: measurements.backWidth,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
    }

    const titleContainerEl = containerEl.querySelector<HTMLElement>('.title-container');
    if (titleContainerEl) {
      Object.defineProperty(titleContainerEl, 'scrollWidth', {
        configurable: true,
        value: measurements.leftFixedWidth ?? 0,
      });
    }

    const leftFlexibleChild = containerEl.querySelector<HTMLElement>(
      '.lds-designer-header-left-content > *'
    );
    if (leftFlexibleChild) {
      const leftFlexibleWidth = measurements.leftFlexibleWidth ?? 0;
      leftFlexibleChild.getBoundingClientRect = () =>
        ({
          width: leftFlexibleWidth,
          height: 0,
          top: 0,
          bottom: 0,
          left: 0,
          right: leftFlexibleWidth,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
    }

    const actionsEl = containerEl.querySelector<HTMLElement>('.actions-container');
    if (actionsEl) {
      Object.defineProperty(actionsEl, 'scrollWidth', {
        configurable: true,
        value: measurements.rightFixedWidth ?? 0,
      });
    }

    const rightFlexibleChild = containerEl.querySelector<HTMLElement>(
      '.lds-designer-header-right-content > *'
    );
    if (rightFlexibleChild) {
      const rightFlexibleWidth = measurements.rightFlexibleWidth ?? 0;
      rightFlexibleChild.getBoundingClientRect = () =>
        ({
          width: rightFlexibleWidth,
          height: 0,
          top: 0,
          bottom: 0,
          left: 0,
          right: rightFlexibleWidth,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
    }

    const centerInnerEl = containerEl.querySelector<HTMLElement>('.lds-designer-header-center-inner');
    if (centerInnerEl) {
      Object.defineProperty(centerInnerEl, 'scrollWidth', {
        configurable: true,
        value: measurements.centerContentWidth,
      });
    }

    const cmp = fixture.debugElement.query(By.directive(LdsDesignerHeader))
      .componentInstance as LdsDesignerHeader;
    (cmp as any).hasCenterContent = true;
    (cmp as any).updateCenterWrapState();
    fixture.detectChanges();
  }

  it('wraps the center when back column reduces available width', () => {
    createFixture({ containerWidth: 1000 });

    applyMockedMeasurementsAndUpdate({
      containerWidth: 1000,
      backWidth: 56,
      leftFixedWidth: 260,
      leftFlexibleWidth: 70,
      rightFixedWidth: 240,
      rightFlexibleWidth: 60,
      centerContentWidth: 300,
    });

    expect(getHeaderContainer().classList.contains('lds-designer-header-center-wrap')).toBe(true);
  });

  it('does not wrap the center when there is enough space', () => {
    createFixture({ containerWidth: 1200 });

    applyMockedMeasurementsAndUpdate({
      containerWidth: 1200,
      backWidth: 56,
      leftFixedWidth: 260,
      leftFlexibleWidth: 70,
      rightFixedWidth: 240,
      rightFlexibleWidth: 60,
      centerContentWidth: 300,
    });

    expect(getHeaderContainer().classList.contains('lds-designer-header-center-wrap')).toBe(false);
  });
});

// ============================================================================
// LdsDesignerHeader component tests - Basic inputs/outputs
// ============================================================================
describe('LdsDesignerHeader (basic inputs/outputs)', () => {
  let fixture: ComponentFixture<BasicTestHostComponent>;
  let host: BasicTestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the title text', () => {
    const titleEl = fixture.debugElement.query(By.css('.lds-designer-header-title'));
    expect(titleEl?.nativeElement.textContent.trim()).toBe('Test Title');
  });

  it('emits backClicked when back button is clicked', () => {
    const backBtn = fixture.debugElement.query(By.css('.back-btn-container button'));
    backBtn.nativeElement.click();
    expect(host.backClickCount).toBe(1);
  });

  it('emits primaryClicked when primary button is clicked', () => {
    const primaryBtn = fixture.debugElement.query(
      By.css('.actions-container button[lds-button][appearance="filled"]')
    );
    primaryBtn.nativeElement.click();
    expect(host.primaryClickCount).toBe(1);
  });

  it('emits secondaryClicked when secondary button is clicked', () => {
    const secondaryBtn = fixture.debugElement.query(
      By.css('.actions-container button[lds-button][appearance="outline"]')
    );
    secondaryBtn.nativeElement.click();
    expect(host.secondaryClickCount).toBe(1);
  });

  it('shows menu button when menuBtnVisible is true', () => {
    host.menuBtnVisible = true;
    fixture.detectChanges();

    const menuBtn = fixture.debugElement.query(
      By.css('.actions-container button[lds-icon-button]')
    );
    expect(menuBtn).toBeTruthy();
  });

  it('emits menuClicked when menu button is clicked', () => {
    host.menuBtnVisible = true;
    fixture.detectChanges();

    const menuBtn = fixture.debugElement.query(
      By.css('.actions-container button[lds-icon-button]')
    );
    menuBtn.nativeElement.click();
    expect(host.menuClickCount).toBe(1);
  });

  it('hides primary button when primaryBtnVisible is false', () => {
    host.primaryBtnVisible = false;
    fixture.detectChanges();

    const primaryBtn = fixture.debugElement.query(
      By.css('.actions-container button[lds-button][appearance="filled"]')
    );
    expect(primaryBtn).toBeFalsy();
  });

  it('hides secondary button when secondaryBtnVisible is false', () => {
    host.secondaryBtnVisible = false;
    fixture.detectChanges();

    const secondaryBtn = fixture.debugElement.query(
      By.css('.actions-container button[lds-button][appearance="outline"]')
    );
    expect(secondaryBtn).toBeFalsy();
  });

  it('disables primary button when primaryBtnDisabled is true', () => {
    host.primaryBtnDisabled = true;
    fixture.detectChanges();

    const primaryBtn = fixture.debugElement.query(
      By.css('.actions-container button[lds-button][appearance="filled"]')
    );
    expect(primaryBtn.nativeElement.disabled).toBe(true);
  });

  it('disables secondary button when secondaryBtnDisabled is true', () => {
    host.secondaryBtnDisabled = true;
    fixture.detectChanges();

    const secondaryBtn = fixture.debugElement.query(
      By.css('.actions-container button[lds-button][appearance="outline"]')
    );
    expect(secondaryBtn.nativeElement.disabled).toBe(true);
  });

  it('updates input placeholder', () => {
    const input = fixture.debugElement.query(By.css('lds-expandable-input input'));
    expect(input.nativeElement.placeholder).toBe('Enter text...');
  });

  it('emits inputValueChange when input changes', async () => {
    const input = fixture.debugElement.query(By.css('lds-expandable-input input'));
    input.nativeElement.value = 'new value';
    input.nativeElement.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.lastInputValue).toBe('new value');
  });
});

// ============================================================================
// LdsDesignerHeader component tests - ControlValueAccessor
// ============================================================================
describe('LdsDesignerHeader (ControlValueAccessor)', () => {
  let fixture: ComponentFixture<CVATestHostComponent>;
  let host: CVATestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CVATestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CVATestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates component value when form control value changes', async () => {
    host.formControl.setValue('form value');
    await fixture.whenStable();
    fixture.detectChanges();

    const headerCmp = fixture.debugElement.query(By.directive(LdsDesignerHeader))
      .componentInstance as LdsDesignerHeader;
    expect(headerCmp.value).toBe('form value');
  });

  it('updates form control when input changes', async () => {
    const input = fixture.debugElement.query(By.css('lds-expandable-input input'));
    input.nativeElement.value = 'typed value';
    input.nativeElement.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.formControl.value).toBe('typed value');
  });

  it('disables component when form control is disabled', async () => {
    host.formControl.disable();
    await fixture.whenStable();
    fixture.detectChanges();

    const headerCmp = fixture.debugElement.query(By.directive(LdsDesignerHeader))
      .componentInstance as LdsDesignerHeader;
    expect(headerCmp.disabled).toBe(true);
  });
});

// ============================================================================
// LdsDesignerHeader component tests - ngModel
// ============================================================================
describe('LdsDesignerHeader (ngModel)', () => {
  let fixture: ComponentFixture<NgModelTestHostComponent>;
  let host: NgModelTestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgModelTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgModelTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates component value from ngModel', async () => {
    host.modelValue = 'model value';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const headerCmp = fixture.debugElement.query(By.directive(LdsDesignerHeader))
      .componentInstance as LdsDesignerHeader;
    expect(headerCmp.value).toBe('model value');
  });

  it('updates ngModel when input changes', async () => {
    const input = fixture.debugElement.query(By.css('lds-expandable-input input'));
    input.nativeElement.value = 'input value';
    input.nativeElement.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.modelValue).toBe('input value');
  });
});
