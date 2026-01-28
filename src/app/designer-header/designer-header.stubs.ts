import { Component, Directive, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// Stub directives for lds-icon-button
@Directive({
  selector: '[lds-icon-button]',
  standalone: true,
})
export class LdsIconButtonStubDirective {
  @Input() icon = '';
  @Input() miniButton = false;
}

// Stub directives for lds-button
@Directive({
  selector: '[lds-button]',
  standalone: true,
})
export class LdsButtonStubDirective {
  @Input() appearance = '';
  @Input() color = '';
  @Input() miniButton = false;
}

// Stub component for lds-divider
@Component({
  selector: 'lds-divider',
  standalone: true,
  template: '<div class="lds-divider-stub"></div>',
  styles: [
    `
      :host {
        display: block;
      }
      :host([vertical='true']) {
        width: 1px;
        height: 100%;
        background: #e0e0e0;
      }
      .lds-divider-stub {
        width: 100%;
        height: 100%;
        background: inherit;
      }
    `,
  ],
})
export class LdsDividerStubComponent {
  @Input() vertical = false;
}

// Stub component for lds-expandable-input
@Component({
  selector: 'lds-expandable-input',
  standalone: true,
  template: `<input
    class="lds-expandable-input-stub"
    [placeholder]="placeholder"
    [disabled]="disabled"
    [value]="value"
    [attr.aria-label]="ariaLabel"
    [attr.data-testid]="inputTestId"
    (input)="onInput($event)"
  />`,
  styles: [
    `
      :host {
        display: inline-flex;
        min-width: 100px;
        flex: 1 1 auto;
      }
      .lds-expandable-input-stub {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LdsExpandableInputStubComponent),
      multi: true,
    },
  ],
})
export class LdsExpandableInputStubComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() weakStyle = false;
  @Input() inputTestId = '';
  @Input() ariaLabel = '';
  @Input() noInteraction = false;
  @Input() small = false;

  value = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }
}

// Stub directive for ldsTooltip
@Directive({
  selector: '[ldsTooltip]',
  standalone: true,
})
export class LdsTooltipStubDirective {
  @Input() ldsTooltip = '';
  @Input() ldsTooltipShowOnOverflow = false;
}

// Stub directive for ldsOverflowDetector
@Directive({
  selector: '[ldsOverflowDetector]',
  standalone: true,
})
export class LdsOverflowDetectorStubDirective {}

// Stub directive for ldsForbiddenChars
@Directive({
  selector: '[ldsForbiddenChars]',
  standalone: true,
})
export class LdsForbiddenCharsStubDirective {
  @Input() ldsForbiddenChars = '';
}

// Stub directive for matMenuTriggerFor
@Directive({
  selector: '[matMenuTriggerFor]',
  standalone: true,
})
export class MatMenuTriggerForStubDirective {
  @Input() matMenuTriggerFor: unknown;
}

export const DESIGNER_HEADER_STUBS = [
  LdsIconButtonStubDirective,
  LdsButtonStubDirective,
  LdsDividerStubComponent,
  LdsExpandableInputStubComponent,
  LdsTooltipStubDirective,
  LdsOverflowDetectorStubDirective,
  LdsForbiddenCharsStubDirective,
  MatMenuTriggerForStubDirective,
];
