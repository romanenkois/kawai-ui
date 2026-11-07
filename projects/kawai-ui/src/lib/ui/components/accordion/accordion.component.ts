import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  input,
  output,
} from '@angular/core';

import { TooltipDirective } from '../tooltip/tooltip.directive';

export type AccordionOverflow = 'hidden' | 'scroll';

let nextId = 0;

/**
 * Collapsible section with a header button. Stateless: the parent owns `expanded` and reacts
 * to `toggled`. The body is the `ng-template` passed as content, rendered only while expanded.
 */
@Component({
  selector: 'app-accordion',
  imports: [NgTemplateOutlet, TooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'region', '[attr.aria-labelledby]': 'headingId' },
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {
  readonly heading = input.required<string>();
  readonly expanded = input.required<boolean>();
  /** What the body does with content wider than the accordion. */
  readonly overflow = input<AccordionOverflow>('hidden');
  readonly toggled = output<void>();

  protected readonly body = contentChild.required(TemplateRef);
  protected readonly headingId = `accordion-${nextId}-heading`;
  protected readonly bodyId = `accordion-${nextId++}-body`;
}
