import { Component, input, output } from '@angular/core';

import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { InfoItem, InfoLink } from './info-panel.model';

/**
 * Renders a list of typed info items: titles, text, label/value fields, tables and buttons.
 * All text truncates to one line and shows its full value in a tooltip when cut off.
 */
@Component({
  selector: 'kawai-info-panel',
  imports: [TooltipDirective],
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.scss',
})
export class InfoPanelComponent {
  readonly items = input.required<InfoItem[]>();
  readonly linkClicked = output<InfoLink>();
}
