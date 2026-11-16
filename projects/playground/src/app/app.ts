import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  KAWAI_THEME_ATTRIBUTE,
  KawaiBuiltInTheme,
  SegmentedControlComponent,
  SegmentedOption,
} from 'kawai-ui';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SegmentedControlComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Which kawai-ui this build runs against: source, built or packed. */
  protected readonly mode = KAWAI_UI_MODE;
  protected readonly links: NavLink[] = [
    { path: 'accordion', label: 'Accordion' },
    { path: 'info-panel', label: 'Info panel' },
    { path: 'label', label: 'Label' },
    { path: 'number-stepper', label: 'Number stepper' },
    { path: 'segmented-control', label: 'Segmented control' },
    { path: 'tooltip', label: 'Tooltip' },
  ];
  protected readonly themes: SegmentedOption<KawaiBuiltInTheme>[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ];
  protected readonly theme = signal<KawaiBuiltInTheme>('auto');

  constructor() {
    const root = inject(DOCUMENT).documentElement;
    effect(() => {
      root.setAttribute(KAWAI_THEME_ATTRIBUTE, this.theme());
    });
  }
}
