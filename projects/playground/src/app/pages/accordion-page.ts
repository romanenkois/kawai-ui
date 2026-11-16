import { Component, signal } from '@angular/core';
import { AccordionBodyDirective, AccordionComponent } from 'kawai-ui';

interface Section {
  id: string;
  heading: string;
  body: string;
}

/** A small FAQ. The page owns which section is open, so only one is open at a time. */
@Component({
  selector: 'app-accordion-page',
  imports: [AccordionComponent, AccordionBodyDirective],
  template: `
    <section class="page">
      <h1>Accordion</h1>
      <div>
        @for (section of sections; track section.id) {
          <kawai-accordion
            [heading]="section.heading"
            [expanded]="open() === section.id"
            (toggled)="toggle(section.id)"
          >
            <ng-template kawaiAccordionBody>
              <p>{{ section.body }}</p>
            </ng-template>
          </kawai-accordion>
        }
      </div>
    </section>
  `,
})
export class AccordionPage {
  protected readonly sections: Section[] = [
    {
      id: 'shipping',
      heading: 'How long does shipping take?',
      body: 'Orders leave the warehouse within two working days and arrive in three to five.',
    },
    {
      id: 'returns',
      heading: 'Can I return an item?',
      body: 'Yes, within 30 days of delivery, as long as it is unused and in its packaging.',
    },
    {
      id: 'payment',
      heading: 'Which payment methods do you accept, and can I split one order across several?',
      body: 'Cards and bank transfer. One order takes one payment method.',
    },
  ];
  protected readonly open = signal<string | null>('shipping');

  protected toggle(id: string): void {
    this.open.update((current) => (current === id ? null : id));
  }
}
