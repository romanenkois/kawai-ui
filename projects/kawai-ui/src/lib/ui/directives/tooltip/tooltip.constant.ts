import type { TooltipOptions } from './tooltip.model';

/**
 * Library defaults for `kawaiTooltip`: the bottom of the chain
 * input → `provideKawaiDefaults()` levels (nearest first) → these.
 */
export const KAWAI_TOOLTIP_DEFAULTS: Readonly<TooltipOptions> = {
  text: '',
  position: 'bottom',
  onlyWhenTruncated: false,
};
