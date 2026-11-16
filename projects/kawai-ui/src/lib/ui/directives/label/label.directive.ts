import { Directive, computed, input } from '@angular/core';

import { injectKawaiDefaults } from '../../../defaults/kawai-defaults';
import { KawaiDeepPartial, resolveOptionsChain } from '../../../utils/options';
import { TooltipController } from '../tooltip/tooltip.controller';
import { TooltipOptions } from '../tooltip/tooltip.model';
import { KAWAI_LABEL_DEFAULTS } from './label.constant';
import { KawaiLabelOptions } from './label.model';
import { labelTooltip } from './label.util';

/**
 * Makes its host a kawai label: writes the text, keeps it on one line with an ellipsis, shows
 * the full text in a tooltip while it is cut off, and aligns it. Every kawai-ui component
 * renders its label or heading with it, and apps use it to label their own controls the same
 * way:
 *
 * ```html
 * <label kawaiLabel="Email" for="email"></label>
 * <span id="range" [kawaiLabel]="{ text: 'Range', align: 'end' }"></span>
 * ```
 *
 * Takes the text alone or {@link KawaiLabelOptions}. The host keeps its own element and
 * semantics (`label for`, an `id` for `aria-labelledby`); the directive replaces its content
 * with the text. Options left out come from the `label` key of `provideKawaiDefaults()` levels
 * (nearest first), then `KAWAI_LABEL_DEFAULTS`.
 *
 * `position` is for components that lay the label out next to a control; the directive itself
 * leaves its host where the app put it.
 *
 * Truncation is the `.kawai-label-truncate` rule in `kawai-theme.css`, which also makes the
 * host a block so it can clip. The tooltip opens on hover and, like `kawaiTooltip`, while the
 * labelled control has keyboard focus.
 */
@Directive({
  selector: '[kawaiLabel]',
  host: {
    '[textContent]': 'resolved().text',
    '[class.kawai-label-truncate]': 'resolved().truncate',
    '[style.text-align]': 'resolved().align',
    '(mouseenter)': 'tooltip.scheduleShow()',
    '(mouseleave)': 'tooltip.scheduleHide()',
    '(focusin)': 'tooltip.showOnFocus()',
    '(focusout)': 'tooltip.hide()',
  },
})
export class LabelDirective {
  /** Label text, or {@link KawaiLabelOptions}. */
  readonly options = input.required<string | KawaiDeepPartial<KawaiLabelOptions>>({
    alias: 'kawaiLabel',
  });

  private readonly defaultLevels = injectKawaiDefaults();
  protected readonly resolved = computed<KawaiLabelOptions>(() =>
    resolveOptionsChain(
      [...this.defaultLevels().map((level) => level.label), this.options()],
      KAWAI_LABEL_DEFAULTS,
      'text',
    ),
  );
  /** Full text while truncated. */
  protected readonly tooltip = new TooltipController(
    computed<KawaiDeepPartial<TooltipOptions> | null>(() => labelTooltip(this.resolved())),
  );
}
