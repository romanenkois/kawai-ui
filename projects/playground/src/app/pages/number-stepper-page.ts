import { Component, computed, signal } from '@angular/core';
import { NumberStepperComponent } from 'kawai-ui';

const UNIT_PRICE = 6;

/** A quantity picker. The page owns the value and derives the total from it. */
@Component({
  selector: 'app-number-stepper-page',
  imports: [NumberStepperComponent],
  template: `
    <section class="page">
      <h1>Number stepper</h1>
      <kawai-number-stepper
        label="Quantity"
        [value]="quantity()"
        [min]="1"
        [max]="10"
        (valueChange)="quantity.set($event)"
      />
      <p class="note" aria-live="polite">Total: {{ total() }} (1 to 10 per order)</p>
    </section>
  `,
})
export class NumberStepperPage {
  protected readonly quantity = signal<number>(2);
  protected readonly total = computed<string>(
    () => `€${(this.quantity() * UNIT_PRICE).toFixed(2)}`,
  );
}
