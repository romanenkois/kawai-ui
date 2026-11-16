import {
  applicationConfig,
  componentWrapperDecorator,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { fn } from 'storybook/test';

import { NumberStepperComponent, provideKawaiDefaults } from '../../src/public-api';
import {
  LABEL_ARGS,
  LABEL_ARG_TYPES,
  labelOptions,
  type LabelArgs,
} from '../shared/label-controls';

interface Args extends LabelArgs {
  value: number;
  min: number;
  max: number;
  decreaseLabel: string;
  increaseLabel: string;
  /** Story only: `--kawai-comp-number-stepper-label-width`. */
  labelWidth: string;
  valueChange: (value: number) => void;
}

const meta: Meta<Args> = {
  title: 'Components/Number stepper',
  component: NumberStepperComponent,
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-inline-size: 16rem">${story}</div>`),
  ],
  args: {
    ...LABEL_ARGS,
    labelText: 'Quantity',
    value: 3,
    min: 0,
    max: 10,
    decreaseLabel: '',
    increaseLabel: '',
    labelWidth: '',
    valueChange: fn(),
  },
  argTypes: {
    ...LABEL_ARG_TYPES,
    decreaseLabel: {
      description:
        'Accessible name of the − button; `{label}` becomes the label text. Empty keeps the default (`Decrease {label}`).',
    },
    increaseLabel: {
      description:
        'Accessible name of the + button; `{label}` becomes the label text. Empty keeps the default (`Increase {label}`).',
    },
    labelWidth: {
      description:
        'Story only: `--kawai-comp-number-stepper-label-width`, e.g. `6rem`. Empty keeps the default (fits the text).',
    },
  },
  // The parent owns `value`; this story stores each emitted value, like an app would.
  render: (args) => ({
    props: { ...args, label: labelOptions(args) },
    template: `
      <kawai-number-stepper
        [style.--kawai-comp-number-stepper-label-width]="labelWidth || null"
        [label]="label"
        [value]="value"
        [min]="min"
        [max]="max"
        [decreaseLabel]="decreaseLabel || undefined"
        [increaseLabel]="increaseLabel || undefined"
        (valueChange)="value = $event; valueChange($event)"
      />
    `,
  }),
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

/** At a bound, that button is `aria-disabled`: still focusable, but it does nothing. */
export const AtMinimum: Story = { args: { value: 0 } };

export const AtMaximum: Story = { args: { value: 10 } };

/** A label too long for its half of the row is truncated; the full text shows in a tooltip. */
export const LongLabel: Story = {
  args: { labelText: 'Number of guests staying overnight' },
};

/** With a fixed label width (a token), `label.align` aligns the text within it. */
export const AlignedLabel: Story = {
  args: { labelWidth: '7rem', labelAlign: 'end' },
};

/**
 * The button names are templates, so an app can translate them once with
 * `provideKawaiDefaults()`. `{label}` is replaced with the label text.
 */
export const TranslatedButtonNames: Story = {
  args: { labelText: 'Anzahl' },
  decorators: [
    applicationConfig({
      providers: [
        provideKawaiDefaults({
          numberStepper: { decreaseLabel: '{label} verringern', increaseLabel: '{label} erhöhen' },
        }),
      ],
    }),
  ],
};
