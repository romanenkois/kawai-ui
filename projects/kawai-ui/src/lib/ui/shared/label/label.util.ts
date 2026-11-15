import type { KawaiDeepPartial } from '../../../utils/options';
import type { TooltipOptions } from '../../directives/tooltip/tooltip.model';
import type { KawaiLabelOptions } from './label.model';

/**
 * The `kawaiTooltip` value for a resolved label: its full text, only while truncated. `null`
 * when the label doesn't truncate or its tooltip is off. Fields the label leaves out (e.g.
 * position) fall through to the tooltip defaults.
 */
export function labelTooltip(label: KawaiLabelOptions): KawaiDeepPartial<TooltipOptions> | null {
  const { text, truncate, tooltip } = label;
  return truncate && tooltip ? { ...tooltip, text, onlyWhenTruncated: true } : null;
}
