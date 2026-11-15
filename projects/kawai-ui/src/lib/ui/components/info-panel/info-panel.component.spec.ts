import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KawaiDefaultsConfig, provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { InfoPanelComponent } from './info-panel.component';
import { InfoItem } from './info-panel.model';

const ITEMS: InfoItem[] = [
  {
    type: 'fields',
    fields: [
      { label: 'Inherits', links: [{ text: 'a', value: 'a' }] },
      { label: 'Own', links: [{ text: 'b', value: 'b' }], linksOverflow: 'wrap' },
    ],
  },
];

@Component({
  imports: [InfoPanelComponent],
  template: `
    <kawai-info-panel id="plain" [items]="items" />
    <kawai-info-panel id="panel" [items]="items" linksOverflow="wrap" />
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
    expect(scrolls('plain')).toEqual([true, false]);
  });

  it('lets the panel input win over the app default, and the field over both', () => {
    expect(scrolls('panel')).toEqual([false, false]);
  });

  it('falls back to the library default', async () => {
    appDefaults.set({});
    await fixture.whenStable();
    expect(scrolls('plain')).toEqual([false, false]);
  });
});
