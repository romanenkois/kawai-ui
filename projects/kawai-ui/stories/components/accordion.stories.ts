import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';

import { AccordionComponent } from '../../src/public-api';

type Args = AccordionComponent & { content: string };

const meta: Meta<Args> = {
  title: 'Components/Accordion',
  component: AccordionComponent,
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-inline-size: 20rem">${story}</div>`),
  ],
  args: {
    heading: 'Details',
    expanded: true,
    overflow: 'hidden',
    content: 'Body content, rendered only while the accordion is expanded.',
    toggled: fn(),
  },
  argTypes: {
    overflow: { control: 'inline-radio', options: ['hidden', 'scroll'] },
    content: { description: 'Story only: text placed in the body template.' },
  },
  // The parent owns `expanded`; this story flips it on `toggled`, like an app would.
  render: (args) => ({
    props: args,
    template: `
      <kawai-accordion
        [heading]="heading"
        [expanded]="expanded"
        [overflow]="overflow"
        (toggled)="expanded = !expanded; toggled()"
      >
        <ng-template><p style="margin: 0">{{ content }}</p></ng-template>
      </kawai-accordion>
    `,
  }),
};
export default meta;
type Story = StoryObj<Args>;

export const Expanded: Story = {};

export const Collapsed: Story = { args: { expanded: false } };

/** A heading too long for the header is truncated and shows the full text in a tooltip on hover or focus. */
export const LongHeading: Story = {
  args: { heading: 'A very long accordion heading that does not fit on one line' },
};

/** With `overflow: 'scroll'`, wide content scrolls inside the body instead of being clipped. */
export const ScrollingBody: Story = {
  args: {
    overflow: 'scroll',
    content: 'unbroken_wide_content_'.repeat(6),
  },
};
