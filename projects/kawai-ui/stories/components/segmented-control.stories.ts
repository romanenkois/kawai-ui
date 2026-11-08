import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';

import { SegmentedControlComponent } from '../../src/public-api';

type Control = SegmentedControlComponent<string>;

const meta: Meta<Control> = {
  title: 'Components/Segmented control',
  component: SegmentedControlComponent,
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-inline-size: 20rem">${story}</div>`),
  ],
  args: {
    label: 'View',
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'map', label: 'Map' },
    ],
    value: 'list',
    valueChange: fn(),
  },
  // The parent owns `value`; this story stores each emitted value, like an app would.
  render: (args) => ({
    props: args,
    template: `
      <kawai-segmented-control
        [label]="label"
        [options]="options"
        [value]="value"
        (valueChange)="value = $event; valueChange($event)"
      />
    `,
  }),
};
export default meta;
type Story = StoryObj<Control>;

/** Native radios: Tab focuses the group, arrow keys move the selection. */
export const Default: Story = {};

/** Option labels that do not fit are truncated. */
export const LongLabels: Story = {
  args: {
    options: [
      { value: 'a', label: 'First long option' },
      { value: 'b', label: 'Second long option' },
    ],
    value: 'a',
  },
};
