import { Component, input, output } from '@angular/core';

let nextId = 0;

/**
 * A labelled integer field with − and + buttons. Stateless: the parent owns `value`.
 * `valueChange` fires on every step and on every typed value that is a whole number within
 * `min`..`max`; anything else is left in the field until blur, which restores `value`.
 * The buttons use `aria-disabled` at the bounds so they keep focus while clicking.
 */
@Component({
  selector: 'kawai-number-stepper',
  templateUrl: './number-stepper.component.html',
  styles: `
    :host {
      display: grid;
      grid-template-columns: fit-content(50%) minmax(0, 1fr);
      gap: 0 var(--kawai-comp-number-stepper-gap, var(--kawai-sys-space-lg));
      align-items: center;
      font-family: var(--kawai-sys-font-family);
    }

    label {
      color: var(--kawai-comp-number-stepper-label-color, var(--kawai-sys-color-text-muted));
    }

    .stepper {
      display: flex;
      min-inline-size: 0;
    }

    input,
    button {
      box-sizing: border-box;
      margin: 0;
      border: var(--kawai-sys-border-width) solid
        var(--kawai-comp-number-stepper-border-color, var(--kawai-sys-color-border));
      background: none;
      font: inherit;
    }

    input {
      flex: 1 1 0;
      min-inline-size: 0;
      padding: var(--kawai-comp-number-stepper-input-padding, 0 var(--kawai-sys-space-xs));
      border-inline-width: 0;
      color: var(--kawai-comp-number-stepper-input-color, var(--kawai-sys-color-text));
      text-align: center;
      font-variant-numeric: tabular-nums;
      appearance: textfield;
    }

    input::-webkit-inner-spin-button,
    input::-webkit-outer-spin-button {
      appearance: none;
      margin: 0;
    }

    button {
      flex: none;
      padding: var(--kawai-comp-number-stepper-button-padding, 0 var(--kawai-sys-space-md));
      color: var(--kawai-comp-number-stepper-button-color, var(--kawai-sys-color-primary));
      cursor: pointer;
    }

    button:first-child {
      border-start-start-radius: var(
        --kawai-comp-number-stepper-radius,
        var(--kawai-sys-radius-sm)
      );
      border-end-start-radius: var(--kawai-comp-number-stepper-radius, var(--kawai-sys-radius-sm));
    }

    button:last-child {
      border-start-end-radius: var(--kawai-comp-number-stepper-radius, var(--kawai-sys-radius-sm));
      border-end-end-radius: var(--kawai-comp-number-stepper-radius, var(--kawai-sys-radius-sm));
    }

    button:hover:not([aria-disabled='true']) {
      background: var(
        --kawai-comp-number-stepper-button-background-hover,
        var(--kawai-sys-color-surface-hover)
      );
      color: var(
        --kawai-comp-number-stepper-button-color-hover,
        var(--kawai-sys-color-primary-hover)
      );
    }

    button[aria-disabled='true'] {
      color: var(
        --kawai-comp-number-stepper-button-color-disabled,
        var(--kawai-sys-color-text-muted)
      );
      cursor: default;
    }

    input:focus-visible,
    button:focus-visible {
      outline: var(--kawai-sys-focus-ring-width) solid
        var(--kawai-comp-number-stepper-focus-ring-color, var(--kawai-sys-color-primary));
      outline-offset: 1px;
    }
  `,
})
export class NumberStepperComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly valueChange = output<number>();

  protected readonly inputId = `kawai-number-stepper-${nextId++}`;

  protected step(delta: number): void {
    this.commit(this.value() + delta);
  }

  protected typed(field: HTMLInputElement): void {
    this.commit(field.valueAsNumber);
  }

  protected restore(field: HTMLInputElement): void {
    field.value = `${this.value()}`;
  }

  private commit(value: number): void {
    const valid = Number.isInteger(value) && value >= this.min() && value <= this.max();
    if (valid && value !== this.value()) this.valueChange.emit(value);
  }
}
