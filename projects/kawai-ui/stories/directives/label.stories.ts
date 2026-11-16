import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';

import { LabelDirective, provideKawaiDefaults } from '../../src/public-api';
import {
  LABEL_ARGS,
  LABEL_ARG_TYPES,
  labelOptions,
  type LabelArgs,
} from '../shared/label-controls';

/** `kawaiLabel` options flattened into separate controls, plus the width of the label's area. */
interface Args extends LabelArgs {
  /** Story only: inline size of the label's column. */
  width: string;
}

const FIELD = `
  <div [style.grid-template-columns]="width + ' minmax(0, 1fr)'" style="display: grid; gap: 0.75rem; align-items: center; max-inline-size: 24rem">
    <label for="field" [kawaiLabel]="label"></label>
    <input id="field" />
  </div>
`;

const meta: Meta<Args> = {
  title: 'Directives/Label',
  decorators: [moduleMetadata({ imports: [LabelDirective] })],
  args: { ...LABEL_ARGS, labelText: 'Email', width: '8rem' },
  argTypes: {
    ...LABEL_ARG_TYPES,
    labelText: { description: '`text`, or the whole `kawaiLabel` value as a shorthand.' },
    labelTruncate: { description: '`truncate`' },
    labelTooltipPosition: {
      ...LABEL_ARG_TYPES.labelTooltipPosition,
      description: '`tooltip.position`; `none` is `tooltip: null`.',
    },
    labelAlign: {
      ...LABEL_ARG_TYPES.labelAlign,
      description: '`align` within the label area.',
    },
    // A bare label has no control to sit beside, so `position` does nothing here.
    labelPosition: { table: { disable: true } },
    width: { description: 'Story only: inline size of the label column, e.g. `8rem`.' },
  },
  render: (args) => ({ props: { label: labelOptions(args), width: args.width }, template: FIELD }),
};
export default meta;
type Story = StoryObj<Args>;

/** The label of an app's own field: a real `<label for>`, with the text written by the directive. */
export const Default: Story = {};

/** The shorthand: just the text, every other option at its default. */
export const Shorthand: Story = {
  render: () => ({
    template: `
      <label for="field" kawaiLabel="Email"></label>
      <input id="field" />
    `,
  }),
};

/**
 * Text wider than its area is cut off with an ellipsis. The full text shows in a tooltip on
 * hover, and while the labelled field has keyboard focus.
 */
export const LongText: Story = {
  args: { labelText: 'Delivery instructions for the courier, if any' },
};

/** `truncate: false` lets the text wrap instead, with no tooltip. */
export const Wrapping: Story = {
  args: { labelText: 'Delivery instructions for the courier, if any', labelTruncate: false },
};

/** `align` places the text within the label's area. */
export const AlignedEnd: Story = { args: { labelAlign: 'end' } };

/**
 * `provideKawaiDefaults({ label: … })` sets the options for every label and heading in the app;
 * an instance still overrides them.
 */
export const AppDefaults: Story = {
  decorators: [
    applicationConfig({ providers: [provideKawaiDefaults({ label: { align: 'end' } })] }),
  ],
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: 8rem minmax(0, 1fr); gap: 0.75rem; align-items: center; max-inline-size: 24rem">
        <label for="first" kawaiLabel="From app defaults"></label>
        <input id="first" />
        <label for="second" [kawaiLabel]="{ text: 'Instance: start', align: 'start' }"></label>
        <input id="second" />
      </div>
    `,
  }),
};
