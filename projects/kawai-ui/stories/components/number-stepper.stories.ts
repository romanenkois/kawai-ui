import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';

import { NumberStepperComponent } from '../../src/public-api';

const meta: Meta<NumberStepperComponent> = {
  title: 'Components/Number stepper',
  component: NumberStepperComponent,
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-inline-size: 16rem">${story}</div>`),
  ],
  args: { label: 'Quantity', value: 3, min: 0, max: 10, valueChange: fn() },
  // The parent owns `value`; this story stores each emitted value, like an app would.
  render: (args) => ({
    props: args,
    template: `
      <kawai-number-stepper
        [label]="label"
        [value]="value"
        [min]="min"
        [max]="max"
        (valueChange)="value = $event; valueChange($event)"
      />
    `,
  }),
};
export default meta;
type Story = StoryObj<NumberStepperComponent>;

export const Default: Story = {};

/** At a bound, that button is `aria-disabled`: still focusable, but it does nothing. */
export const AtMinimum: Story = { args: { value: 0 } };

export const AtMaximum: Story = { args: { value: 10 } };
