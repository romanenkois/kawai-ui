import { resolveOptions, resolveOptionsChain, resolveValueChain } from './options';

interface Options {
  text: string;
  truncate: boolean;
  tooltip: { position: 'top' | 'bottom'; delay: number } | null;
  tags: string[];
}

const DEFAULTS: Options = {
  text: '',
  truncate: true,
  tooltip: { position: 'bottom', delay: 0 },
  tags: ['a', 'b'],
};

describe('resolveOptions', () => {
  it('returns a copy of the defaults when nothing is passed', () => {
    const resolved = resolveOptions<Options, 'text'>(undefined, DEFAULTS, 'text');
    expect(resolved).toEqual(DEFAULTS);
    expect(resolved).not.toBe(DEFAULTS);
    expect(resolved.tooltip).not.toBe(DEFAULTS.tooltip);
  });

  it('returns null for null, meaning off', () => {
    expect(resolveOptions<Options, 'text'>(null, DEFAULTS, 'text')).toBeNull();
  });

  it('applies a shorthand to the shorthand key', () => {
    expect(resolveOptions<Options, 'text'>('Hello', DEFAULTS, 'text')).toEqual({
      ...DEFAULTS,
      text: 'Hello',
    });
  });

  it('keeps defaults for fields left out', () => {
    expect(resolveOptions<Options, 'text'>({ truncate: false }, DEFAULTS, 'text')).toEqual({
      ...DEFAULTS,
      truncate: false,
    });
  });

  it('merges nested groups field by field', () => {
    const resolved = resolveOptions<Options, 'text'>(
      { tooltip: { position: 'top' } },
      DEFAULTS,
      'text',
    );
    expect(resolved.tooltip).toEqual({ position: 'top', delay: 0 });
  });

  it('lets null turn a nested group off', () => {
    expect(resolveOptions<Options, 'text'>({ tooltip: null }, DEFAULTS, 'text').tooltip).toBeNull();
  });

  it('replaces arrays instead of merging them', () => {
    expect(resolveOptions<Options, 'text'>({ tags: ['c'] }, DEFAULTS, 'text').tags).toEqual(['c']);
  });

  it('ignores fields explicitly set to undefined', () => {
    expect(resolveOptions<Options, 'text'>({ text: undefined }, DEFAULTS, 'text').text).toBe('');
  });

  it('never mutates the defaults', () => {
    const snapshot = structuredClone(DEFAULTS);
    resolveOptions<Options, 'text'>({ text: 'x', tooltip: { position: 'top' } }, DEFAULTS, 'text');
    expect(DEFAULTS).toEqual(snapshot);
  });
});

describe('resolveOptionsChain', () => {
  it('returns the defaults when no level sets anything', () => {
    expect(resolveOptionsChain([undefined, undefined], DEFAULTS, 'text')).toEqual(DEFAULTS);
  });

  it('takes each field from the nearest level that sets it', () => {
    const resolved = resolveOptionsChain(
      [{ truncate: false, tooltip: { position: 'top' } }, { tooltip: { delay: 5 } }, 'Hi'],
      DEFAULTS,
      'text',
    );
    expect(resolved).toEqual({
      ...DEFAULTS,
      text: 'Hi',
      truncate: false,
      tooltip: { position: 'top', delay: 5 },
    });
  });

  it('turns the option off from a null level down', () => {
    expect(resolveOptionsChain([{ truncate: false }, null], DEFAULTS, 'text')).toBeNull();
  });

  it('turns it back on below a null level, over the library defaults', () => {
    expect(
      resolveOptionsChain([{ text: 'app' }, null, { truncate: false }], DEFAULTS, 'text'),
    ).toEqual({ ...DEFAULTS, truncate: false });
  });

  it('never mutates the levels or the defaults', () => {
    const level = { tooltip: { position: 'top' as const } };
    const snapshot = structuredClone(DEFAULTS);
    resolveOptionsChain([level, { tooltip: { delay: 1 } }], DEFAULTS, 'text');
    expect(level).toEqual({ tooltip: { position: 'top' } });
    expect(DEFAULTS).toEqual(snapshot);
  });
});

describe('resolveValueChain', () => {
  it('returns the nearest defined level', () => {
    expect(resolveValueChain(['app', 'local', undefined], 'lib')).toBe('local');
  });

  it('falls back when no level is defined', () => {
    expect(resolveValueChain([undefined], 'lib')).toBe('lib');
  });
});
