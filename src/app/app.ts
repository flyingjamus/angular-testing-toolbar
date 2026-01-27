import { Component } from '@angular/core';
import {
  TopbarComponent,
  TopbarLeftContentDirective,
  TopbarCenterContentDirective,
  TopbarRightContentDirective,
} from './topbar';

@Component({
  selector: 'app-root',
  imports: [
    TopbarComponent,
    TopbarLeftContentDirective,
    TopbarCenterContentDirective,
    TopbarRightContentDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  onBackClick(): void {
    console.log('Back button clicked');
  }
}
