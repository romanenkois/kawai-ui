import { Component, signal } from '@angular/core';
import { LabelDirective, NumberStepperComponent, provideKawaiDefaults } from 'kawai-ui';

/**
 * `kawaiLabel` on the app's own form labels, next to a library component. The page sets the
 * shared `label` defaults (end-aligned, beside the control), so its own labels and the
 * stepper's label line up the same way.
 */
@Component({
  selector: 'app-label-page',
  imports: [LabelDirective, NumberStepperComponent],
  providers: [provideKawaiDefaults({ label: { align: 'end', position: 'start' } })],
  template: `
    <section class="page">
      <h1>Label</h1>
      <form class="form" (submit)="$event.preventDefault()">
        <label kawaiLabel="Email" for="email"></label>
        <input id="email" type="email" autocomplete="email" />

        <label
          kawaiLabel="Delivery instructions for the courier, if any"
          for="instructions"
        ></label>
        <input id="instructions" type="text" />

        <kawai-number-stepper
          class="stepper"
          label="Parcels"
          [value]="parcels()"
          [min]="1"
          [max]="5"
          (valueChange)="parcels.set($event)"
        />
      </form>
      <p class="note">
        All three labels are end-aligned and beside their control by this page's
        <code>label</code> defaults. The second one is cut off: hover it, or focus its field with
        the keyboard.
      </p>
    </section>
  `,
  styles: `
    .form,
    .stepper {
      display: grid;
      grid-template-columns: 9rem minmax(0, 1fr);
      gap: var(--kawai-sys-space-lg);
      align-items: center;
    }

    .stepper {
      grid-column: 1 / -1;
      --kawai-comp-number-stepper-label-width: 9rem;
    }

    label {
      color: var(--kawai-sys-color-text-muted);
    }
  `,
})
export class LabelPage {
  protected readonly parcels = signal<number>(1);
}
