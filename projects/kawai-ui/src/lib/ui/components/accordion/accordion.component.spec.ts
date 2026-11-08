import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KawaiDefaultsConfig, provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { AccordionBodyDirective } from './accordion-templates.directive';
import { AccordionComponent } from './accordion.component';

/** A local level under the app level, plus instances with and without their own inputs. */
@Component({
  imports: [AccordionComponent, AccordionBodyDirective],
  providers: [provideKawaiDefaults({ accordion: { layout: { innerCorners: 'square' } } })],
  template: `
    <kawai-accordion id="plain" heading="Plain" [expanded]="true">
      <ng-template kawaiAccordionBody>Body</ng-template>
    </kawai-accordion>
    <kawai-accordion id="own" heading="Own" [expanded]="true" layout="attached" indicator="start">
      <ng-template kawaiAccordionBody>Body</ng-template>
    </kawai-accordion>
  `,
})
class HostComponent {}

describe('AccordionComponent defaults chain', () => {
  const appDefaults = signal<KawaiDefaultsConfig>({});
  let fixture: ComponentFixture<HostComponent>;

  function accordion(id: string): HTMLElement {
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`#${id}`);
    if (!element) throw new Error(`#${id} not rendered`);
    return element;
  }

  beforeEach(async () => {
    appDefaults.set({ accordion: { layout: 'separated', indicator: null } });
    TestBed.configureTestingModule({ providers: [provideKawaiDefaults(appDefaults)] });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('merges app and local levels for an instance without inputs', () => {
    const plain = accordion('plain');
    expect(plain.classList).toContain('separated'); // app level
    expect(plain.classList).toContain('square-inner'); // local level
    expect(plain.classList).toContain('bordered'); // library default
    expect(plain.querySelector('.indicator')).toBeNull(); // app level: null
  });

  it('lets instance inputs win, and turn a null default back on', () => {
    const own = accordion('own');
    expect(own.classList).not.toContain('separated');
    expect(own.querySelector('button')?.classList).toContain('indicator-start');
    expect(own.querySelector('.indicator svg')).not.toBeNull();
  });

  it('updates when a signal default changes', async () => {
    appDefaults.set({ accordion: { layout: { border: false } } });
    await fixture.whenStable();
    const plain = accordion('plain');
    expect(plain.classList).not.toContain('separated');
    expect(plain.classList).not.toContain('bordered');
    expect(plain.querySelector('.indicator svg')).not.toBeNull();
  });
});
