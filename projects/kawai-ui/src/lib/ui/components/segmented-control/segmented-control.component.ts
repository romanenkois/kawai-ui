import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

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
  selector: 'app-segmented-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './segmented-control.component.html',
  styles: `
    :host {
      display: grid;
      grid-template-columns: fit-content(50%) minmax(0, 1fr);
      gap: 0 0.75rem;
      align-items: center;
    }

    .label {
      color: var(--color-text-muted);
    }

    .options {
      display: flex;
      min-inline-size: 0;
      border: 1px solid var(--color-border);
      border-radius: 0.25rem;
    }

    label {
      position: relative;
      flex: 1 1 0;
      min-inline-size: 0;
    }

    label + label {
      border-inline-start: 1px solid var(--color-border);
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
      padding: 0 0.5rem;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--color-primary);
    }

    label:hover span {
      background: var(--color-surface-hover);
      color: var(--color-primary-hover);
    }

    input:checked + span {
      background: var(--color-surface-hover);
      color: var(--color-text);
      font-weight: 700;
    }

    input:focus-visible + span {
      outline: 2px solid var(--color-primary);
      outline-offset: 1px;
    }
  `,
})
export class SegmentedControlComponent<T extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<SegmentedOption<T>[]>();
  readonly value = input.required<T>();
  readonly valueChange = output<T>();

  protected readonly labelId = `segmented-${nextId}-label`;
  protected readonly name = `segmented-${nextId++}`;
}
