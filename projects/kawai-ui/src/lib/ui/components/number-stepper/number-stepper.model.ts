import type { KawaiLabelDefaultsConfig, KawaiLabelOptions } from '../../shared/label/label.model';

/** The stepper's configuration with every value filled in: the shape of its library defaults. */
export interface NumberStepperDefaults {
  label: KawaiLabelOptions;
}

/**
 * The `numberStepper` part of `provideKawaiDefaults()`. Same values as the inputs, minus content
 * (`label.text`). Anything left out comes from the level above.
 */
export interface NumberStepperDefaultsConfig {
  label?: KawaiLabelDefaultsConfig;
}
