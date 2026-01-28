import { Component } from '@angular/core';
import { LdsDesignerHeaderComponent } from './designer-header';

@Component({
  selector: 'app-root',
  imports: [LdsDesignerHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  onBackClick(): void {
    console.log('Back button clicked');
  }
}
