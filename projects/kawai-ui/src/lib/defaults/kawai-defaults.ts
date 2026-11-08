import {
  InjectionToken,
  Provider,
  Signal,
  computed,
  inject,
  isSignal,
  signal,
} from '@angular/core';

import type { AccordionDefaultsConfig } from '../ui/components/accordion/accordion.model';
import type { TooltipDefaultsConfig } from '../ui/directives/tooltip/tooltip.model';

/**
 * Defaults for kawai-ui components, given to {@link provideKawaiDefaults}. Every field is
 * optional; a field left out comes from the level above, and finally from the library.
 */
export interface KawaiDefaultsConfig {
  accordion?: AccordionDefaultsConfig;
  tooltip?: TooltipDefaultsConfig;
}

/** Every `provideKawaiDefaults()` level visible to an injector, farthest (app) first. */
const KAWAI_DEFAULTS = new InjectionToken<Signal<readonly KawaiDefaultsConfig[]>>('KAWAI_DEFAULTS');

const NO_DEFAULTS: Signal<readonly KawaiDefaultsConfig[]> = signal<readonly KawaiDefaultsConfig[]>(
  [],
).asReadonly();

/**
 * Sets kawai-ui defaults for everything below the injector it's provided in: the app
 * (`app.config.ts`), a route, or a component's `providers`. Levels stack: each one only states
 * what it changes, and a component resolves
 * its inputs → nearest level → … → app level → library defaults.
 *
 * Pass a signal to change defaults at runtime; components below update live.
 *
 * ```ts
 * providers: [provideKawaiDefaults({ accordion: { layout: 'separated', indicator: 'start' } })]
 * ```
 */
export function provideKawaiDefaults(
  config: KawaiDefaultsConfig | Signal<KawaiDefaultsConfig>,
): Provider {
  return {
    provide: KAWAI_DEFAULTS,
    useFactory: (): Signal<readonly KawaiDefaultsConfig[]> => {
      const parent = inject(KAWAI_DEFAULTS, { optional: true, skipSelf: true }) ?? NO_DEFAULTS;
      const own: Signal<KawaiDefaultsConfig> = isSignal(config)
        ? config
        : signal<KawaiDefaultsConfig>(config).asReadonly();
      return computed<readonly KawaiDefaultsConfig[]>(() => [...parent(), own()]);
    },
  };
}

/** The defaults levels for the current injection context, farthest first. Library internal. */
export function injectKawaiDefaults(): Signal<readonly KawaiDefaultsConfig[]> {
  return inject(KAWAI_DEFAULTS, { optional: true }) ?? NO_DEFAULTS;
}
