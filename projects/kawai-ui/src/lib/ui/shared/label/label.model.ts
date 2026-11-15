import type { KawaiDeepPartial } from '../../../utils/options';
import type { TooltipOptions } from '../../directives/tooltip/tooltip.model';

export type KawaiLabelAlign = 'start' | 'center' | 'end';

/**
 * Options for a component's label or heading (`label`, `heading`). Pass the text alone as a
 * shorthand, or any subset of these.
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
  /** Alignment of the text within the label's area. */
  align: KawaiLabelAlign;
}

/** Label options as a `provideKawaiDefaults()` value: every field optional, minus `text`. */
export type KawaiLabelDefaultsConfig = KawaiDeepPartial<Omit<KawaiLabelOptions, 'text'>>;
