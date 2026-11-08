import { Injector, runInInjectionContext, signal } from '@angular/core';

import { KawaiDefaultsConfig, injectKawaiDefaults, provideKawaiDefaults } from './kawai-defaults';

const APP: KawaiDefaultsConfig = { accordion: { layout: 'separated' } };
const LOCAL: KawaiDefaultsConfig = { accordion: { indicator: 'start' } };

function levelsIn(injector: Injector): readonly KawaiDefaultsConfig[] {
  return runInInjectionContext(injector, () => injectKawaiDefaults())();
}

describe('provideKawaiDefaults', () => {
  it('gives no levels without a provider', () => {
    expect(levelsIn(Injector.create({ providers: [] }))).toEqual([]);
  });

  it('stacks nested providers, farthest first', () => {
    const app = Injector.create({ providers: [provideKawaiDefaults(APP)] });
    const local = Injector.create({ providers: [provideKawaiDefaults(LOCAL)], parent: app });
    expect(levelsIn(app)).toEqual([APP]);
    expect(levelsIn(local)).toEqual([APP, LOCAL]);
  });

  it('follows a signal config live', () => {
    const config = signal<KawaiDefaultsConfig>(APP);
    const injector = Injector.create({ providers: [provideKawaiDefaults(config)] });
    const levels = runInInjectionContext(injector, () => injectKawaiDefaults());
    expect(levels()).toEqual([APP]);
    config.set(LOCAL);
    expect(levels()).toEqual([LOCAL]);
  });
});
