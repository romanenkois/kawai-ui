import { KAWAI_LABEL_DEFAULTS } from '../../directives/label/label.constant';
import type { NumberStepperDefaults } from './number-stepper.model';

/**
 * Library defaults for every number stepper configuration input: the bottom of the chain
 * input → `provideKawaiDefaults()` levels (nearest first) → these.
 */
export const KAWAI_NUMBER_STEPPER_DEFAULTS: Readonly<NumberStepperDefaults> = {
  label: KAWAI_LABEL_DEFAULTS,
  decreaseLabel: 'Decrease {label}',
  increaseLabel: 'Increase {label}',
};
