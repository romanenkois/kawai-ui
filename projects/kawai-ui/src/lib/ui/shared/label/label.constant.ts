import type { KawaiLabelOptions } from './label.model';

/** Library defaults for a label or heading; components use them in their own defaults. */
export const KAWAI_LABEL_DEFAULTS: Readonly<KawaiLabelOptions> = {
  text: '',
  truncate: true,
  tooltip: {},
  align: 'start',
};
