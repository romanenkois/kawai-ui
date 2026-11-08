import { Directive, TemplateRef, inject } from '@angular/core';

import { AccordionTemplateContext } from './accordion.model';

/**
 * Marks the accordion's body: `<ng-template kawaiAccordionBody>…</ng-template>`. Required.
 * Rendered on first expand, then kept (hidden while collapsed).
 */
@Directive({ selector: 'ng-template[kawaiAccordionBody]' })
export class AccordionBodyDirective {
  readonly template = inject<TemplateRef<AccordionTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: AccordionBodyDirective,
    _context: unknown,
  ): _context is AccordionTemplateContext {
    return true;
  }
}

/**
 * Replaces the heading text: `<ng-template kawaiAccordionHeading let-expanded>…</ng-template>`.
 * The template lays itself out; pass `heading` text too when it has no text of its own, so the
 * header button keeps an accessible name.
 */
@Directive({ selector: 'ng-template[kawaiAccordionHeading]' })
export class AccordionHeadingDirective {
  readonly template = inject<TemplateRef<AccordionTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: AccordionHeadingDirective,
    _context: unknown,
  ): _context is AccordionTemplateContext {
    return true;
  }
}

/**
 * Replaces the chevron: `<ng-template kawaiAccordionIndicator let-expanded>…</ng-template>`.
 * Not rotated unless `indicator.rotate` is set. Hidden from screen readers, like the chevron.
 */
@Directive({ selector: 'ng-template[kawaiAccordionIndicator]' })
export class AccordionIndicatorDirective {
  readonly template = inject<TemplateRef<AccordionTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: AccordionIndicatorDirective,
    _context: unknown,
  ): _context is AccordionTemplateContext {
    return true;
  }
}
