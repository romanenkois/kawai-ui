import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KawaiDefaultsConfig, provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { expectNoAxeViolations } from '../../../testing/axe';
import { NumberStepperComponent } from './number-stepper.component';

/** A local level under the app level, plus instances with and without label options. */
@Component({
  imports: [NumberStepperComponent],
  providers: [provideKawaiDefaults({ numberStepper: { label: { truncate: false } } })],
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
      [label]="{ text: 'Count', align: 'center' }"
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
    expect(label('plain').classList).not.toContain('truncate'); // local level
  });

  it('lets the instance label options win', () => {
    expect(label('own').style.textAlign).toBe('center');
  });

  it('follows a signal default live', async () => {
    appDefaults.set({});
    await fixture.whenStable();
    expect(label('plain').style.textAlign).toBe('start'); // library default
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
