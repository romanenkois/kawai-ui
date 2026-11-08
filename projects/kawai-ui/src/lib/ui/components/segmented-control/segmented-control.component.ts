import { Component, input, output } from '@angular/core';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

let nextId = 0;

/**
 * A labelled row of mutually exclusive options, built on native radio inputs so arrow keys
 * move the selection. Stateless: the parent owns `value` and reacts to `valueChange`.
 */
@Component({
  selector: 'kawai-segmented-control',
  templateUrl: './segmented-control.component.html',
  styleUrl: './segmented-control.component.scss',
})
export class SegmentedControlComponent<T extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<SegmentedOption<T>[]>();
  readonly value = input.required<T>();
  readonly valueChange = output<T>();

  protected readonly labelId = `kawai-segmented-control-${nextId}-label`;
  protected readonly name = `kawai-segmented-control-${nextId++}`;
}
