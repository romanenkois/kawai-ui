import { Directive, input } from '@angular/core';

import { KawaiDeepPartial } from '../../../utils/options';
import { TooltipController } from './tooltip.controller';
import { TooltipOptions } from './tooltip.model';

/**
 * Plain-text tooltip shown on hover (after `showDelay`) and on keyboard focus (at once). It
 * stays open while the pointer is over the host or the tooltip itself, and hides `hideDelay`
 * after the pointer leaves, and at once on blur, Escape and scroll.
 * Takes the text alone (`kawaiTooltip="Save"`), or {@link TooltipOptions} for position, delays
 * and truncation-only mode (`[kawaiTooltip]="{ text, onlyWhenTruncated: true }"`). `null` or
 * empty text turns it off. Options left out come from `provideKawaiDefaults()` levels, then
 * `KAWAI_TOOLTIP_DEFAULTS`.
 *
 * Keyboard reach: when the host can't take focus itself, the tooltip also opens while the
 * control that owns it has keyboard focus: the button or link around it, or the control of the
 * `<label>` it is (in). A truncation-only host with no such control becomes a tab stop
 * (`tabindex="0"`) for as long as its text is clipped.
 *
 * The tooltip is appended to <body> and opened as a popover, so it sits in the top layer above
 * everything else. It copies the host's nearest `kawai-theme` value to match the themed
 * subtree it came from.
 */
@Directive({
  selector: '[kawaiTooltip]',
  host: {
    '(mouseenter)': 'tooltip.scheduleShow()',
    '(mouseleave)': 'tooltip.scheduleHide()',
    '(focusin)': 'tooltip.showOnFocus()',
    '(focusout)': 'tooltip.hide()',
  },
})
export class TooltipDirective {
  readonly options = input.required<string | KawaiDeepPartial<TooltipOptions> | null>({
    alias: 'kawaiTooltip',
  });
  /** The behaviour itself, shared with other directives that show a tooltip on their host. */
  protected readonly tooltip = new TooltipController(this.options);
}
