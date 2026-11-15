import type { KawaiDeepPartial } from '../../../utils/options';
import type { KawaiLabelDefaultsConfig, KawaiLabelOptions } from '../../shared/label/label.model';

/** What the body does with content wider than the accordion. */
export type AccordionOverflow = 'hidden' | 'scroll';

/**
 * Options for `heading`: the shared {@link KawaiLabelOptions}. With a `kawaiAccordionHeading`
 * template, `text` isn't shown but becomes the header button's accessible label, `align` still
 * applies, and `truncate` and `tooltip` don't (the template lays itself out).
 */
export type AccordionHeadingOptions = KawaiLabelOptions;

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

/** The accordion's configuration with every value filled in: the shape of its library defaults. */
export interface AccordionDefaults {
  heading: AccordionHeadingOptions;
  indicator: AccordionIndicatorOptions;
  layout: AccordionLayoutOptions;
  overflow: AccordionOverflow;
}

/**
 * The `accordion` part of `provideKawaiDefaults()`. Same values as the inputs, minus content
 * (`heading.text`). Anything left out comes from the level above.
 */
export interface AccordionDefaultsConfig {
  heading?: KawaiLabelDefaultsConfig;
  indicator?: AccordionIndicatorPosition | KawaiDeepPartial<AccordionIndicatorOptions> | null;
  layout?: AccordionBodyLayout | KawaiDeepPartial<AccordionLayoutOptions>;
  overflow?: AccordionOverflow;
}

/** Context of the accordion's heading, indicator and body templates. */
export interface AccordionTemplateContext {
  /** Whether the accordion is expanded, also available as `let-expanded`. */
  $implicit: boolean;
  expanded: boolean;
}
