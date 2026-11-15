import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';

import { SegmentedControlComponent, type SegmentedOption } from '../../src/public-api';
import {
  LABEL_ARGS,
  LABEL_ARG_TYPES,
  labelOptions,
  type LabelArgs,
} from '../shared/label-controls';

interface Args extends LabelArgs {
  options: SegmentedOption<string>[];
  value: string;
  /** Story only: `--kawai-comp-segmented-control-label-width`. */
  labelWidth: string;
  valueChange: (value: string) => void;
}

const meta: Meta<Args> = {
  title: 'Components/Segmented control',
  component: SegmentedControlComponent,
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-inline-size: 20rem">${story}</div>`),
  ],
  args: {
    ...LABEL_ARGS,
    labelText: 'View',
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'map', label: 'Map' },
    ],
    value: 'list',
    labelWidth: '',
    valueChange: fn(),
  },
  argTypes: {
    ...LABEL_ARG_TYPES,
    labelWidth: {
      description:
        'Story only: `--kawai-comp-segmented-control-label-width`, e.g. `6rem`. Empty keeps the default (fits the text).',
    },
  },
  // The parent owns `value`; this story stores each emitted value, like an app would.
  render: (args) => ({
    props: { ...args, label: labelOptions(args) },
    template: `
      <kawai-segmented-control
        [style.--kawai-comp-segmented-control-label-width]="labelWidth || null"
        [label]="label"
        [options]="options"
        [value]="value"
        (valueChange)="value = $event; valueChange($event)"
      />
    `,
  }),
};
export default meta;
type Story = StoryObj<Args>;

/** Native radios: Tab focuses the group, arrow keys move the selection. */
export const Default: Story = {};

/** Option labels that don't fit are truncated, with the full text in a tooltip on hover. */
export const LongLabels: Story = {
  args: {
    options: [
      { value: 'a', label: 'First long option' },
      { value: 'b', label: 'Second long option' },
    ],
    value: 'a',
  },
};

/** A label too long for its half of the row is truncated; the full text shows in a tooltip. */
export const LongLabel: Story = {
  args: { labelText: 'Layout of the search results' },
};

/** With a fixed label width (a token), `label.align` aligns the text within it. */
export const AlignedLabel: Story = {
  args: { labelWidth: '7rem', labelAlign: 'center' },
};
