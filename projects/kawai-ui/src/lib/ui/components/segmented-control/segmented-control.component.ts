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
  styles: `
    :host {
      display: grid;
      grid-template-columns: fit-content(50%) minmax(0, 1fr);
      gap: 0 var(--kawai-comp-segmented-control-gap, var(--kawai-sys-space-lg));
      align-items: center;
      font-family: var(--kawai-sys-font-family);
    }

    .label {
      color: var(--kawai-comp-segmented-control-label-color, var(--kawai-sys-color-text-muted));
    }

    .options {
      display: flex;
      min-inline-size: 0;
      border: var(--kawai-sys-border-width) solid
        var(--kawai-comp-segmented-control-border-color, var(--kawai-sys-color-border));
      border-radius: var(--kawai-comp-segmented-control-radius, var(--kawai-sys-radius-sm));
    }

    label {
      position: relative;
      flex: 1 1 0;
      min-inline-size: 0;
    }

    label + label {
      border-inline-start: var(--kawai-sys-border-width) solid
        var(--kawai-comp-segmented-control-border-color, var(--kawai-sys-color-border));
    }

    /* The native radio stays focusable and announced; the span is what is seen. */
    input {
      position: absolute;
      inset: 0;
      margin: 0;
      opacity: 0;
      cursor: pointer;
    }

    .options span {
      display: block;
      padding: var(--kawai-comp-segmented-control-option-padding, 0 var(--kawai-sys-space-md));
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--kawai-comp-segmented-control-option-color, var(--kawai-sys-color-primary));
    }

    label:hover span {
      background: var(
        --kawai-comp-segmented-control-option-background-hover,
        var(--kawai-sys-color-surface-hover)
      );
      color: var(
        --kawai-comp-segmented-control-option-color-hover,
        var(--kawai-sys-color-primary-hover)
      );
    }

    input:checked + span {
      background: var(
        --kawai-comp-segmented-control-option-background-checked,
        var(--kawai-sys-color-surface-hover)
      );
      color: var(--kawai-comp-segmented-control-option-color-checked, var(--kawai-sys-color-text));
      font-weight: var(
        --kawai-comp-segmented-control-option-font-weight-checked,
        var(--kawai-sys-font-weight-bold)
      );
    }

    input:focus-visible + span {
      outline: var(--kawai-sys-focus-ring-width) solid
        var(--kawai-comp-segmented-control-focus-ring-color, var(--kawai-sys-color-primary));
      outline-offset: 1px;
    }
  `,
})
export class SegmentedControlComponent<T extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<SegmentedOption<T>[]>();
  readonly value = input.required<T>();
  readonly valueChange = output<T>();

  protected readonly labelId = `kawai-segmented-control-${nextId}-label`;
  protected readonly name = `kawai-segmented-control-${nextId++}`;
}
