import type { KawaiDeepPartial } from '../../../utils/options';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/** Options for `kawaiTooltip`. Pass the text alone as a shorthand, or any subset of these. */
export interface TooltipOptions {
  /** Plain text shown in the tooltip. Empty shows nothing. */
  text: string;
  /** Preferred side. Flips to the opposite side when it would leave the viewport. */
  position: TooltipPosition;
  /**
   * Only open when the host's own content is clipped (`scrollWidth > clientWidth`), checked when
   * it would open. The host must be the element that clips, e.g. `overflow: hidden;
   * text-overflow: ellipsis`. Such a tooltip repeats text already in the DOM, so it is not
   * linked through `aria-describedby`.
   */
  onlyWhenTruncated: boolean;
}

/**
 * The `tooltip` part of `provideKawaiDefaults()`: the options minus content (`text`). Anything
 * left out comes from the level above.
 */
export type TooltipDefaultsConfig = KawaiDeepPartial<Omit<TooltipOptions, 'text'>>;
