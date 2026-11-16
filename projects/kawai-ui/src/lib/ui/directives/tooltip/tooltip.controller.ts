import { DOCUMENT } from '@angular/common';
import { DestroyRef, ElementRef, Signal, afterRenderEffect, computed, inject } from '@angular/core';

import { injectKawaiDefaults } from '../../../defaults/kawai-defaults';
import { KAWAI_THEME_ATTRIBUTE } from '../../../theme/tokens';
import { KawaiDeepPartial, resolveOptionsChain } from '../../../utils/options';
import { KAWAI_TOOLTIP_DEFAULTS } from './tooltip.constant';
import { TooltipOptions, TooltipPosition } from './tooltip.model';

const OPPOSITE: Record<TooltipPosition, TooltipPosition> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};
/** Gap between the host and the tooltip, and minimum distance to the viewport edge. */
const GAP_PX = 6;
/** Hosts that take keyboard focus themselves, so their own `focusin` opens the tooltip. */
const FOCUSABLE =
  'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]';
/** Controls whose focus opens the tooltip of text inside them (a heading inside a button). */
const OWNING_CONTROL = 'a[href], button, summary, [role="button"], [role="link"], [role="tab"]';
/**
 * Set on a host the controller made focusable because its text is clipped. `kawai-theme.css`
 * draws its focus ring.
 */
const TRUNCATED_ATTRIBUTE = 'data-kawai-truncated';

let nextId = 0;

/**
 * The tooltip behaviour behind `kawaiTooltip`, for any directive that shows a tooltip on its own
 * host (`kawaiLabel` uses it for the full text of a truncated label). Library internal.
 *
 * It resolves the options through the tooltip defaults chain, creates and places the tooltip,
 * and finds how the keyboard reaches it. The owning directive binds the host's `mouseenter`,
 * `mouseleave`, `focusin` and `focusout` to {@link scheduleShow}, {@link scheduleHide},
 * {@link showOnFocus} and {@link hide}.
 */
export class TooltipController {
  private readonly defaultLevels = injectKawaiDefaults();
  private readonly resolved: Signal<TooltipOptions | null>;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly id = `kawai-tooltip-${nextId++}`;
  private tooltip?: HTMLElement;
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;

  /** Set after the first render, when the DOM around the host exists. */
  private connected = false;
  /** The control whose keyboard focus opens this tooltip, when the host can't take focus. */
  private control: HTMLElement | null = null;
  /** True when the host has no way to get focus, so the controller adds `tabindex` while clipped. */
  private managesTabindex = false;
  private resizeObserver?: ResizeObserver;

  /** Scroll events do not bubble, so any scrolling ancestor is caught in the capture phase. */
  private readonly onScroll = (): void => {
    this.hide();
  };
  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.hide();
  };
  private readonly onResize = (): void => {
    this.update();
  };
  private readonly onControlFocus = (): void => {
    this.showOnFocus();
  };
  private readonly onControlBlur = (): void => {
    this.hide();
  };
  private readonly onTooltipEnter = (): void => {
    this.clearTimers();
  };
  private readonly onTooltipLeave = (): void => {
    this.scheduleHide();
  };

  /**
   * Must be created in an injection context (a field initializer or constructor of the
   * directive on the host). `options` is the same value `kawaiTooltip` takes.
   */
  constructor(options: Signal<string | KawaiDeepPartial<TooltipOptions> | null>) {
    this.resolved = computed<TooltipOptions | null>(() =>
      resolveOptionsChain(
        [...this.defaultLevels().map((level) => level.tooltip), options()],
        KAWAI_TOOLTIP_DEFAULTS,
        'text',
      ),
    );
    // After each render that changed the options: keep an open tooltip and the host's tab stop
    // in step with them. Never runs on the server.
    afterRenderEffect(() => {
      this.resolved();
      if (!this.connected) this.connect();
      this.syncTabStop();
      this.update();
    });
    inject(DestroyRef).onDestroy(() => {
      this.hide();
      this.resizeObserver?.disconnect();
      this.control?.removeEventListener('focus', this.onControlFocus);
      this.control?.removeEventListener('blur', this.onControlBlur);
    });
  }

  /** Hover: opens after `showDelay`. */
  scheduleShow(): void {
    this.clearTimers();
    if (this.tooltip) return;
    const delay = this.resolved()?.showDelay ?? 0;
    if (delay <= 0) {
      this.show();
      return;
    }
    this.showTimer = setTimeout(() => {
      this.show();
    }, delay);
  }

  /** Pointer left the host or the tooltip: closes after `hideDelay`, unless it enters the other. */
  scheduleHide(): void {
    this.clearTimers();
    if (!this.tooltip) return;
    const delay = this.resolved()?.hideDelay ?? 0;
    if (delay <= 0) {
      this.hide();
      return;
    }
    this.hideTimer = setTimeout(() => {
      this.hide();
    }, delay);
  }

  /** Keyboard focus opens at once. Focus from a click doesn't: hover already handles the pointer. */
  showOnFocus(): void {
    const focused = this.document.activeElement;
    if (focused && !isKeyboardFocus(focused)) return;
    this.clearTimers();
    this.show();
  }

  private show(): void {
    const options = this.resolved();
    if (this.tooltip || !options?.text) return;
    const { text, position, onlyWhenTruncated: truncationOnly } = options;
    const host = this.host.nativeElement;
    if (truncationOnly && !isClipped(host)) return;

    const tooltip = this.document.createElement('div');
    tooltip.id = this.id;
    tooltip.setAttribute('role', 'tooltip');
    // `manual`: only this controller opens and closes it. Opened below, it joins the top layer.
    tooltip.setAttribute('popover', 'manual');
    tooltip.textContent = text;
    const theme = host.closest(`[${KAWAI_THEME_ATTRIBUTE}]`)?.getAttribute(KAWAI_THEME_ATTRIBUTE);
    if (theme) tooltip.setAttribute(KAWAI_THEME_ATTRIBUTE, theme);
    // Styled by `.kawai-tooltip` in kawai-theme.css; only the position is set from here.
    tooltip.className = 'kawai-tooltip';
    tooltip.addEventListener('mouseenter', this.onTooltipEnter);
    tooltip.addEventListener('mouseleave', this.onTooltipLeave);
    this.document.body.appendChild(tooltip);
    // Missing only in engines without popover support, where the tooltip stays a fixed box.
    if (typeof tooltip.showPopover === 'function') tooltip.showPopover();
    this.tooltip = tooltip;
    this.place(host, tooltip, position);

    this.document.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
    this.document.addEventListener('keydown', this.onKeydown);
    this.document.defaultView?.addEventListener('resize', this.onResize);
    if (!truncationOnly) setDescribedBy(host, this.id, true);
  }

  hide(): void {
    this.clearTimers();
    if (!this.tooltip) return;
    this.tooltip.remove();
    this.tooltip = undefined;
    this.document.removeEventListener('scroll', this.onScroll, { capture: true });
    this.document.removeEventListener('keydown', this.onKeydown);
    this.document.defaultView?.removeEventListener('resize', this.onResize);
    setDescribedBy(this.host.nativeElement, this.id, false);
  }

  /** Brings an open tooltip in line with the current options and host position. */
  private update(): void {
    if (!this.tooltip) return;
    const options = this.resolved();
    if (!options?.text) {
      this.hide();
      return;
    }
    this.tooltip.textContent = options.text;
    this.place(this.host.nativeElement, this.tooltip, options.position);
  }

  private clearTimers(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this.showTimer = undefined;
    this.hideTimer = undefined;
  }

  /** Finds how keyboard focus reaches this tooltip: the host itself, an owning control, or neither. */
  private connect(): void {
    this.connected = true;
    const host = this.host.nativeElement;
    if (host.matches(FOCUSABLE)) return;

    const labelled = host.closest('label')?.control ?? null;
    this.control = labelled ?? host.parentElement?.closest<HTMLElement>(OWNING_CONTROL) ?? null;
    if (this.control) {
      this.control.addEventListener('focus', this.onControlFocus);
      this.control.addEventListener('blur', this.onControlBlur);
      return;
    }

    this.managesTabindex = true;
    if (typeof ResizeObserver === 'function') {
      this.resizeObserver = new ResizeObserver(() => {
        this.syncTabStop();
      });
      this.resizeObserver.observe(host);
    }
  }

  /** A host nothing else makes reachable is a tab stop exactly while its text is clipped. */
  private syncTabStop(): void {
    if (!this.managesTabindex) return;
    const host = this.host.nativeElement;
    const options = this.resolved();
    const clipped = !!options?.text && options.onlyWhenTruncated && isClipped(host);
    if (clipped === host.hasAttribute(TRUNCATED_ATTRIBUTE)) return;
    if (clipped) {
      host.setAttribute(TRUNCATED_ATTRIBUTE, '');
      host.setAttribute('tabindex', '0');
    } else {
      host.removeAttribute(TRUNCATED_ATTRIBUTE);
      host.removeAttribute('tabindex');
    }
  }

  /** Puts the tooltip on the preferred side, flips it if that side lacks room, clamps to the viewport. */
  private place(host: HTMLElement, tooltip: HTMLElement, preferred: TooltipPosition): void {
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

function isClipped(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth;
}

/** Whether the element shows a focus ring, i.e. focus came from the keyboard. */
function isKeyboardFocus(element: Element): boolean {
  try {
    return element.matches(':focus-visible');
  } catch {
    // An engine that can't parse `:focus-visible`: treat every focus as keyboard focus.
    return true;
  }
}

/** Adds or removes one id in the element's `aria-describedby`, keeping any other ids there. */
function setDescribedBy(element: HTMLElement, id: string, described: boolean): void {
  const ids = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  const others = ids.filter((existing) => existing !== id);
  const next = described ? [...others, id] : others;
  if (next.length === ids.length && !described) return;
  if (next.length) element.setAttribute('aria-describedby', next.join(' '));
  else element.removeAttribute('aria-describedby');
}
