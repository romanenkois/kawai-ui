import type {
  KawaiLabelDefaultsConfig,
  KawaiLabelOptions,
} from '../../directives/label/label.model';

/** The stepper's configuration with every value filled in: the shape of its library defaults. */
export interface NumberStepperDefaults {
  label: KawaiLabelOptions;
  /**
   * Accessible name of the − button. `{label}` is replaced with the label text, so a
   * translation can put it anywhere: `'{label} verringern'`.
   */
  decreaseLabel: string;
  /** Accessible name of the + button. `{label}` is replaced with the label text. */
  increaseLabel: string;
}

/**
 * The `numberStepper` part of `provideKawaiDefaults()`. Same values as the inputs, minus content
 * (`label.text`). Anything left out comes from the level above.
 */
export interface NumberStepperDefaultsConfig {
  label?: KawaiLabelDefaultsConfig;
  decreaseLabel?: string;
  increaseLabel?: string;
}
