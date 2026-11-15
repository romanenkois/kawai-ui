import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';

import { InfoPanelComponent, type InfoItem } from '../../src/public-api';

const meta: Meta<InfoPanelComponent> = {
  title: 'Components/Info panel',
  component: InfoPanelComponent,
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-inline-size: 20rem">${story}</div>`),
  ],
  args: { linkClicked: fn() },
  argTypes: {
    linksOverflow: {
      description: 'Panel default for fields without their own `linksOverflow`.',
      control: 'inline-radio',
      options: ['wrap', 'scroll'],
    },
  },
};
export default meta;
type Story = StoryObj<InfoPanelComponent>;

const ALL_ITEMS: InfoItem[] = [
  { type: 'title', text: 'Order #1042' },
  { type: 'simple-text', text: 'Placed yesterday, ships in 2 days.' },
  { type: 'simple-text', text: 'No notes for this order.', muted: true },
  {
    type: 'fields',
    fields: [
      { label: 'Customer', value: 'Ada Lovelace' },
      {
        label: 'Tags',
        links: [
          { text: 'priority', value: 'priority' },
          { text: 'gift', value: 'gift' },
        ],
      },
      { label: 'Related', links: [], value: 'None' },
    ],
  },
  {
    type: 'table',
    columns: ['Item', 'Qty', 'Price'],
    rows: [
      { header: 'Notebook', cells: ['2', '12.00'] },
      { header: 'Pen', cells: ['5', '7.50'] },
    ],
    footer: { header: 'Total', cells: ['7', '19.50'] },
  },
  { type: 'button', link: { text: 'Open order', value: '1042' } },
];

/** Every item type in one panel. */
export const AllItemTypes: Story = { args: { items: ALL_ITEMS } };

/** Text that does not fit is truncated; hover or focus it to see the full value in a tooltip. */
export const Truncation: Story = {
  args: {
    items: [
      { type: 'title', text: 'A title that is much too long to fit in this narrow panel' },
      {
        type: 'fields',
        fields: [{ label: 'Address', value: '221B Baker Street, Marylebone, London NW1 6XE' }],
      },
    ],
  },
};

/** With `linksOverflow: 'scroll'`, a long list of links scrolls on one line instead of wrapping. */
export const ScrollingLinks: Story = {
  args: {
    items: [
      {
        type: 'fields',
        fields: [
          {
            label: 'Tags',
            linksOverflow: 'scroll',
            links: ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta'].map((t) => ({
              text: t,
              value: t,
            })),
          },
        ],
      },
    ],
  },
};

/**
 * `linksOverflow="scroll"` on the panel makes every field's links scroll on one line, unless the
 * field sets its own `linksOverflow`.
 */
export const PanelLinksScroll: Story = {
  args: {
    linksOverflow: 'scroll',
    items: [
      {
        type: 'fields',
        fields: [
          {
            label: 'Tags',
            links: ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta'].map((t) => ({
              text: t,
              value: t,
            })),
          },
          {
            label: 'Wraps',
            linksOverflow: 'wrap',
            links: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'].map((t) => ({
              text: t,
              value: t,
            })),
          },
        ],
      },
    ],
  },
};
