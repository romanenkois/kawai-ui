import { KAWAI_LABEL_DEFAULTS } from '../../shared/label/label.constant';
import type { AccordionDefaults } from './accordion.model';

/**
 * Library defaults for every accordion configuration input: the bottom of the chain
 * input → `provideKawaiDefaults()` levels (nearest first) → these.
 */
export const KAWAI_ACCORDION_DEFAULTS: Readonly<AccordionDefaults> = {
  heading: KAWAI_LABEL_DEFAULTS,
  indicator: {
    position: 'end',
    // The component turns this off for a `kawaiAccordionIndicator` template unless a level sets it.
    rotate: true,
  },
  layout: {
    body: 'attached',
    innerCorners: 'rounded',
    border: true,
  },
  overflow: 'hidden',
};
