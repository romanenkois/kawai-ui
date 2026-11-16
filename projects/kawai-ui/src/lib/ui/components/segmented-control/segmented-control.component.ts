import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  isDevMode,
  output,
} from '@angular/core';

import { injectKawaiDefaults } from '../../../defaults/kawai-defaults';
import { KawaiDeepPartial, resolveOptionsChain } from '../../../utils/options';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { TooltipOptions } from '../../directives/tooltip/tooltip.model';
import { KawaiLabelOptions } from '../../shared/label/label.model';
import { labelTooltip } from '../../shared/label/label.util';
import { KAWAI_SEGMENTED_CONTROL_DEFAULTS } from './segmented-control.constant';
import { SegmentedOption } from './segmented-control.model';

let nextId = 0;

/**
 * A labelled row of mutually exclusive options, built on native radio inputs so arrow keys
 * move the selection. Stateless: the parent owns `value` and reacts to `valueChange`; the
 * checked radio always follows `value`, also when the parent turns a change down.
 *
 * `label` takes the text or {@link KawaiLabelOptions}; options left out come from
 * `provideKawaiDefaults()` levels, then `KAWAI_SEGMENTED_CONTROL_DEFAULTS`. Option labels stay
 * on one line, with a tooltip on hover when truncated.
 */
@Component({
  selector: 'kawai-segmented-control',
  imports: [TooltipDirective],
  templateUrl: './segmented-control.component.html',
  styleUrl: './segmented-control.component.scss',
})
export class SegmentedControlComponent<T extends string> {
  /** Label text, or {@link KawaiLabelOptions}. Its text also names the radio group. */
  readonly label = input.required<string | KawaiDeepPartial<KawaiLabelOptions>>();
  readonly options = input.required<SegmentedOption<T>[]>();
  readonly value = input.required<T>();
  readonly valueChange = output<T>();

  private readonly defaultLevels = injectKawaiDefaults();
  protected readonly labelOptions = computed<KawaiLabelOptions>(() =>
    resolveOptionsChain(
      [...this.defaultLevels().map((level) => level.segmentedControl?.label), this.label()],
      KAWAI_SEGMENTED_CONTROL_DEFAULTS.label,
      'text',
    ),
  );
  /** Full-text tooltip for a truncated label. */
  protected readonly labelTooltip = computed<KawaiDeepPartial<TooltipOptions> | null>(() =>
    labelTooltip(this.labelOptions()),
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly labelId = `kawai-segmented-control-${nextId}-label`;
  protected readonly name = `kawai-segmented-control-${nextId++}`;

  constructor() {
    if (isDevMode()) {
      effect(() => {
        if (this.labelOptions().text) return;
        console.warn(
          'kawai-segmented-control: `label` has no text, so the radio group has no accessible name.',
        );
      });
    }
  }

  protected choose(value: T): void {
    this.valueChange.emit(value);
    // The browser has already checked the clicked radio. Put the radios back on `value`: if
    // the parent takes the change, the `[checked]` bindings move them on the next render; if
    // it doesn't, `value` never changes and nothing else would undo the browser's state.
    const current = this.value();
    this.host.nativeElement.querySelectorAll('input').forEach((radio, index) => {
      radio.checked = this.options()[index]?.value === current;
    });
  }
}
