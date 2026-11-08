import { TooltipPosition } from '../../directives/tooltip/tooltip.model';

/** What the body does with content wider than the accordion. */
export type AccordionOverflow = 'hidden' | 'scroll';

/** Options for `heading`. Pass the text alone as a shorthand, or any subset of these. */
export interface AccordionHeadingOptions {
  /**
   * Heading text. With a `kawaiAccordionHeading` template it isn't shown, but becomes the
   * header button's accessible label.
   */
  text: string;
  /** Keep the text heading on one line with an ellipsis. Doesn't apply to heading templates. */
  truncate: boolean;
  /** Tooltip with the full text, shown only while it is truncated. `null` for none. */
  tooltip: { position: TooltipPosition } | null;
}

export const KAWAI_ACCORDION_HEADING_DEFAULTS: Readonly<AccordionHeadingOptions> = {
  text: '',
  truncate: true,
  tooltip: { position: 'bottom' },
};

export type AccordionIndicatorPosition = 'start' | 'end';

/**
 * Options for `indicator`. Pass the position alone as a shorthand, any subset of these, or
 * `null` for no indicator.
 */
export interface AccordionIndicatorOptions {
  /** Side of the header the indicator sits on. `end` is the right side in left-to-right text. */
  position: AccordionIndicatorPosition;
  /**
   * Turn the indicator 180° while expanded. Defaults to `true` for the built-in chevron and to
   * `false` for a `kawaiAccordionIndicator` template, which can use `expanded` itself.
   */
  rotate: boolean;
}

export const KAWAI_ACCORDION_INDICATOR_DEFAULTS: Readonly<AccordionIndicatorOptions> = {
  position: 'end',
  rotate: true,
};

export type AccordionBodyLayout = 'attached' | 'separated';
export type AccordionInnerCorners = 'rounded' | 'square';

/** Options for `layout`. Pass the body layout alone as a shorthand, or any subset of these. */
export interface AccordionLayoutOptions {
  /**
   * `attached`: header and body share one box, split by a line. `separated`: header and body
   * are separate boxes with a gap between them (`--kawai-comp-accordion-body-gap`).
   */
  body: AccordionBodyLayout;
  /**
   * Separated layout only: the corners where header and body face each other while expanded.
   * `square` makes the pair read as one split panel.
   */
  innerCorners: AccordionInnerCorners;
  /**
   * Draw the outline, and in attached layout the line between header and body. Color and width
   * come from `--kawai-comp-accordion-border-color` and `-border-width`.
   */
  border: boolean;
}

export const KAWAI_ACCORDION_LAYOUT_DEFAULTS: Readonly<AccordionLayoutOptions> = {
  body: 'attached',
  innerCorners: 'rounded',
  border: true,
};

/** Context of the accordion's heading, indicator and body templates. */
export interface AccordionTemplateContext {
  /** Whether the accordion is expanded, also available as `let-expanded`. */
  $implicit: boolean;
  expanded: boolean;
}
