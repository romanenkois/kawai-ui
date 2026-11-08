import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  contentChild,
  input,
  isDevMode,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';

import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { TooltipOptions } from '../../directives/tooltip/tooltip.model';
import { KawaiDeepPartial, resolveOptions } from '../../../utils/options';
import {
  AccordionBodyDirective,
  AccordionHeadingDirective,
  AccordionIndicatorDirective,
} from './accordion-templates.directive';
import {
  AccordionHeadingOptions,
  AccordionIndicatorOptions,
  AccordionIndicatorPosition,
  AccordionBodyLayout,
  AccordionLayoutOptions,
  AccordionOverflow,
  AccordionTemplateContext,
  KAWAI_ACCORDION_HEADING_DEFAULTS,
  KAWAI_ACCORDION_INDICATOR_DEFAULTS,
  KAWAI_ACCORDION_LAYOUT_DEFAULTS,
} from './accordion.model';

let nextId = 0;

/**
 * Collapsible section with a header button. Stateless: the parent owns `expanded` and reacts
 * to `toggled`. The body is an `<ng-template kawaiAccordionBody>`; it renders on first expand,
 * then stays so expanding and collapsing can animate its height (instant with reduced motion).
 *
 * `heading`, `indicator` and `layout` take a shorthand or an options object; see
 * {@link AccordionHeadingOptions}, {@link AccordionIndicatorOptions} and
 * {@link AccordionLayoutOptions}. Bordered and attached by default. Templates marked
 * `kawaiAccordionHeading` and `kawaiAccordionIndicator` replace the heading text and the chevron.
 */
@Component({
  selector: 'kawai-accordion',
  imports: [NgTemplateOutlet, TooltipDirective],
  host: {
    role: 'region',
    '[attr.aria-labelledby]': 'headingId',
    '[class.expanded]': 'expanded()',
    '[class.bordered]': 'layoutOptions().border',
    '[class.separated]': "layoutOptions().body === 'separated'",
    '[class.square-inner]': "layoutOptions().innerCorners === 'square'",
  },
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {
  /** Heading text, or {@link AccordionHeadingOptions}. Optional with a heading template. */
  readonly heading = input<string | KawaiDeepPartial<AccordionHeadingOptions>>();
  /** Indicator position, {@link AccordionIndicatorOptions}, or `null` for no indicator. */
  readonly indicator = input<
    AccordionIndicatorPosition | KawaiDeepPartial<AccordionIndicatorOptions> | null
  >();
  /** Body layout (`attached` or `separated`), or {@link AccordionLayoutOptions}. */
  readonly layout = input<AccordionBodyLayout | KawaiDeepPartial<AccordionLayoutOptions>>();
  readonly expanded = input.required<boolean>();
  /** What the body does with content wider than the accordion. */
  readonly overflow = input<AccordionOverflow>('hidden');
  readonly toggled = output<void>();

  protected readonly bodyTemplate =
    contentChild.required<AccordionBodyDirective>(AccordionBodyDirective);
  protected readonly headingTemplate =
    contentChild<AccordionHeadingDirective>(AccordionHeadingDirective);
  protected readonly indicatorTemplate = contentChild<AccordionIndicatorDirective>(
    AccordionIndicatorDirective,
  );

  protected readonly headingOptions = computed<AccordionHeadingOptions>(() =>
    resolveOptions(this.heading(), KAWAI_ACCORDION_HEADING_DEFAULTS, 'text'),
  );
  protected readonly indicatorOptions = computed<AccordionIndicatorOptions | null>(() =>
    resolveOptions(
      this.indicator(),
      { ...KAWAI_ACCORDION_INDICATOR_DEFAULTS, rotate: !this.indicatorTemplate() },
      'position',
    ),
  );
  protected readonly layoutOptions = computed<AccordionLayoutOptions>(() =>
    resolveOptions(this.layout(), KAWAI_ACCORDION_LAYOUT_DEFAULTS, 'body'),
  );
  /** Full-text tooltip for a truncated text heading. */
  protected readonly labelTooltip = computed<KawaiDeepPartial<TooltipOptions> | null>(() => {
    const { text, truncate, tooltip } = this.headingOptions();
    return truncate && tooltip
      ? { text, position: tooltip.position, onlyWhenTruncated: true }
      : null;
  });
  /** With a heading template, the heading text labels the button; otherwise its content does. */
  protected readonly buttonLabel = computed<string | null>(() => {
    const { text } = this.headingOptions();
    return this.headingTemplate() && text ? text : null;
  });
  protected readonly context = computed<AccordionTemplateContext>(() => ({
    $implicit: this.expanded(),
    expanded: this.expanded(),
  }));
  /** False until the first expand, then stays true so collapsing can animate. */
  protected readonly bodyRendered = linkedSignal<boolean, boolean>({
    source: this.expanded,
    computation: (expanded, previous) => expanded || (previous?.value ?? false),
  });

  protected readonly headingId = `kawai-accordion-${nextId}-heading`;
  protected readonly bodyId = `kawai-accordion-${nextId++}-body`;

  private readonly label = viewChild.required<ElementRef<HTMLElement>>('label');

  constructor() {
    if (isDevMode()) {
      afterRenderEffect(() => {
        if (this.buttonLabel() || this.label().nativeElement.textContent.trim()) return;
        console.warn(
          'kawai-accordion: the header button has no accessible name. Pass `heading` text when ' +
            'the heading template has no text of its own.',
        );
      });
    }
  }
}
