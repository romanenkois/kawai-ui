import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KawaiDefaultsConfig, provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { expectNoAxeViolations } from '../../../testing/axe';
import { InfoPanelComponent } from './info-panel.component';
import { InfoItem } from './info-panel.model';

const ITEMS: InfoItem[] = [
  { type: 'title', text: 'Order' },
  {
    type: 'fields',
    fields: [
      { label: 'Inherits', links: [{ text: 'a', value: 'a' }] },
      { label: 'Own', links: [{ text: 'b', value: 'b' }], linksOverflow: 'wrap' },
      // Repeated labels and several links without a value are valid data.
      {
        label: 'Own',
        links: [
          { text: 'c', value: null },
          { text: 'd', value: null },
        ],
        linksOverflow: 'wrap',
      },
    ],
  },
];

@Component({
  imports: [InfoPanelComponent],
  template: `
    <kawai-info-panel id="plain" [items]="items" />
    <kawai-info-panel id="panel" [items]="items" linksOverflow="wrap" [titleLevel]="5" />
  `,
})
class HostComponent {
  readonly items = ITEMS;
}

describe('InfoPanelComponent', () => {
  const appDefaults = signal<KawaiDefaultsConfig>({});
  let fixture: ComponentFixture<HostComponent>;

  function scrolls(id: string): boolean[] {
    const panel = (fixture.nativeElement as HTMLElement).querySelector(`#${id}`);
    return Array.from(panel?.querySelectorAll('dd.links') ?? []).map((dd) =>
      dd.classList.contains('scroll'),
    );
  }

  beforeEach(async () => {
    appDefaults.set({ infoPanel: { linksOverflow: 'scroll' } });
    TestBed.configureTestingModule({ providers: [provideKawaiDefaults(appDefaults)] });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('applies the app default to fields without their own linksOverflow', () => {
    expect(scrolls('plain')).toEqual([true, false, false]);
  });

  it('lets the panel input win over the app default, and the field over both', () => {
    expect(scrolls('panel')).toEqual([false, false, false]);
  });

  it('falls back to the library default', async () => {
    appDefaults.set({});
    await fixture.whenStable();
    expect(scrolls('plain')).toEqual([false, false, false]);
  });

  it('renders every field and link, also with repeated labels and null values', () => {
    const panel = (fixture.nativeElement as HTMLElement).querySelector('#plain');
    expect(panel?.querySelectorAll('dt')).toHaveLength(3);
    expect(panel?.querySelectorAll('dd.links button')).toHaveLength(4);
  });

  it('renders titles at the resolved level', async () => {
    const title = (id: string): string | undefined =>
      (fixture.nativeElement as HTMLElement).querySelector(`#${id} .title`)?.tagName;
    expect(title('plain')).toBe('H3'); // library default
    expect(title('panel')).toBe('H5'); // instance
    appDefaults.set({ infoPanel: { titleLevel: 2 } });
    await fixture.whenStable();
    expect(title('plain')).toBe('H2'); // app level
    expect(title('panel')).toBe('H5');
  });

  it('has no axe violations', async () => {
    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});
