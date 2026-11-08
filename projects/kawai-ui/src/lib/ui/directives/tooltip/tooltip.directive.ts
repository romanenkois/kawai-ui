import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, booleanAttribute, inject, input } from '@angular/core';

import { KAWAI_THEME_ATTRIBUTE } from '../../../theme/tokens';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const OPPOSITE: Record<TooltipPosition, TooltipPosition> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};
/** Gap between the host and the tooltip, and minimum distance to the viewport edge. */
const GAP_PX = 6;

let nextId = 0;

/**
 * Plain-text tooltip shown on hover and keyboard focus, hidden on leave, blur, Escape and scroll.
 * Placed on `kawaiTooltipPosition` (bottom by default) and flipped to the opposite side when it
 * would leave the viewport.
 *
 * With `kawaiTooltipOnlyWhenTruncated`, it only opens when the host's own content is clipped
 * (`scrollWidth > clientWidth`), checked at the moment it would open. The host must be the
 * element that clips, e.g. with `overflow: hidden; text-overflow: ellipsis`. Such a tooltip
 * repeats text already in the DOM, so it is not linked through `aria-describedby`.
 *
 * The tooltip is appended to <body>, so it copies the host's nearest `kawai-theme` value to
 * match the themed subtree it came from.
 */
@Directive({
  selector: '[kawaiTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(focusin)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusout)': 'hide()',
    '(document:keydown.escape)': 'hide()',
  },
})
export class TooltipDirective {
  readonly text = input.required<string>({ alias: 'kawaiTooltip' });
  readonly position = input<TooltipPosition>('bottom', { alias: 'kawaiTooltipPosition' });
  /** Only open when the host's content is truncated. Off by default, so nothing is measured. */
  readonly onlyWhenTruncated = input<boolean, unknown>(false, {
    alias: 'kawaiTooltipOnlyWhenTruncated',
    transform: booleanAttribute,
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly id = `kawai-tooltip-${nextId++}`;
  private tooltip?: HTMLElement;
  /** Scroll events do not bubble, so any scrolling ancestor is caught in the capture phase. */
  private readonly onScroll = (): void => {
    this.hide();
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.hide();
    });
  }

  protected show(): void {
    const text = this.text();
    if (this.tooltip || !text) return;
    const host = this.host.nativeElement;
    const truncationOnly = this.onlyWhenTruncated();
    if (truncationOnly && host.scrollWidth <= host.clientWidth) return;

    const tooltip = this.document.createElement('div');
    tooltip.id = this.id;
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = text;
    const theme = host.closest(`[${KAWAI_THEME_ATTRIBUTE}]`)?.getAttribute(KAWAI_THEME_ATTRIBUTE);
    if (theme) tooltip.setAttribute(KAWAI_THEME_ATTRIBUTE, theme);
    // Styled by `.kawai-tooltip` in kawai-theme.css; only the position is set from here.
    tooltip.className = 'kawai-tooltip';
    this.document.body.appendChild(tooltip);
    this.tooltip = tooltip;
    this.place(host, tooltip);
    this.document.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
    if (!truncationOnly) host.setAttribute('aria-describedby', this.id);
  }

  protected hide(): void {
    if (!this.tooltip) return;
    this.tooltip.remove();
    this.tooltip = undefined;
    this.document.removeEventListener('scroll', this.onScroll, { capture: true });
    const host = this.host.nativeElement;
    if (host.getAttribute('aria-describedby') === this.id) host.removeAttribute('aria-describedby');
  }

  /** Puts the tooltip on the preferred side, flips it if that side lacks room, clamps to the viewport. */
  private place(host: HTMLElement, tooltip: HTMLElement): void {
    const anchor = host.getBoundingClientRect();
    const { width, height } = tooltip.getBoundingClientRect();
    const viewWidth = this.document.documentElement.clientWidth;
    const viewHeight = this.document.documentElement.clientHeight;

    const coordinates = (side: TooltipPosition): { x: number; y: number } => {
      switch (side) {
        case 'top':
          return { x: anchor.left + (anchor.width - width) / 2, y: anchor.top - height - GAP_PX };
        case 'bottom':
          return { x: anchor.left + (anchor.width - width) / 2, y: anchor.bottom + GAP_PX };
        case 'left':
          return { x: anchor.left - width - GAP_PX, y: anchor.top + (anchor.height - height) / 2 };
        case 'right':
          return { x: anchor.right + GAP_PX, y: anchor.top + (anchor.height - height) / 2 };
      }
    };
    const fits = ({ x, y }: { x: number; y: number }): boolean =>
      x >= GAP_PX &&
      y >= GAP_PX &&
      x + width <= viewWidth - GAP_PX &&
      y + height <= viewHeight - GAP_PX;

    const preferred = this.position();
    let point = coordinates(preferred);
    if (!fits(point)) {
      const flipped = coordinates(OPPOSITE[preferred]);
      if (fits(flipped)) point = flipped;
    }
    const x = clamp(point.x, GAP_PX, viewWidth - width - GAP_PX);
    const y = clamp(point.y, GAP_PX, viewHeight - height - GAP_PX);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
