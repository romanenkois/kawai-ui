import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';

import { TooltipDirective, type TooltipPosition } from '../../src/public-api';

/** `kawaiTooltip` options flattened into separate controls. */
interface Args {
  text: string;
  position: TooltipPosition;
  showDelay: number;
  hideDelay: number;
}

const meta: Meta<Args> = {
  title: 'Directives/Tooltip',
  decorators: [moduleMetadata({ imports: [TooltipDirective] })],
  args: { text: 'Saves the current draft', position: 'bottom', showDelay: 300, hideDelay: 100 },
  argTypes: {
    text: { description: '`text`, or the whole `kawaiTooltip` value as a shorthand.' },
    position: {
      description: '`position`. Flips to the opposite side when there is no room.',
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
    },
    showDelay: {
      description:
        '`showDelay`: milliseconds of hover before it opens. Keyboard focus opens at once.',
    },
    hideDelay: {
      description:
        '`hideDelay`: milliseconds it stays after the pointer leaves, so the pointer can move onto it.',
    },
  },
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<Args>;

/**
 * Shown on hover (after `showDelay`) and on keyboard focus; stays open while the pointer is on
 * the tooltip itself; hidden on leave (after `hideDelay`), blur, Escape and scroll.
 */
export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<button type="button" [kawaiTooltip]="{ text, position, showDelay, hideDelay }">Save</button>`,
  }),
};

/** The shorthand: just the text, every other option at its default. */
export const Shorthand: Story = {
  render: () => ({
    template: `<button type="button" kawaiTooltip="Saves the current draft">Save</button>`,
  }),
};

/**
 * With `onlyWhenTruncated: true`, the tooltip only opens when the host's text is cut off.
 * The first line fits, so it shows no tooltip; the second is truncated, so it does, and it is
 * a tab stop so the keyboard can open it too.
 */
export const OnlyWhenTruncated: Story = {
  render: (args) => ({
    props: { ...args, long: `${args.text}, and keeps a backup copy` },
    styles: [
      `p { inline-size: 12rem; margin: 0.25rem 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`,
    ],
    template: `
      <p [kawaiTooltip]="{ text: 'Short text', onlyWhenTruncated: true }">Short text</p>
      <p [kawaiTooltip]="{ text: long, position, onlyWhenTruncated: true }">{{ long }}</p>
    `,
  }),
};
