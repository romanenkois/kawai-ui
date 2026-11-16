import type { KawaiLabelOptions } from './label.model';

/**
 * Library defaults for `kawaiLabel` and for every component label or heading: the bottom of the
 * chain input → `provideKawaiDefaults()` levels → these.
 */
export const KAWAI_LABEL_DEFAULTS: Readonly<KawaiLabelOptions> = {
  text: '',
  truncate: true,
  tooltip: {},
  align: 'start',
  position: 'top',
};
