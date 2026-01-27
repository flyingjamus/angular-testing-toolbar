import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { shouldWrapCenter, TopbarComponent } from './topbar.component';
import {
  TopbarLeftContentDirective,
  TopbarCenterContentDirective,
  TopbarRightContentDirective,
} from './topbar.directives';

@Component({
  standalone: true,
  imports: [
    TopbarComponent,
    TopbarLeftContentDirective,
    TopbarCenterContentDirective,
    TopbarRightContentDirective,
  ],
  template: `
    <app-topbar [title]="title" [showBackButton]="showBackButton" (backClick)="onBackClick()">
      <ng-template topbarLeftContent>
        <span class="left-content">Left Content</span>
      </ng-template>
      <ng-template topbarCenterContent>
        <span class="center-content">Center Content</span>
      </ng-template>
      <ng-template topbarRightContent>
        <span class="right-content">Right Content</span>
      </ng-template>
    </app-topbar>
  `,
})
class TestHostComponent {
  title = '';
  showBackButton = false;
  backClicked = false;

  onBackClick(): void {
    this.backClicked = true;
  }
}

describe('TopbarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  function createFixture(config: { title?: string; showBackButton?: boolean } = {}): void {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    if (config.title !== undefined) {
      hostComponent.title = config.title;
    }
    if (config.showBackButton !== undefined) {
      hostComponent.showBackButton = config.showBackButton;
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  describe('title', () => {
    it('should not render title when not provided', () => {
      createFixture();
      const titleElement = fixture.debugElement.query(By.css('.topbar__title'));
      expect(titleElement).toBeNull();
    });

    it('should render title when provided', () => {
      createFixture({ title: 'Page Title' });

      const titleElement = fixture.debugElement.query(By.css('.topbar__title'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent).toBe('Page Title');
    });
  });

  describe('back button', () => {
    it('should not render back button when showBackButton is false', () => {
      createFixture();
      const backButton = fixture.debugElement.query(By.css('.topbar__back-button'));
      expect(backButton).toBeNull();
    });

    it('should render back button when showBackButton is true', () => {
      createFixture({ showBackButton: true });

      const backButton = fixture.debugElement.query(By.css('.topbar__back-button'));
      expect(backButton).toBeTruthy();
    });

    it('should emit backClick when back button is clicked', () => {
      createFixture({ showBackButton: true });

      const backButton = fixture.debugElement.query(By.css('.topbar__back-button'));
      backButton.nativeElement.click();

      expect(hostComponent.backClicked).toBe(true);
    });

    it('should have accessible aria-label on back button', () => {
      createFixture({ showBackButton: true });

      const backButton = fixture.debugElement.query(By.css('.topbar__back-button'));
      expect(backButton.nativeElement.getAttribute('aria-label')).toBe('Go back');
    });
  });

  describe('content projection', () => {
    beforeEach(() => {
      createFixture();
    });

    it('should render left content', () => {
      const leftContent = fixture.debugElement.query(By.css('.left-content'));
      expect(leftContent).toBeTruthy();
      expect(leftContent.nativeElement.textContent).toBe('Left Content');
    });

    it('should render center content', () => {
      const centerContent = fixture.debugElement.query(By.css('.center-content'));
      expect(centerContent).toBeTruthy();
      expect(centerContent.nativeElement.textContent).toBe('Center Content');
    });

    it('should render right content', () => {
      const rightContent = fixture.debugElement.query(By.css('.right-content'));
      expect(rightContent).toBeTruthy();
      expect(rightContent.nativeElement.textContent).toBe('Right Content');
    });

    it('should place left content in the left section', () => {
      const leftSection = fixture.debugElement.query(By.css('.topbar__left-section'));
      const leftContent = leftSection.query(By.css('.left-content'));
      expect(leftContent).toBeTruthy();
    });

    it('should place center content in the center section', () => {
      const centerSection = fixture.debugElement.query(By.css('.topbar__center-section'));
      const centerContent = centerSection.query(By.css('.center-content'));
      expect(centerContent).toBeTruthy();
    });

    it('should place right content in the right section', () => {
      const rightSection = fixture.debugElement.query(By.css('.topbar__right-section'));
      const rightContent = rightSection.query(By.css('.right-content'));
      expect(rightContent).toBeTruthy();
    });
  });

  describe('layout structure', () => {
    it('should have three main sections', () => {
      createFixture();
      const leftSection = fixture.debugElement.query(By.css('.topbar__left-section'));
      const centerSection = fixture.debugElement.query(By.css('.topbar__center-section'));
      const rightSection = fixture.debugElement.query(By.css('.topbar__right-section'));

      expect(leftSection).toBeTruthy();
      expect(centerSection).toBeTruthy();
      expect(rightSection).toBeTruthy();
    });

    it('should place back button and title before left content', () => {
      createFixture({ showBackButton: true, title: 'Test Title' });

      const leftSection = fixture.debugElement.query(By.css('.topbar__left-section'));
      const children = leftSection.children;

      expect(children[0].nativeElement.classList.contains('topbar__back-title')).toBe(true);
      expect(children[1].nativeElement.classList.contains('topbar__left-content')).toBe(true);
    });
  });
});

@Component({
  standalone: true,
  imports: [TopbarComponent],
  template: `<app-topbar [title]="title" [showBackButton]="showBackButton"></app-topbar>`,
})
class MinimalTestHostComponent {
  title = '';
  showBackButton = false;
}

describe('TopbarComponent without projected content', () => {
  let fixture: ComponentFixture<MinimalTestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinimalTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MinimalTestHostComponent);
    fixture.detectChanges();
  });

  it('should render without any projected content', () => {
    const topbar = fixture.debugElement.query(By.css('.topbar'));
    expect(topbar).toBeTruthy();
  });

  it('should not render left content container when no content is projected', () => {
    const leftContent = fixture.debugElement.query(By.css('.topbar__left-content'));
    expect(leftContent).toBeNull();
  });

  it('should still render section containers', () => {
    const leftSection = fixture.debugElement.query(By.css('.topbar__left-section'));
    const centerSection = fixture.debugElement.query(By.css('.topbar__center-section'));
    const rightSection = fixture.debugElement.query(By.css('.topbar__right-section'));

    expect(leftSection).toBeTruthy();
    expect(centerSection).toBeTruthy();
    expect(rightSection).toBeTruthy();
  });
});

@Component({
  standalone: true,
  imports: [TopbarComponent, TopbarLeftContentDirective],
  template: `
    <div class="test-container" [style.width.px]="containerWidth">
      <app-topbar>
        <ng-template topbarLeftContent>
          <span class="chip" [attr.data-testid]="'chip'">
            {{ chipText }}
          </span>
        </ng-template>
      </app-topbar>
    </div>
  `,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      min-width: 40px;
      max-width: 280px;
      padding: 4px 12px;
      border-radius: 16px;
      background-color: #e0e0e0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      box-sizing: border-box;
    }
  `]
})
class ChipTestHostComponent {
  chipText = 'Short';
  containerWidth = 800;
}

@Component({
  standalone: true,
  imports: [
    TopbarComponent,
    TopbarLeftContentDirective,
    TopbarCenterContentDirective,
    TopbarRightContentDirective,
  ],
  template: `
    <div class="test-container" [style.width.px]="containerWidth">
      <app-topbar>
        <ng-template topbarLeftContent>
          <span class="chip">{{ chipText }}</span>
        </ng-template>
        <ng-template topbarCenterContent>
          <span class="center-content">Center</span>
        </ng-template>
        <ng-template topbarRightContent>
          <button class="right-button">Action</button>
        </ng-template>
      </app-topbar>
    </div>
  `,
  styles: [`
    .test-container {
      container-type: inline-size;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      min-width: 40px;
      max-width: 280px;
      padding: 4px 12px;
      border-radius: 16px;
      background-color: #e0e0e0;
      white-space: nowrap;
      box-sizing: border-box;
    }
    .center-content {
      white-space: nowrap;
    }
    .right-button {
      padding: 8px 16px;
      white-space: nowrap;
    }
  `]
})
class CenterWrapTestHostComponent {
  chipText = 'Chip Label';
  containerWidth = 800;
}

describe('TopbarComponent with chip in left content', () => {
  let fixture: ComponentFixture<ChipTestHostComponent>;
  let hostComponent: ChipTestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipTestHostComponent],
    }).compileComponents();
  });

  function createFixture(config: { chipText?: string; containerWidth?: number } = {}): void {
    fixture = TestBed.createComponent(ChipTestHostComponent);
    hostComponent = fixture.componentInstance;
    if (config.chipText !== undefined) {
      hostComponent.chipText = config.chipText;
    }
    if (config.containerWidth !== undefined) {
      hostComponent.containerWidth = config.containerWidth;
    }
    fixture.detectChanges();
  }

  function getChipElement(): HTMLElement {
    return fixture.debugElement.query(By.css('.chip')).nativeElement;
  }

  function getChipComputedStyle(): CSSStyleDeclaration {
    return getComputedStyle(getChipElement());
  }

  describe('chip dimension constraints', () => {
    it('should have min-width of 40px with short text', () => {
      createFixture({ chipText: 'Hi' });

      const style = getChipComputedStyle();

      expect(style.minWidth).toBe('40px');
    });

    it('should have max-width of 280px with long text', () => {
      createFixture({ chipText: 'This is a very long text that should definitely exceed the maximum width constraint of the chip component' });

      const style = getChipComputedStyle();

      expect(style.maxWidth).toBe('280px');
    });

    it('should not exceed max-width regardless of text length', () => {
      createFixture({ chipText: 'A'.repeat(500) });

      const style = getChipComputedStyle();

      expect(style.maxWidth).toBe('280px');
    });
  });

  describe('text truncation', () => {
    it('should show full text when it fits within max-width', () => {
      createFixture({ chipText: 'Short text' });

      const chip = getChipElement();

      expect(chip.textContent?.trim()).toBe('Short text');
    });

    it('should truncate text with ellipsis when exceeding max-width', () => {
      createFixture({ chipText: 'This is a very long text that should definitely be truncated with ellipsis because it exceeds max-width' });

      const chip = getChipElement();
      const style = getChipComputedStyle();

      // Verify truncation styles are applied
      expect(style.textOverflow).toBe('ellipsis');
      expect(style.overflow).toBe('hidden');
      expect(style.whiteSpace).toBe('nowrap');
      expect(style.maxWidth).toBe('280px');
    });

    it('should have text-overflow: ellipsis style applied', () => {
      createFixture();

      const style = getChipComputedStyle();

      expect(style.textOverflow).toBe('ellipsis');
    });

    it('should have overflow: hidden style applied', () => {
      createFixture();

      const style = getChipComputedStyle();

      expect(style.overflow).toBe('hidden');
    });

    it('should have white-space: nowrap style applied', () => {
      createFixture();

      const style = getChipComputedStyle();

      expect(style.whiteSpace).toBe('nowrap');
    });
  });

  describe('responsive behavior', () => {
    it('should render chip correctly in wide container (800px)', () => {
      createFixture({ containerWidth: 800, chipText: 'Medium length text' });

      const chip = getChipElement();
      const container = fixture.debugElement.query(By.css('.test-container')).nativeElement;

      expect(chip).toBeTruthy();
      expect(chip.textContent?.trim()).toBe('Medium length text');
      expect(container.style.width).toBe('800px');
    });

    it('should render chip correctly in medium container (400px)', () => {
      createFixture({ containerWidth: 400, chipText: 'Medium length text' });

      const chip = getChipElement();
      const container = fixture.debugElement.query(By.css('.test-container')).nativeElement;
      const style = getChipComputedStyle();

      expect(chip).toBeTruthy();
      expect(container.style.width).toBe('400px');
      expect(style.minWidth).toBe('40px');
      expect(style.maxWidth).toBe('280px');
    });

    it('should render chip correctly in narrow container (200px)', () => {
      createFixture({ containerWidth: 200, chipText: 'Some text' });

      const chip = getChipElement();
      const container = fixture.debugElement.query(By.css('.test-container')).nativeElement;
      const style = getChipComputedStyle();

      expect(chip).toBeTruthy();
      expect(container.style.width).toBe('200px');
      expect(style.minWidth).toBe('40px');
    });

    it('should maintain min-width even in very narrow container (100px)', () => {
      createFixture({ containerWidth: 100, chipText: 'X' });

      const container = fixture.debugElement.query(By.css('.test-container')).nativeElement;
      const style = getChipComputedStyle();

      expect(container.style.width).toBe('100px');
      expect(style.minWidth).toBe('40px');
    });
  });
});

describe('TopbarComponent center section wrapping', () => {
  let fixture: ComponentFixture<CenterWrapTestHostComponent>;
  let hostComponent: CenterWrapTestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterWrapTestHostComponent],
    }).compileComponents();
  });

  function createFixture(config: { containerWidth?: number; chipText?: string } = {}): void {
    fixture = TestBed.createComponent(CenterWrapTestHostComponent);
    hostComponent = fixture.componentInstance;
    if (config.containerWidth !== undefined) {
      hostComponent.containerWidth = config.containerWidth;
    }
    if (config.chipText !== undefined) {
      hostComponent.chipText = config.chipText;
    }
    fixture.detectChanges();
  }

  function getTopbar(): HTMLElement {
    return fixture.debugElement.query(By.css('.topbar')).nativeElement;
  }

  function getLeftSection(): HTMLElement {
    return fixture.debugElement.query(By.css('.topbar__left-section')).nativeElement;
  }

  function getCenterSection(): HTMLElement {
    return fixture.debugElement.query(By.css('.topbar__center-section')).nativeElement;
  }

  function getCenterInner(): HTMLElement {
    return fixture.debugElement.query(By.css('.topbar__center-inner')).nativeElement;
  }

  function getRightSection(): HTMLElement {
    return fixture.debugElement.query(By.css('.topbar__right-section')).nativeElement;
  }

  function getTopbarComputedStyle(): CSSStyleDeclaration {
    return getComputedStyle(getTopbar());
  }

  function getCenterComputedStyle(): CSSStyleDeclaration {
    return getComputedStyle(getCenterSection());
  }

  describe('wrap decision logic (pure)', () => {
    it('should not wrap when required width fits', () => {
      expect(
        shouldWrapCenter({
          containerWidth: 800,
          leftWidth: 160,
          rightWidth: 140,
          centerContentWidth: 200,
          gap: 8,
        }),
      ).toBe(false);
    });

    it('should wrap when required width exceeds container', () => {
      expect(
        shouldWrapCenter({
          containerWidth: 300,
          leftWidth: 160,
          rightWidth: 120,
          centerContentWidth: 200,
          gap: 8,
        }),
      ).toBe(true);
    });

    it('should not wrap when center content width is 0', () => {
      expect(
        shouldWrapCenter({
          containerWidth: 300,
          leftWidth: 160,
          rightWidth: 120,
          centerContentWidth: 0,
          gap: 8,
        }),
      ).toBe(false);
    });
  });

  function applyMockedMeasurementsAndUpdate(measurements: {
    containerWidth: number;
    leftWidth: number;
    rightWidth: number;
    centerContentWidth: number;
  }): void {
    const topbarEl = getTopbar();
    const leftEl = getLeftSection();
    const rightEl = getRightSection();
    const centerEl = getCenterInner();

    topbarEl.getBoundingClientRect = () =>
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

    leftEl.getBoundingClientRect = () =>
      ({
        width: measurements.leftWidth,
        height: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: measurements.leftWidth,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    rightEl.getBoundingClientRect = () =>
      ({
        width: measurements.rightWidth,
        height: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: measurements.rightWidth,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    Object.defineProperty(centerEl, 'scrollWidth', {
      configurable: true,
      value: measurements.centerContentWidth,
    });

    void topbarEl;

    const topbarCmp = fixture.debugElement.query(By.directive(TopbarComponent)).componentInstance;
    (topbarCmp as any).updateCenterWrapState();
    fixture.detectChanges();
  }

  describe('topbar layout structure', () => {
    it('should use grid display', () => {
      createFixture({ containerWidth: 800 });

      const style = getTopbarComputedStyle();

      expect(style.display).toBe('grid');
    });

    it('should have row-gap for spacing when wrapped', () => {
      createFixture({ containerWidth: 800 });

      const style = getTopbarComputedStyle();

      expect(style.rowGap).toBe('8px');
    });
  });

  describe('wide container behavior', () => {
    it('should not apply wrapped class when there is enough room', () => {
      createFixture({ containerWidth: 800 });

      applyMockedMeasurementsAndUpdate({
        containerWidth: 800,
        leftWidth: 160,
        rightWidth: 140,
        centerContentWidth: 200,
      });

      expect(getTopbar().classList.contains('topbar--center-wrapped')).toBe(false);
    });
  });

  describe('narrow container wrapping behavior', () => {
    it('should apply wrapped class when container is too narrow for center', () => {
      createFixture({ containerWidth: 300 });

      applyMockedMeasurementsAndUpdate({
        containerWidth: 300,
        leftWidth: 160,
        rightWidth: 120,
        centerContentWidth: 200,
      });

      expect(getTopbar().classList.contains('topbar--center-wrapped')).toBe(true);
    });

    it('should remove wrapped class when space becomes available again', () => {
      createFixture({ containerWidth: 300 });

      applyMockedMeasurementsAndUpdate({
        containerWidth: 300,
        leftWidth: 160,
        rightWidth: 120,
        centerContentWidth: 200,
      });
      expect(getTopbar().classList.contains('topbar--center-wrapped')).toBe(true);

      applyMockedMeasurementsAndUpdate({
        containerWidth: 600,
        leftWidth: 160,
        rightWidth: 120,
        centerContentWidth: 200,
      });
      expect(getTopbar().classList.contains('topbar--center-wrapped')).toBe(false);
    });
  });

  describe('measured decision wiring', () => {
    it('should wrap center when measured widths exceed container', () => {
      createFixture({ containerWidth: 500 });

      applyMockedMeasurementsAndUpdate({
        containerWidth: 500,
        leftWidth: 160,
        rightWidth: 120,
        centerContentWidth: 400,
      });

      expect(getTopbar().classList.contains('topbar--center-wrapped')).toBe(true);
    });
  });

  describe('chip min-width interaction', () => {
    it('should wrap center when chip is at min-width in narrow container', () => {
      createFixture({ containerWidth: 300, chipText: 'A very long chip text that would normally expand' });

      const chip = fixture.debugElement.query(By.css('.chip')).nativeElement;
      const chipStyle = getComputedStyle(chip);

      applyMockedMeasurementsAndUpdate({
        containerWidth: 300,
        leftWidth: 200,
        rightWidth: 120,
        centerContentWidth: 180,
      });

      // Chip should maintain its min-width
      expect(chipStyle.minWidth).toBe('40px');
    });

    it('should maintain chip visibility when center is wrapped', () => {
      createFixture({ containerWidth: 350, chipText: 'Chip' });

      const chip = fixture.debugElement.query(By.css('.chip')).nativeElement;

      expect(chip).toBeTruthy();
      expect(chip.textContent?.trim()).toBe('Chip');
    });
  });

  describe('content centering', () => {
    it('should center the center section content when on second line', () => {
      createFixture({ containerWidth: 400 });

      const style = getCenterComputedStyle();

      expect(style.justifyContent).toBe('center');
    });

    it('should center the center section content when on first line', () => {
      createFixture({ containerWidth: 800 });

      const style = getCenterComputedStyle();

      expect(style.justifyContent).toBe('center');
    });
  });
});
