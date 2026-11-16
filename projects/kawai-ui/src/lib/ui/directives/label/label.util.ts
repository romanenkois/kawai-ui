import type { KawaiDefaultsConfig } from '../../../defaults/kawai-defaults';
import { KawaiDeepPartial, resolveOptionsChain } from '../../../utils/options';
import type { TooltipOptions } from '../tooltip/tooltip.model';
import type { KawaiLabelDefaultsConfig, KawaiLabelOptions } from './label.model';

/**
 * Resolves a label or heading for a component. Nearest first: the instance `input`, the
 * component's own key at every `provideKawaiDefaults()` level, the shared `label` key at every
 * level, then `defaults`. So a component key always beats the shared key, whichever level
 * either is set at.
 *
 * `own` picks the component's key from a level: `(level) => level.numberStepper?.label`.
 */
export function resolveLabelChain(
  levels: readonly KawaiDefaultsConfig[],
  own: (level: KawaiDefaultsConfig) => KawaiLabelDefaultsConfig | undefined,
  input: string | KawaiDeepPartial<KawaiLabelOptions> | undefined,
  defaults: KawaiLabelOptions,
): KawaiLabelOptions {
  return resolveOptionsChain(
    [...levels.map((level) => level.label), ...levels.map(own), input],
    defaults,
    'text',
  );
}

/**
 * The tooltip of a resolved label, as a `kawaiTooltip` value: its full text, only while
 * truncated. `null` when the label doesn't truncate or its tooltip is off. Fields the label
 * leaves out (e.g. position) fall through to the tooltip defaults.
 */
export function labelTooltip(label: KawaiLabelOptions): KawaiDeepPartial<TooltipOptions> | null {
  const { text, truncate, tooltip } = label;
  return truncate && tooltip ? { ...tooltip, text, onlyWhenTruncated: true } : null;
}
