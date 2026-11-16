import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KawaiDefaultsConfig, provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { expectNoAxeViolations } from '../../../testing/axe';
import { SegmentedControlComponent } from './segmented-control.component';
import { SegmentedOption } from './segmented-control.model';

@Component({
  imports: [SegmentedControlComponent],
  template: `
    <kawai-segmented-control
      id="plain"
      label="View"
      [options]="options"
      [value]="value()"
      (valueChange)="value.set($event)"
    />
    <kawai-segmented-control
      id="own"
      [label]="{ text: 'Mode', truncate: true }"
      [options]="options"
      value="grid"
    />
  `,
})
class HostComponent {
  readonly options: SegmentedOption<string>[] = [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
  ];
  readonly value = signal<string>('list');
}

describe('SegmentedControlComponent', () => {
  const appDefaults = signal<KawaiDefaultsConfig>({});
  let fixture: ComponentFixture<HostComponent>;

  function control(id: string): HTMLElement {
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`#${id}`);
    if (!element) throw new Error(`#${id} not rendered`);
    return element;
  }
  function label(id: string): HTMLElement {
    const element = control(id).querySelector<HTMLElement>('.label');
    if (!element) throw new Error(`#${id} .label not rendered`);
    return element;
  }

  beforeEach(async () => {
    appDefaults.set({ segmentedControl: { label: { truncate: false, align: 'center' } } });
    TestBed.configureTestingModule({ providers: [provideKawaiDefaults(appDefaults)] });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('resolves label options from the app level', () => {
    expect(label('plain').classList).not.toContain('truncate');
    expect(label('plain').style.textAlign).toBe('center');
  });

  it('lets instance options win field by field', () => {
    expect(label('own').classList).toContain('truncate'); // instance
    expect(label('own').style.textAlign).toBe('center'); // still the app level
  });

  it('names the radio group with the label', () => {
    const group = control('plain').querySelector('[role="radiogroup"]');
    expect(group?.getAttribute('aria-labelledby')).toBe(label('plain').id);
  });

  it('keeps the checked radio on `value` when the parent turns a change down', async () => {
    // `own` has a fixed value and no handler.
    const [list, grid] = Array.from(control('own').querySelectorAll('input'));
    list.click();
    await fixture.whenStable();
    expect(list.checked).toBe(false);
    expect(grid.checked).toBe(true);
  });

  it('has no axe violations', async () => {
    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });

  it('emits the chosen option', async () => {
    control('plain').querySelectorAll('input')[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('grid');
    const [list, grid] = Array.from(control('plain').querySelectorAll('input'));
    expect(list.checked).toBe(false);
    expect(grid.checked).toBe(true);
  });
});
