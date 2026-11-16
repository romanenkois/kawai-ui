import { Component, signal } from '@angular/core';
import { InfoItem, InfoLink, InfoPanelComponent } from 'kawai-ui';

/** An order summary. Clicked links and buttons come back through `linkClicked`. */
@Component({
  selector: 'app-info-panel-page',
  imports: [InfoPanelComponent],
  template: `
    <section class="page">
      <h1>Info panel</h1>
      <kawai-info-panel [items]="items" [titleLevel]="2" (linkClicked)="clicked.set($event)" />
      <p class="note" aria-live="polite">
        @if (clicked(); as link) {
          Last clicked: {{ link.text }} ({{ link.value }})
        } @else {
          Click a tag or the button.
        }
      </p>
    </section>
  `,
})
export class InfoPanelPage {
  protected readonly items: InfoItem[] = [
    { type: 'title', text: 'Order #1042' },
    { type: 'simple-text', text: 'Placed yesterday, ships in 2 days.' },
    {
      type: 'fields',
      fields: [
        { label: 'Customer', value: 'Ada Lovelace' },
        {
          label: 'Tags',
          links: [
            { text: 'priority', value: 'priority' },
            { text: 'gift', value: 'gift' },
          ],
        },
        { label: 'Related', links: [], value: 'None' },
      ],
    },
    {
      type: 'table',
      columns: ['Item', 'Qty', 'Price'],
      rows: [
        { header: 'Notebook', cells: ['2', '12.00'] },
        { header: 'Pen', cells: ['5', '7.50'] },
      ],
      footer: { header: 'Total', cells: ['7', '19.50'] },
    },
    { type: 'button', link: { text: 'Open order', value: '1042' } },
  ];
  protected readonly clicked = signal<InfoLink | null>(null);
}
