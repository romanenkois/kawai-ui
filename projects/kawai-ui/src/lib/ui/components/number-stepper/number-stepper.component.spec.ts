import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KawaiDefaultsConfig, provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { expectNoAxeViolations } from '../../../testing/axe';
import { NumberStepperComponent } from './number-stepper.component';

/**
 * A local level under the app level, plus instances with and without label options. The local
 * level also sets the shared `label` key, which every component key beats.
 */
@Component({
  imports: [NumberStepperComponent],
  providers: [
    provideKawaiDefaults({
      label: { align: 'center', truncate: true },
      numberStepper: { label: { truncate: false } },
    }),
  ],
  template: `
    <kawai-number-stepper
      id="plain"
      label="Quantity"
      [value]="value()"
      [min]="0"
      [max]="5"
      (valueChange)="value.set($event)"
    />
    <kawai-number-stepper
      id="own"
      [label]="{ text: 'Count', align: 'center', position: 'start' }"
      increaseLabel="More {label}"
      [value]="5"
      [min]="0"
      [max]="5"
    />
  `,
})
class HostComponent {
  readonly value = signal<number>(2);
}

describe('NumberStepperComponent', () => {
  const appDefaults = signal<KawaiDefaultsConfig>({});
  let fixture: ComponentFixture<HostComponent>;

  function stepper(id: string): HTMLElement {
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`#${id}`);
    if (!element) throw new Error(`#${id} not rendered`);
    return element;
  }
  function label(id: string): HTMLElement {
    const element = stepper(id).querySelector<HTMLElement>('.label');
    if (!element) throw new Error(`#${id} .label not rendered`);
    return element;
  }

  beforeEach(async () => {
    appDefaults.set({ numberStepper: { label: { align: 'end' } } });
    TestBed.configureTestingModule({ providers: [provideKawaiDefaults(appDefaults)] });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('resolves label options through app and local levels', () => {
    expect(label('plain').textContent.trim()).toBe('Quantity');
    expect(label('plain').style.textAlign).toBe('end'); // app level
    expect(label('plain').classList).not.toContain('kawai-label-truncate'); // local level
  });

  it('lets the component key beat the shared label key, even from a farther level', async () => {
    // App-level `numberStepper.label` wins over the local level's shared `label`.
    expect(label('plain').style.textAlign).toBe('end');
    appDefaults.set({});
    await fixture.whenStable();
    expect(label('plain').style.textAlign).toBe('center'); // shared key, once nothing beats it
  });

  it('lets the instance label options win', () => {
    expect(label('own').style.textAlign).toBe('center');
  });

  it('puts the label on top by default and beside the field with position start', () => {
    expect(stepper('plain').classList).not.toContain('label-start');
    expect(stepper('own').classList).toContain('label-start');
  });

  it('follows a signal default live', async () => {
    appDefaults.set({});
    await fixture.whenStable();
    expect(label('plain').style.textAlign).toBe('center'); // next in the chain: the shared key
  });

  it('names the buttons from the label text and steps the value', async () => {
    const [decrease, increase] = Array.from(stepper('plain').querySelectorAll('button'));
    expect(decrease.getAttribute('aria-label')).toBe('Decrease Quantity');
    increase.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(3);
  });

  it('names the buttons from translated templates, nearest level first', async () => {
    appDefaults.set({
      numberStepper: { decreaseLabel: '{label} verringern', increaseLabel: '{label} erhöhen' },
    });
    await fixture.whenStable();
    const names = (id: string): (string | null)[] =>
      Array.from(stepper(id).querySelectorAll('button')).map((button) =>
        button.getAttribute('aria-label'),
      );
    expect(names('plain')).toEqual(['Quantity verringern', 'Quantity erhöhen']); // app level
    expect(names('own')).toEqual(['Count verringern', 'More Count']); // instance wins
  });

  it('has no axe violations', async () => {
    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });

  it('marks the button at a bound aria-disabled', () => {
    const increase = stepper('own').querySelectorAll('button')[1];
    expect(increase.getAttribute('aria-disabled')).toBe('true');
  });
});
