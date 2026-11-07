import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { TooltipDirective } from '../tooltip/tooltip.directive';
import { InfoItem, InfoLink } from './info-panel.model';

/**
 * Renders a list of typed info items: titles, text, label/value fields, tables and buttons.
 * All text truncates to one line and shows its full value in a tooltip when cut off.
 */
@Component({
  selector: 'app-info-panel',
  imports: [TooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './info-panel.component.html',
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }

    /* Every text container truncates to one line; the tooltip shows the full text. */
    h3,
    p,
    dt,
    dd,
    th,
    td,
    button {
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    h3 {
      margin: 0.5rem 0 0.25rem;
      font: inherit;
      font-weight: 700;
      color: var(--color-secondary);
    }

    h3:first-child {
      margin-block-start: 0;
    }

    p {
      margin: 0.25rem 0 0;
    }

    .muted {
      color: var(--color-text-muted);
    }

    dl {
      display: grid;
      grid-template-columns: fit-content(50%) minmax(0, 1fr);
      gap: 0 0.75rem;
      margin: 0;
    }

    dt {
      color: var(--color-text-muted);
    }

    dd {
      margin: 0;
    }

    dd.links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.125rem 0.25rem;
      white-space: normal;
    }

    dd.links.scroll {
      flex-wrap: nowrap;
      overflow-x: auto;
    }

    dd.links button {
      flex: none;
    }

    table {
      inline-size: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }

    th,
    td {
      padding: 0 0.375rem;
      text-align: end;
    }

    th:first-child,
    td:first-child {
      padding-inline-start: 0;
    }

    thead th {
      color: var(--color-text-muted);
      font-weight: 400;
      border-block-end: 1px solid var(--color-border);
    }

    tfoot th,
    tfoot td {
      border-block-start: 1px solid var(--color-border);
      font-weight: 700;
    }

    button {
      max-inline-size: 100%;
      padding: 0 0.25rem;
      border: 1px solid var(--color-border);
      border-radius: 0.25rem;
      background: none;
      color: var(--color-primary);
      font: inherit;
      cursor: pointer;
    }

    button:hover {
      background: var(--color-surface-hover);
      color: var(--color-primary-hover);
    }

    button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 1px;
    }
  `,
})
export class InfoPanelComponent {
  readonly items = input.required<InfoItem[]>();
  readonly linkClicked = output<InfoLink>();
}
