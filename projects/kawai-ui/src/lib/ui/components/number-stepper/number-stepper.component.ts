import { Component, computed, effect, input, isDevMode, output } from '@angular/core';

import { injectKawaiDefaults } from '../../../defaults/kawai-defaults';
import { KawaiDeepPartial, resolveValueChain } from '../../../utils/options';
import { LabelDirective } from '../../directives/label/label.directive';
import { KawaiLabelOptions } from '../../directives/label/label.model';
import { resolveLabelChain } from '../../directives/label/label.util';
import { KAWAI_NUMBER_STEPPER_DEFAULTS } from './number-stepper.constant';

/** Stands for the label text in `decreaseLabel` and `increaseLabel`. */
const LABEL_PLACEHOLDER = '{label}';

let nextId = 0;

/**
 * A labelled integer field with − and + buttons. Stateless: the parent owns `value`.
 * `valueChange` fires on every step and on every typed value that is a whole number within
 * `min`..`max`; anything else is left in the field until blur, which restores `value`.
 * The buttons use `aria-disabled` at the bounds so they keep focus while clicking.
 *
 * `label` takes the text or {@link KawaiLabelOptions}; it sits above the field, or beside it
 * with `position: 'start'`. `decreaseLabel` and `increaseLabel` name
 * the buttons, for translation. Configuration left out comes from `provideKawaiDefaults()`
 * levels, then `KAWAI_NUMBER_STEPPER_DEFAULTS`.
 */
@Component({
  selector: 'kawai-number-stepper',
  host: { '[class.label-start]': "labelOptions().position === 'start'" },
  imports: [LabelDirective],
  templateUrl: './number-stepper.component.html',
  styleUrl: './number-stepper.component.scss',
})
export class NumberStepperComponent {
  /** Label text, or {@link KawaiLabelOptions}. Its text also names the field and buttons. */
  readonly label = input.required<string | KawaiDeepPartial<KawaiLabelOptions>>();
  /**
   * Accessible name of the − button; `{label}` is replaced with the label text. Default
   * `Decrease {label}`.
   */
  readonly decreaseLabel = input<string>();
  /**
   * Accessible name of the + button; `{label}` is replaced with the label text. Default
   * `Increase {label}`.
   */
  readonly increaseLabel = input<string>();
  readonly value = input.required<number>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly valueChange = output<number>();

  private readonly defaultLevels = injectKawaiDefaults();
  protected readonly labelOptions = computed<KawaiLabelOptions>(() =>
    resolveLabelChain(
      this.defaultLevels(),
      (level) => level.numberStepper?.label,
      this.label(),
      KAWAI_NUMBER_STEPPER_DEFAULTS.label,
    ),
  );
  protected readonly decreaseName = computed<string>(() =>
    resolveValueChain(
      [
        ...this.defaultLevels().map((level) => level.numberStepper?.decreaseLabel),
        this.decreaseLabel(),
      ],
      KAWAI_NUMBER_STEPPER_DEFAULTS.decreaseLabel,
    ).replaceAll(LABEL_PLACEHOLDER, this.labelOptions().text),
  );
  protected readonly increaseName = computed<string>(() =>
    resolveValueChain(
      [
        ...this.defaultLevels().map((level) => level.numberStepper?.increaseLabel),
        this.increaseLabel(),
      ],
      KAWAI_NUMBER_STEPPER_DEFAULTS.increaseLabel,
    ).replaceAll(LABEL_PLACEHOLDER, this.labelOptions().text),
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
