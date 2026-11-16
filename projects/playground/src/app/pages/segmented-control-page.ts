import { Component, signal } from '@angular/core';
import { SegmentedControlComponent, SegmentedOption } from 'kawai-ui';

type Range = 'day' | 'week' | 'month';

/** A range switch. The page owns the value; arrow keys move the selection. */
@Component({
  selector: 'app-segmented-control-page',
  imports: [SegmentedControlComponent],
  template: `
    <section class="page">
      <h1>Segmented control</h1>
      <kawai-segmented-control
        label="Range"
        [options]="options"
        [value]="range()"
        (valueChange)="range.set($event)"
      />
      <p class="note" aria-live="polite">Showing data for the last {{ range() }}.</p>
    </section>
  `,
})
export class SegmentedControlPage {
  protected readonly options: SegmentedOption<Range>[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];
  protected readonly range = signal<Range>('week');
}
