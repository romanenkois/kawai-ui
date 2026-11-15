import type { ArgTypes } from '@storybook/angular';

import type {
  KawaiDeepPartial,
  KawaiLabelAlign,
  KawaiLabelOptions,
  TooltipPosition,
} from '../../src/public-api';

/** `label` options flattened into separate Storybook controls. */
export interface LabelArgs {
  labelText: string;
  labelTruncate: boolean;
  labelTooltip: TooltipPosition | 'none';
  labelAlign: KawaiLabelAlign;
}

export const LABEL_ARGS: LabelArgs = {
  labelText: 'Label',
  labelTruncate: true,
  labelTooltip: 'bottom',
  labelAlign: 'start',
};

export const LABEL_ARG_TYPES: Partial<ArgTypes<LabelArgs>> = {
  labelText: { description: '`label.text`, or `label` as a shorthand.' },
  labelTruncate: { description: '`label.truncate`' },
  labelTooltip: {
    description: '`label.tooltip.position`; `none` is `label.tooltip: null`.',
    control: 'inline-radio',
    options: ['top', 'bottom', 'left', 'right', 'none'],
  },
  labelAlign: {
    description: '`label.align` within the label area (see the label width token).',
    control: 'inline-radio',
    options: ['start', 'center', 'end'],
  },
};

/** Rebuilds the `label` options object from the flattened controls. */
export function labelOptions(args: LabelArgs): KawaiDeepPartial<KawaiLabelOptions> {
  return {
    text: args.labelText,
    truncate: args.labelTruncate,
    tooltip: args.labelTooltip === 'none' ? null : { position: args.labelTooltip },
    align: args.labelAlign,
  };
}
