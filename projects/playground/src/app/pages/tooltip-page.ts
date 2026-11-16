import { Component } from '@angular/core';
import { TooltipDirective } from 'kawai-ui';

/** A described button, and text that only gets a tooltip while it is cut off. */
@Component({
  selector: 'app-tooltip-page',
  imports: [TooltipDirective],
  template: `
    <section class="page">
      <h1>Tooltip</h1>
      <div>
        <button type="button" [kawaiTooltip]="{ text: 'Saves the draft', position: 'right' }">
          Save
        </button>
      </div>
      <p class="clipped" [kawaiTooltip]="{ text: long, onlyWhenTruncated: true }">{{ long }}</p>
      <p class="note">
        Hover or focus the button. The line above shows a tooltip only while cut off.
      </p>
    </section>
  `,
  styles: `
    .clipped {
      max-inline-size: 16rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class TooltipPage {
  protected readonly long =
    'A file name that is far too long to fit on one line of this narrow column.pdf';
}
