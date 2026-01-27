import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TopbarComponent } from './topbar.component';
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
