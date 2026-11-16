import type { KawaiDeepPartial } from '../../../utils/options';
import type { TooltipOptions } from '../../directives/tooltip/tooltip.model';

export type KawaiLabelAlign = 'start' | 'center' | 'end';

/**
 * Where a component puts its label: `top` is above the control, across its full width; `start`
 * is beside it in the same line, on the left in left-to-right text.
 */
export type KawaiLabelPosition = 'top' | 'start';

/**
 * Options for `kawaiLabel` and for a component's label or heading (`label`, `heading`). Pass
 * the text alone as a shorthand, or any subset of these.
 */
export interface KawaiLabelOptions {
  /** The text. Also the accessible name of what it labels, so it shouldn't be empty. */
  text: string;
  /** Keep the text on one line with an ellipsis. */
  truncate: boolean;
  /**
   * Tooltip with the full text, shown only while it is truncated. `null` for none. Fields left
   * out (such as `position`) come from the tooltip defaults.
   */
  tooltip: KawaiDeepPartial<Pick<TooltipOptions, 'position'>> | null;
  /**
   * Alignment of the text within the label's area: the full width of the component with
   * `position: 'top'`, the label column with `position: 'start'`.
   */
  align: KawaiLabelAlign;
  /**
   * Where a component that pairs the label with a control (number stepper, segmented control)
   * puts it. It has no effect on a bare `kawaiLabel`, which sits where the app puts it, or on a
   * heading.
   */
  position: KawaiLabelPosition;
}

/**
 * Label options as a `provideKawaiDefaults()` value: every field optional, minus `text`. It is
 * the shared `label` key, which applies to every label and heading, and the type of each
 * component's own key (`numberStepper.label`, `accordion.heading`), which beats the shared one.
 */
export type KawaiLabelDefaultsConfig = KawaiDeepPartial<Omit<KawaiLabelOptions, 'text'>>;
