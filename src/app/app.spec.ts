import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { By } from '@angular/platform-browser';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render topbar with title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const titleElement = fixture.debugElement.query(By.css('.topbar__title'));
    expect(titleElement.nativeElement.textContent).toBe('Dashboard');
  });
});
