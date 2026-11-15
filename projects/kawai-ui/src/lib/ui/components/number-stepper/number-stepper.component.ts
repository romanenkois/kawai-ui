import { Component, computed, effect, input, isDevMode, output } from '@angular/core';

import { injectKawaiDefaults } from '../../../defaults/kawai-defaults';
import { KawaiDeepPartial, resolveOptionsChain } from '../../../utils/options';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { TooltipOptions } from '../../directives/tooltip/tooltip.model';
import { KawaiLabelOptions } from '../../shared/label/label.model';
import { labelTooltip } from '../../shared/label/label.util';
import { KAWAI_NUMBER_STEPPER_DEFAULTS } from './number-stepper.constant';

let nextId = 0;

/**
 * A labelled integer field with − and + buttons. Stateless: the parent owns `value`.
 * `valueChange` fires on every step and on every typed value that is a whole number within
 * `min`..`max`; anything else is left in the field until blur, which restores `value`.
 * The buttons use `aria-disabled` at the bounds so they keep focus while clicking.
 *
 * `label` takes the text or {@link KawaiLabelOptions}; options left out come from
 * `provideKawaiDefaults()` levels, then `KAWAI_NUMBER_STEPPER_DEFAULTS`.
 */
@Component({
  selector: 'kawai-number-stepper',
  imports: [TooltipDirective],
  templateUrl: './number-stepper.component.html',
  styleUrl: './number-stepper.component.scss',
})
export class NumberStepperComponent {
  /** Label text, or {@link KawaiLabelOptions}. Its text also names the field and buttons. */
  readonly label = input.required<string | KawaiDeepPartial<KawaiLabelOptions>>();
  readonly value = input.required<number>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly valueChange = output<number>();

  private readonly defaultLevels = injectKawaiDefaults();
  protected readonly labelOptions = computed<KawaiLabelOptions>(() =>
    resolveOptionsChain(
      [...this.defaultLevels().map((level) => level.numberStepper?.label), this.label()],
      KAWAI_NUMBER_STEPPER_DEFAULTS.label,
      'text',
    ),
  );
  /** Full-text tooltip for a truncated label. */
  protected readonly labelTooltip = computed<KawaiDeepPartial<TooltipOptions> | null>(() =>
    labelTooltip(this.labelOptions()),
  );

  protected readonly inputId = `kawai-number-stepper-${nextId++}`;

  constructor() {
    if (isDevMode()) {
      effect(() => {
        if (this.labelOptions().text) return;
        console.warn(
          'kawai-number-stepper: `label` has no text, so the field and its buttons have no ' +
            'accessible name.',
        );
      });
    }
  }

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
