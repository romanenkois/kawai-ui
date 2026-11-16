import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { TooltipDirective } from './tooltip.directive';

/**
 * jsdom has no layout, so `data-scroll-width` stands in for a clipped element: its
 * `scrollWidth` is that number while `clientWidth` stays 0.
 */
@Component({
  imports: [TooltipDirective],
  template: `
    <span id="hint">Hint</span>
    <button id="plain" type="button" aria-describedby="hint" kawaiTooltip="Saves the draft">
      Save
    </button>
    <button id="instant" type="button" [kawaiTooltip]="{ text: text(), showDelay: 0 }">Go</button>

    <button id="owner" type="button">
      <span id="inner" data-scroll-width="200" [kawaiTooltip]="truncated('Full heading')"
        >Full</span
      >
    </button>
    <label id="label" for="field" data-scroll-width="200" [kawaiTooltip]="truncated('Full label')">
      Full
    </label>
    <input id="field" />

    <p id="clipped" data-scroll-width="200" [kawaiTooltip]="truncated('Full text')">Full</p>
    <p id="fits" [kawaiTooltip]="truncated('Short')">Short</p>
  `,
})
class HostComponent {
  readonly text = signal<string>('First');

  truncated(text: string): { text: string; onlyWhenTruncated: boolean } {
    return { text, onlyWhenTruncated: true };
  }
}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  function element(id: string): HTMLElement {
    const found = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`#${id}`);
    if (!found) throw new Error(`#${id} not rendered`);
    return found;
  }
  function tooltip(): HTMLElement | null {
    return document.body.querySelector<HTMLElement>('.kawai-tooltip');
  }
  function hover(target: HTMLElement): void {
    target.dispatchEvent(new MouseEvent('mouseenter'));
  }
  function leave(target: HTMLElement): void {
    target.dispatchEvent(new MouseEvent('mouseleave'));
  }
  /** Focus that follows a Tab press, so the element matches `:focus-visible`. */
  function keyboardFocus(target: HTMLElement): void {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    target.focus();
  }
  function openTooltip(): HTMLElement {
    const open = tooltip();
    if (!open) throw new Error('tooltip not open');
    return open;
  }

  beforeEach(async () => {
    vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (
      this: Element,
    ): number {
      return Number(this.getAttribute('data-scroll-width') ?? 0);
    });
    TestBed.configureTestingModule({
      providers: [provideKawaiDefaults({ tooltip: { position: 'top' } })],
    });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('opens on hover only after the show delay, in the top layer', () => {
    vi.useFakeTimers();
    hover(element('plain'));
    vi.advanceTimersByTime(299);
    expect(tooltip()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(openTooltip().textContent).toBe('Saves the draft');
    expect(openTooltip().getAttribute('popover')).toBe('manual');
  });

  it('does not open when the pointer leaves before the show delay', () => {
    vi.useFakeTimers();
    hover(element('plain'));
    vi.advanceTimersByTime(100);
    leave(element('plain'));
    vi.advanceTimersByTime(1000);
    expect(tooltip()).toBeNull();
  });

  it('stays open while the pointer is over the tooltip, then hides after the hide delay', () => {
    vi.useFakeTimers();
    hover(element('instant'));
    const open = openTooltip();
    leave(element('instant'));
    vi.advanceTimersByTime(50);
    hover(open);
    vi.advanceTimersByTime(1000);
    expect(tooltip()).toBe(open);
    leave(open);
    vi.advanceTimersByTime(99);
    expect(tooltip()).toBe(open);
    vi.advanceTimersByTime(1);
    expect(tooltip()).toBeNull();
  });

  it('adds itself to an existing aria-describedby and restores it on hide', () => {
    const plain = element('plain');
    keyboardFocus(plain);
    expect(plain.getAttribute('aria-describedby')).toBe(`hint ${openTooltip().id}`);
    plain.blur();
    expect(tooltip()).toBeNull();
    expect(plain.getAttribute('aria-describedby')).toBe('hint');
  });

  it('does not open at once on focus from a click', () => {
    const plain = element('plain');
    plain.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    plain.focus();
    expect(tooltip()).toBeNull();
  });

  it('closes on Escape, listening on the document only while open', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(0);
    hover(element('instant'));
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(tooltip()).toBeNull();
    expect(remove.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
  });

  it('opens clipped text when the button around it takes keyboard focus', () => {
    keyboardFocus(element('owner'));
    expect(openTooltip().textContent).toBe('Full heading');
    // A truncation tooltip repeats the text, so it isn't linked as a description.
    expect(element('inner').hasAttribute('aria-describedby')).toBe(false);
    element('owner').blur();
    expect(tooltip()).toBeNull();
  });

  it('opens a clipped label when its control takes keyboard focus', () => {
    keyboardFocus(element('field'));
    expect(openTooltip().textContent).toBe('Full label');
  });

  it('makes static text a tab stop only while it is clipped', () => {
    expect(element('clipped').getAttribute('tabindex')).toBe('0');
    expect(element('fits').hasAttribute('tabindex')).toBe(false);
    // Text inside a control is reached through that control instead.
    expect(element('inner').hasAttribute('tabindex')).toBe(false);
    keyboardFocus(element('clipped'));
    expect(openTooltip().textContent).toBe('Full text');
  });

  it('follows text and defaults while open', async () => {
    hover(element('instant'));
    expect(openTooltip().textContent).toBe('First');
    fixture.componentInstance.text.set('Second');
    await fixture.whenStable();
    expect(openTooltip().textContent).toBe('Second');
    fixture.componentInstance.text.set('');
    await fixture.whenStable();
    expect(tooltip()).toBeNull();
  });
});
