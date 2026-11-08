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
  styleUrl: './number-stepper.component.scss',
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
