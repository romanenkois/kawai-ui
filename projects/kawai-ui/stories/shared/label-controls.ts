import type { ArgTypes } from '@storybook/angular';

import type {
  KawaiDeepPartial,
  KawaiLabelAlign,
  KawaiLabelOptions,
  KawaiLabelPosition,
  TooltipPosition,
} from '../../src/public-api';

/**
 * `label` options flattened into separate Storybook controls. No arg may share a name with a
 * non-input member of the component (such as its `labelTooltip`): Storybook copies story props
 * onto the component instance and would overwrite it.
 */
export interface LabelArgs {
  labelText: string;
  labelTruncate: boolean;
  labelTooltipPosition: TooltipPosition | 'none';
  labelAlign: KawaiLabelAlign;
  labelPosition: KawaiLabelPosition;
}

export const LABEL_ARGS: LabelArgs = {
  labelText: 'Label',
  labelTruncate: true,
  labelTooltipPosition: 'bottom',
  labelAlign: 'start',
  labelPosition: 'top',
};

export const LABEL_ARG_TYPES: Partial<ArgTypes<LabelArgs>> = {
  labelText: { description: '`label.text`, or `label` as a shorthand.' },
  labelTruncate: { description: '`label.truncate`' },
  labelTooltipPosition: {
    description: '`label.tooltip.position`; `none` is `label.tooltip: null`.',
    control: 'inline-radio',
    options: ['top', 'bottom', 'left', 'right', 'none'],
  },
  labelAlign: {
    description:
      '`label.align` within the label area: the full width on top, the label column at the start.',
    control: 'inline-radio',
    options: ['start', 'center', 'end'],
  },
  labelPosition: {
    description: '`label.position`: above the control, or beside it in the same line.',
    control: 'inline-radio',
    options: ['top', 'start'],
  },
};

/** Rebuilds the `label` options object from the flattened controls. */
export function labelOptions(args: LabelArgs): KawaiDeepPartial<KawaiLabelOptions> {
  return {
    text: args.labelText,
    truncate: args.labelTruncate,
    tooltip: args.labelTooltipPosition === 'none' ? null : { position: args.labelTooltipPosition },
    align: args.labelAlign,
    position: args.labelPosition,
  };
}
