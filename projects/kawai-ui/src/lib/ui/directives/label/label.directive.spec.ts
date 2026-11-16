import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KawaiDefaultsConfig, provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { expectNoAxeViolations } from '../../../testing/axe';
import { LabelDirective } from './label.directive';

/**
 * A local level under the app level. jsdom has no layout, so `data-scroll-width` stands in for
 * a clipped element: its `scrollWidth` is that number while `clientWidth` stays 0.
 */
@Component({
  imports: [LabelDirective],
  providers: [provideKawaiDefaults({ label: { tooltip: { position: 'top' } } })],
  template: `
    <label id="plain" for="email" data-scroll-width="200" [kawaiLabel]="text()"></label>
    <input id="email" />

    <span id="own" [kawaiLabel]="{ text: 'Range', align: 'center', truncate: true }"></span>
    <span id="fits" kawaiLabel="Short"></span>
    <span id="silent" data-scroll-width="200" [kawaiLabel]="{ text: 'Quiet', tooltip: null }">
    </span>
  `,
})
class HostComponent {
  readonly text = signal<string>('Email address');
}

describe('LabelDirective', () => {
  const appDefaults = signal<KawaiDefaultsConfig>({});
  let fixture: ComponentFixture<HostComponent>;

  function label(id: string): HTMLElement {
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`#${id}`);
    if (!element) throw new Error(`#${id} not rendered`);
    return element;
  }
  function tooltip(): HTMLElement | null {
    return document.body.querySelector<HTMLElement>('.kawai-tooltip');
  }
  function hover(target: HTMLElement): void {
    target.dispatchEvent(new MouseEvent('mouseenter'));
  }

  beforeEach(async () => {
    vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (
      this: Element,
    ): number {
      return Number(this.getAttribute('data-scroll-width') ?? 0);
    });
    appDefaults.set({ label: { align: 'end', truncate: false }, tooltip: { showDelay: 0 } });
    TestBed.configureTestingModule({ providers: [provideKawaiDefaults(appDefaults)] });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  afterEach(() => {
    label('plain').dispatchEvent(new FocusEvent('focusout'));
    vi.restoreAllMocks();
  });

  it('writes the text and follows it', async () => {
    expect(label('plain').textContent).toBe('Email address');
    fixture.componentInstance.text.set('Email');
    await fixture.whenStable();
    expect(label('plain').textContent).toBe('Email');
  });

  it('takes options from the shared label key at the app level', () => {
    expect(label('plain').style.textAlign).toBe('end');
    expect(label('plain').classList).not.toContain('kawai-label-truncate');
  });

  it('lets instance options win', () => {
    expect(label('own').style.textAlign).toBe('center');
    expect(label('own').classList).toContain('kawai-label-truncate');
  });

  it('follows a signal default live', async () => {
    appDefaults.set({ tooltip: { showDelay: 0 } });
    await fixture.whenStable();
    expect(label('plain').style.textAlign).toBe('start'); // library default
    expect(label('plain').classList).toContain('kawai-label-truncate');
  });

  it('shows the full text in a tooltip only while truncated and clipped', async () => {
    hover(label('plain'));
    expect(tooltip()).toBeNull(); // app level: truncate off

    appDefaults.set({ tooltip: { showDelay: 0 } });
    await fixture.whenStable();
    hover(label('fits'));
    expect(tooltip()).toBeNull(); // not clipped
    hover(label('plain'));
    expect(tooltip()?.textContent).toBe('Email address');
  });

  it('opens the tooltip while the labelled control has keyboard focus', async () => {
    appDefaults.set({});
    await fixture.whenStable();
    const field = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#email');
    if (!field) throw new Error('#email not rendered');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    field.focus();
    expect(tooltip()?.textContent).toBe('Email address');
    field.blur();
    expect(tooltip()).toBeNull();
  });

  it('shows no tooltip when the label turns it off', async () => {
    appDefaults.set({ tooltip: { showDelay: 0 } });
    await fixture.whenStable();
    hover(label('silent'));
    expect(tooltip()).toBeNull();
  });

  it('has no axe violations', async () => {
    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});
