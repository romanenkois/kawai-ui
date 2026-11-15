import { Component, computed, input, output } from '@angular/core';

import { injectKawaiDefaults } from '../../../defaults/kawai-defaults';
import { resolveValueChain } from '../../../utils/options';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { KAWAI_INFO_PANEL_DEFAULTS } from './info-panel.constant';
import { InfoItem, InfoLink, InfoPanelLinksOverflow } from './info-panel.model';

/**
 * Renders a list of typed info items: titles, text, label/value fields, tables and buttons.
 * All text truncates to one line and shows its full value in a tooltip when cut off.
 *
 * `linksOverflow` sets how wide link lists behave for every field that doesn't set its own;
 * left out, it comes from `provideKawaiDefaults()` levels, then `KAWAI_INFO_PANEL_DEFAULTS`.
 */
@Component({
  selector: 'kawai-info-panel',
  imports: [TooltipDirective],
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.scss',
})
export class InfoPanelComponent {
  readonly items = input.required<InfoItem[]>();
  /** How link lists too wide for their field behave, unless the field sets its own. */
  readonly linksOverflow = input<InfoPanelLinksOverflow>();
  readonly linkClicked = output<InfoLink>();

  private readonly defaultLevels = injectKawaiDefaults();
  /** The panel-level links overflow; a field's own `linksOverflow` still wins. */
  protected readonly linksOverflowValue = computed<InfoPanelLinksOverflow>(() =>
    resolveValueChain(
      [
        ...this.defaultLevels().map((level) => level.infoPanel?.linksOverflow),
        this.linksOverflow(),
      ],
      KAWAI_INFO_PANEL_DEFAULTS.linksOverflow,
    ),
  );
}
