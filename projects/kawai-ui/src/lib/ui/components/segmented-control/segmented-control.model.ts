import type {
  KawaiLabelDefaultsConfig,
  KawaiLabelOptions,
} from '../../directives/label/label.model';

/** One option of a segmented control. */
export interface SegmentedOption<T extends string> {
  value: T;
  /** Shown on one line; truncated with a tooltip when it doesn't fit. */
  label: string;
}

/**
 * The segmented control's configuration with every value filled in: the shape of its library
 * defaults.
 */
export interface SegmentedControlDefaults {
  label: KawaiLabelOptions;
}

/**
 * The `segmentedControl` part of `provideKawaiDefaults()`. Same values as the inputs, minus
 * content (`label.text`). Anything left out comes from the level above.
 */
export interface SegmentedControlDefaultsConfig {
  label?: KawaiLabelDefaultsConfig;
}
