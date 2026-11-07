import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

let nextId = 0;

/**
 * A labelled integer field with − and + buttons. Stateless: the parent owns `value`.
 * `valueChange` fires on every step and on every typed value that is a whole number within
 * `min`..`max`; anything else is left in the field until blur, which restores `value`.
 * The buttons use `aria-disabled` at the bounds so they keep focus while clicking.
 */
@Component({
  selector: 'app-number-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './number-stepper.component.html',
  styles: `
    :host {
      display: grid;
      grid-template-columns: fit-content(50%) minmax(0, 1fr);
      gap: 0 0.75rem;
      align-items: center;
    }

    label {
      color: var(--color-text-muted);
    }

    .stepper {
      display: flex;
      min-inline-size: 0;
    }

    input,
    button {
      box-sizing: border-box;
      margin: 0;
      border: 1px solid var(--color-border);
      background: none;
      font: inherit;
    }

    input {
      flex: 1 1 0;
      min-inline-size: 0;
      padding: 0 0.25rem;
      border-inline-width: 0;
      color: var(--color-text);
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
      padding: 0 0.5rem;
      color: var(--color-primary);
      cursor: pointer;
    }

    button:first-child {
      border-radius: 0.25rem 0 0 0.25rem;
    }

    button:last-child {
      border-radius: 0 0.25rem 0.25rem 0;
    }

    button:hover:not([aria-disabled='true']) {
      background: var(--color-surface-hover);
      color: var(--color-primary-hover);
    }

    button[aria-disabled='true'] {
      color: var(--color-text-muted);
      cursor: default;
    }

    input:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--color-primary);
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

  protected readonly inputId = `number-stepper-${nextId++}`;

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
