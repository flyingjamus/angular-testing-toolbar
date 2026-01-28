import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LdsDesignerHeaderComponent } from './designer-header.component';

@Component({
  standalone: true,
  imports: [LdsDesignerHeaderComponent],
  template: `
    <div class="test-container" [style.width.px]="containerWidth">
      <lds-designer-header titleText="Designer" inputPlaceholder="Search...">
        <span lds-designer-header-left-content class="chip"
          ><span class="chip__text">Chip</span></span
        >
        <span lds-designer-header-center-content class="center-content">Center</span>
        <button lds-designer-header-right-content class="right-button">Right</button>
      </lds-designer-header>
    </div>
  `,
})
class CenterWrapTestHostComponent {
  containerWidth = 1000;
}

describe('LdsDesignerHeaderComponent (center wrapping)', () => {
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

    const cmp = fixture.debugElement.query(By.directive(LdsDesignerHeaderComponent))
      .componentInstance as LdsDesignerHeaderComponent;
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

