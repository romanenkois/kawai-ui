import { KAWAI_LABEL_DEFAULTS } from '../../shared/label/label.constant';
import type { SegmentedControlDefaults } from './segmented-control.model';

/**
 * Library defaults for every segmented control configuration input: the bottom of the chain
 * input → `provideKawaiDefaults()` levels (nearest first) → these.
 */
export const KAWAI_SEGMENTED_CONTROL_DEFAULTS: Readonly<SegmentedControlDefaults> = {
  label: KAWAI_LABEL_DEFAULTS,
};
