import { Directive } from '@angular/core';

@Directive({
  selector: '[topbarLeftContent]',
  standalone: true,
})
export class TopbarLeftContentDirective {}

@Directive({
  selector: '[topbarCenterContent]',
  standalone: true,
})
export class TopbarCenterContentDirective {}

@Directive({
  selector: '[topbarRightContent]',
  standalone: true,
})
export class TopbarRightContentDirective {}
