/**
 * Every CSS custom property kawai-ui reads or declares. Types only, no runtime behavior.
 * Kept in sync with `styles/kawai-theme.css` and component styles by `npm run check:theme`.
 *
 * Naming: `--kawai-<tier>-…`
 *   ref   `--kawai-ref-<mode>-<role>`                         raw palette per mode
 *   sys   `--kawai-sys-<category>-<name>`                     semantic, what themes set
 *   comp  `--kawai-comp-<component>[-<part>]-<property>[-<state>]`  per component, unset by default
 */

/** Attribute an app sets on any element to choose the theme for that subtree. */
export const KAWAI_THEME_ATTRIBUTE = 'kawai-theme';

/** Built-in values for {@link KAWAI_THEME_ATTRIBUTE}. Apps may define their own values too. */
export type KawaiBuiltInTheme = 'light' | 'dark' | 'auto';

export const KAWAI_REF_TOKENS = [
  '--kawai-ref-light-surface',
  '--kawai-ref-light-surface-hover',
  '--kawai-ref-light-surface-raised',
  '--kawai-ref-light-text',
  '--kawai-ref-light-text-muted',
  '--kawai-ref-light-primary',
  '--kawai-ref-light-primary-hover',
  '--kawai-ref-light-secondary',
  '--kawai-ref-light-border',
  '--kawai-ref-light-shadow',
  '--kawai-ref-dark-surface',
  '--kawai-ref-dark-surface-hover',
  '--kawai-ref-dark-surface-raised',
  '--kawai-ref-dark-text',
  '--kawai-ref-dark-text-muted',
  '--kawai-ref-dark-primary',
  '--kawai-ref-dark-primary-hover',
  '--kawai-ref-dark-secondary',
  '--kawai-ref-dark-border',
  '--kawai-ref-dark-shadow',
] as const;

export const KAWAI_SYS_TOKENS = [
  '--kawai-sys-color-surface',
  '--kawai-sys-color-surface-hover',
  '--kawai-sys-color-surface-raised',
  '--kawai-sys-color-text',
  '--kawai-sys-color-text-muted',
  '--kawai-sys-color-primary',
  '--kawai-sys-color-primary-hover',
  '--kawai-sys-color-secondary',
  '--kawai-sys-color-border',
  '--kawai-sys-color-shadow',
  '--kawai-sys-shadow-raised',
  /** Not declared by default, so components inherit the app's font. */
  '--kawai-sys-font-family',
  '--kawai-sys-font-size-sm',
  '--kawai-sys-font-size-md',
  '--kawai-sys-font-size-lg',
  '--kawai-sys-line-height-tight',
  '--kawai-sys-line-height-normal',
  '--kawai-sys-font-weight-regular',
  '--kawai-sys-font-weight-bold',
  '--kawai-sys-space-2xs',
  '--kawai-sys-space-xs',
  '--kawai-sys-space-sm',
  '--kawai-sys-space-md',
  '--kawai-sys-space-lg',
  '--kawai-sys-space-xl',
  '--kawai-sys-radius-sm',
  '--kawai-sys-radius-md',
  '--kawai-sys-border-width',
  '--kawai-sys-focus-ring-width',
  '--kawai-sys-z-tooltip',
  '--kawai-sys-motion-duration-sm',
  '--kawai-sys-motion-duration-md',
  '--kawai-sys-motion-duration-lg',
  '--kawai-sys-motion-easing-standard',
] as const;

export const KAWAI_COMP_TOKENS = [
  '--kawai-comp-accordion-background',
  '--kawai-comp-accordion-color',
  '--kawai-comp-accordion-radius',
  '--kawai-comp-accordion-border-color',
  '--kawai-comp-accordion-border-width',
  '--kawai-comp-accordion-body-gap',
  '--kawai-comp-accordion-font-size',
  '--kawai-comp-accordion-header-gap',
  '--kawai-comp-accordion-header-padding',
  '--kawai-comp-accordion-header-padding-y',
  '--kawai-comp-accordion-header-padding-x',
  '--kawai-comp-accordion-header-font-weight',
  '--kawai-comp-accordion-body-padding',
  '--kawai-comp-accordion-body-padding-y',
  '--kawai-comp-accordion-body-padding-x',
  '--kawai-comp-accordion-focus-ring-color',
  '--kawai-comp-accordion-indicator-color',
  '--kawai-comp-accordion-indicator-size',
  '--kawai-comp-accordion-motion-duration',
  '--kawai-comp-accordion-motion-easing',

  '--kawai-comp-info-panel-title-color',
  '--kawai-comp-info-panel-note-color',
  '--kawai-comp-info-panel-label-color',
  '--kawai-comp-info-panel-field-gap',
  '--kawai-comp-info-panel-cell-padding-x',
  '--kawai-comp-info-panel-divider-color',
  '--kawai-comp-info-panel-button-padding',
  '--kawai-comp-info-panel-button-padding-y',
  '--kawai-comp-info-panel-button-padding-x',
  '--kawai-comp-info-panel-button-border-color',
  '--kawai-comp-info-panel-button-radius',
  '--kawai-comp-info-panel-button-color',
  '--kawai-comp-info-panel-button-color-hover',
  '--kawai-comp-info-panel-button-background-hover',
  '--kawai-comp-info-panel-focus-ring-color',

  '--kawai-comp-number-stepper-gap',
  '--kawai-comp-number-stepper-label-color',
  '--kawai-comp-number-stepper-border-color',
  '--kawai-comp-number-stepper-radius',
  '--kawai-comp-number-stepper-input-padding',
  '--kawai-comp-number-stepper-input-padding-y',
  '--kawai-comp-number-stepper-input-padding-x',
  '--kawai-comp-number-stepper-input-color',
  '--kawai-comp-number-stepper-button-padding',
  '--kawai-comp-number-stepper-button-padding-y',
  '--kawai-comp-number-stepper-button-padding-x',
  '--kawai-comp-number-stepper-button-color',
  '--kawai-comp-number-stepper-button-color-hover',
  '--kawai-comp-number-stepper-button-color-disabled',
  '--kawai-comp-number-stepper-button-background-hover',
  '--kawai-comp-number-stepper-focus-ring-color',

  '--kawai-comp-segmented-control-gap',
  '--kawai-comp-segmented-control-label-color',
  '--kawai-comp-segmented-control-border-color',
  '--kawai-comp-segmented-control-radius',
  '--kawai-comp-segmented-control-option-padding',
  '--kawai-comp-segmented-control-option-padding-y',
  '--kawai-comp-segmented-control-option-padding-x',
  '--kawai-comp-segmented-control-option-color',
  '--kawai-comp-segmented-control-option-color-hover',
  '--kawai-comp-segmented-control-option-color-checked',
  '--kawai-comp-segmented-control-option-background-hover',
  '--kawai-comp-segmented-control-option-background-checked',
  '--kawai-comp-segmented-control-option-font-weight-checked',
  '--kawai-comp-segmented-control-focus-ring-color',

  '--kawai-comp-tooltip-background',
  '--kawai-comp-tooltip-color',
  '--kawai-comp-tooltip-radius',
  '--kawai-comp-tooltip-padding',
  '--kawai-comp-tooltip-padding-y',
  '--kawai-comp-tooltip-padding-x',
  '--kawai-comp-tooltip-font-size',
  '--kawai-comp-tooltip-shadow',
] as const;

export type KawaiRefToken = (typeof KAWAI_REF_TOKENS)[number];
export type KawaiSysToken = (typeof KAWAI_SYS_TOKENS)[number];
export type KawaiCompToken = (typeof KAWAI_COMP_TOKENS)[number];
export type KawaiToken = KawaiRefToken | KawaiSysToken | KawaiCompToken;

export const KAWAI_TOKENS: readonly KawaiToken[] = [
  ...KAWAI_REF_TOKENS,
  ...KAWAI_SYS_TOKENS,
  ...KAWAI_COMP_TOKENS,
];
