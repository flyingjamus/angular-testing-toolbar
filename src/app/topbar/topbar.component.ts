import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TopbarLeftContentDirective,
  TopbarCenterContentDirective,
  TopbarRightContentDirective,
} from './topbar.directives';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  @Input() title = '';
  @Input() showBackButton = false;

  @Output() backClick = new EventEmitter<void>();

  @ContentChild(TopbarLeftContentDirective, { read: TemplateRef })
  leftContent?: TemplateRef<unknown>;

  @ContentChild(TopbarCenterContentDirective, { read: TemplateRef })
  centerContent?: TemplateRef<unknown>;

  @ContentChild(TopbarRightContentDirective, { read: TemplateRef })
  rightContent?: TemplateRef<unknown>;

  onBackClick(): void {
    this.backClick.emit();
  }
}
