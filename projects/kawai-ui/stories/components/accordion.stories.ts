import {
  applicationConfig,
  componentWrapperDecorator,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { fn } from 'storybook/test';

import {
  AccordionBodyDirective,
  AccordionComponent,
  AccordionHeadingDirective,
  AccordionIndicatorDirective,
  type AccordionHeadingOptions,
  type AccordionIndicatorOptions,
  type AccordionLayoutOptions,
  type AccordionOverflow,
  type KawaiDeepPartial,
  type KawaiHeadingLevel,
  type KawaiLabelAlign,
  type TooltipPosition,
  provideKawaiDefaults,
} from '../../src/public-api';

/** The `heading`, `indicator` and `layout` options flattened into separate controls. */
interface Args {
  headingText: string;
  headingTruncate: boolean;
  headingTooltip: TooltipPosition | 'none';
  headingAlign: KawaiLabelAlign;
  headingLevel: KawaiHeadingLevel;
  indicatorPosition: 'start' | 'end' | 'none';
  indicatorRotate: 'default' | 'on' | 'off';
  layoutBody: AccordionLayoutOptions['body'];
  layoutInnerCorners: AccordionLayoutOptions['innerCorners'];
  layoutBorder: boolean;
  expanded: boolean;
  overflow: AccordionOverflow;
  content: string;
  toggled: () => void;
}

function headingOptions(args: Args): KawaiDeepPartial<AccordionHeadingOptions> {
  return {
    text: args.headingText,
    truncate: args.headingTruncate,
    tooltip: args.headingTooltip === 'none' ? null : { position: args.headingTooltip },
    align: args.headingAlign,
  };
}

function indicatorOptions(args: Args): KawaiDeepPartial<AccordionIndicatorOptions> | null {
  if (args.indicatorPosition === 'none') return null;
  return args.indicatorRotate === 'default'
    ? { position: args.indicatorPosition }
    : { position: args.indicatorPosition, rotate: args.indicatorRotate === 'on' };
}

function layoutOptions(args: Args): KawaiDeepPartial<AccordionLayoutOptions> {
  return {
    body: args.layoutBody,
    innerCorners: args.layoutInnerCorners,
    border: args.layoutBorder,
  };
}

const BODY = `<ng-template kawaiAccordionBody><p style="margin: 0">{{ content }}</p></ng-template>`;

/** Renders the accordion with `inner` as its templates. The story owns `expanded`, like an app. */
function render(inner: string): NonNullable<Meta<Args>['render']> {
  return (args) => ({
    props: {
      ...args,
      heading: headingOptions(args),
      indicator: indicatorOptions(args),
      layout: layoutOptions(args),
    },
    template: `
      <kawai-accordion
        [heading]="heading"
        [headingLevel]="headingLevel"
        [indicator]="indicator"
        [layout]="layout"
        [expanded]="expanded"
        [overflow]="overflow"
        (toggled)="expanded = !expanded; toggled()"
      >
        ${inner}
      </kawai-accordion>
    `,
  });
}

const meta: Meta<Args> = {
  title: 'Components/Accordion',
  component: AccordionComponent,
  decorators: [
    moduleMetadata({
      imports: [AccordionBodyDirective, AccordionHeadingDirective, AccordionIndicatorDirective],
    }),
    componentWrapperDecorator((story) => `<div style="max-inline-size: 20rem">${story}</div>`),
  ],
  args: {
    headingText: 'Details',
    headingTruncate: true,
    headingTooltip: 'bottom',
    headingAlign: 'start',
    headingLevel: 2,
    indicatorPosition: 'end',
    indicatorRotate: 'default',
    layoutBody: 'attached',
    layoutInnerCorners: 'rounded',
    layoutBorder: true,
    expanded: true,
    overflow: 'hidden',
    content: 'Body content. It expands and collapses with a height animation.',
    toggled: fn(),
  },
  argTypes: {
    headingText: { description: '`heading.text`, or `heading` as a shorthand.' },
    headingTruncate: { description: '`heading.truncate`' },
    headingTooltip: {
      description: '`heading.tooltip.position`; `none` is `heading.tooltip: null`.',
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right', 'none'],
    },
    headingAlign: {
      description: '`heading.align` within the header.',
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
    },
    headingLevel: {
      description: 'Heading element around the header button: `2` is `<h2>`.',
      control: 'inline-radio',
      options: [1, 2, 3, 4, 5, 6],
    },
    indicatorPosition: {
      description: '`indicator.position`; `none` is `indicator: null`.',
      control: 'inline-radio',
      options: ['start', 'end', 'none'],
    },
    indicatorRotate: {
      description: '`indicator.rotate`; `default` leaves it out (on for the chevron).',
      control: 'inline-radio',
      options: ['default', 'on', 'off'],
    },
    layoutBody: {
      description: '`layout.body`, or `layout` as a shorthand.',
      control: 'inline-radio',
      options: ['attached', 'separated'],
    },
    layoutInnerCorners: {
      description: '`layout.innerCorners`: separated layout only, while expanded.',
      control: 'inline-radio',
      options: ['rounded', 'square'],
    },
    layoutBorder: { description: '`layout.border`' },
    overflow: { control: 'inline-radio', options: ['hidden', 'scroll'] },
    content: { description: 'Story only: text placed in the body template.' },
  },
  render: render(BODY),
};
export default meta;
type Story = StoryObj<Args>;

export const Expanded: Story = {};

export const Collapsed: Story = { args: { expanded: false } };

/** `indicator="start"` puts the chevron before the heading. */
export const IndicatorAtStart: Story = { args: { indicatorPosition: 'start' } };

/** `[indicator]="null"` renders no indicator. */
export const NoIndicator: Story = { args: { indicatorPosition: 'none' } };

/** `heading.align: 'center'` centers the heading text in the header. */
export const CenteredHeading: Story = { args: { headingAlign: 'center' } };

/** `layout="separated"`: header and body are separate boxes with a gap between them. */
export const Separated: Story = { args: { layoutBody: 'separated' } };

/** Separated with `innerCorners: 'square'`: the facing corners turn square while expanded. */
export const SeparatedSquareCorners: Story = {
  args: { layoutBody: 'separated', layoutInnerCorners: 'square' },
};

/** `[layout]="{ border: false }"` removes the outline and the line between header and body. */
export const NoBorder: Story = { args: { layoutBorder: false } };

/** A heading too long for the header is truncated; the full text shows in a tooltip. */
export const LongHeading: Story = {
  args: { headingText: 'A very long accordion heading that does not fit on one line' },
};

/** With `heading.truncate: false`, a long heading wraps instead. */
export const LongHeadingWrapping: Story = {
  args: {
    headingText: 'A very long accordion heading that does not fit on one line',
    headingTruncate: false,
  },
};

/** With `overflow: 'scroll'`, wide content scrolls inside the body instead of being clipped. */
export const ScrollingBody: Story = {
  args: { overflow: 'scroll', content: 'unbroken_wide_content_'.repeat(6) },
};

/**
 * A `kawaiAccordionHeading` template replaces the heading text and lays itself out. The
 * `heading` text becomes the header button's accessible label.
 */
export const CustomHeading: Story = {
  args: { headingText: 'Billing, 2 issues' },
  render: render(`
    <ng-template kawaiAccordionHeading let-expanded>
      <span style="display: flex; gap: 0.5rem; align-items: center">
        <span>Billing</span>
        <span style="padding: 0 0.375rem; border-radius: 999px; background: var(--kawai-sys-color-surface-hover); font-weight: 400">
          2 issues{{ expanded ? '' : ' (collapsed)' }}
        </span>
      </span>
    </ng-template>
    ${BODY}
  `),
};

/**
 * A `kawaiAccordionIndicator` template replaces the chevron. It isn't rotated by default, so it
 * can swap symbols using `expanded`.
 */
export const CustomIndicator: Story = {
  render: render(`
    <ng-template kawaiAccordionIndicator let-expanded>{{ expanded ? '−' : '+' }}</ng-template>
    ${BODY}
  `),
};

/**
 * App-level defaults: `provideKawaiDefaults()` in the app config makes every accordion
 * separated, with the indicator at the start. These accordions pass no options of their own;
 * the second one overrides `layout` on the instance, which wins over the app level.
 */
export const WithAppDefaults: Story = {
  decorators: [
    applicationConfig({
      providers: [provideKawaiDefaults({ accordion: { layout: 'separated', indicator: 'start' } })],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <kawai-accordion heading="From app defaults" [expanded]="expanded" (toggled)="expanded = !expanded">
        ${BODY}
      </kawai-accordion>
      <div style="block-size: 0.5rem"></div>
      <kawai-accordion heading="Instance: layout attached" layout="attached" [expanded]="true">
        ${BODY}
      </kawai-accordion>
    `,
  }),
};
