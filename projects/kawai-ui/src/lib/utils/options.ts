import { TemplateRef } from '@angular/core';

/** Option values that replace their default as a whole instead of merging into it. */
type Atomic = readonly unknown[] | TemplateRef<unknown> | ((...args: never[]) => unknown);

type DeepPartialValue<V> = V extends Atomic ? V : V extends object ? KawaiDeepPartial<V> : V;

/**
 * An options object where every field, at any depth, may be left out; left-out fields keep
 * their default. Nested option groups merge with their defaults field by field. Arrays,
 * templates and functions replace the default as a whole.
 */
export type KawaiDeepPartial<T> = { [K in keyof T]?: DeepPartialValue<T[K]> };

/**
 * Resolves an options input (`shorthand | KawaiDeepPartial<T> | null | undefined`) against
 * its defaults:
 * - `undefined` (not passed): the defaults
 * - `null`: `null`, meaning "off". Only inputs where off makes sense accept it.
 * - a shorthand value: the defaults with `shorthandKey` set to it. Shorthands are primitives.
 * - an options object: deep-merged into the defaults, see {@link KawaiDeepPartial}
 *
 * Always returns a new object; `defaults` is never mutated.
 */
export function resolveOptions<T extends object, K extends keyof T>(
  value: NoInfer<T>[K] | KawaiDeepPartial<NoInfer<T>> | undefined,
  defaults: T,
  shorthandKey: K,
): T;
export function resolveOptions<T extends object, K extends keyof T>(
  value: NoInfer<T>[K] | KawaiDeepPartial<NoInfer<T>> | null | undefined,
  defaults: T,
  shorthandKey: K,
): T | null;
export function resolveOptions<T extends object, K extends keyof T>(
  value: NoInfer<T>[K] | KawaiDeepPartial<NoInfer<T>> | null | undefined,
  defaults: T,
  shorthandKey: K,
): T | null {
  if (value === null) return null;
  if (value === undefined) return merge(defaults, {});
  if (isPlainObject(value)) return merge(defaults, value);
  return merge(defaults, { [shorthandKey]: value });
}

/**
 * Resolves an options value given at several levels, ordered from farthest to nearest (e.g.
 * app defaults, local defaults, the input), against the library defaults. Each level is
 * applied like {@link resolveOptions}: `undefined` skips the level, `null` turns the option
 * off, and a later shorthand or object turns it back on, merging over the library defaults.
 */
export function resolveOptionsChain<T extends object, K extends keyof T>(
  levels: readonly (NoInfer<T>[K] | KawaiDeepPartial<NoInfer<T>> | undefined)[],
  defaults: T,
  shorthandKey: K,
): T;
export function resolveOptionsChain<T extends object, K extends keyof T>(
  levels: readonly (NoInfer<T>[K] | KawaiDeepPartial<NoInfer<T>> | null | undefined)[],
  defaults: T,
  shorthandKey: K,
): T | null;
export function resolveOptionsChain<T extends object, K extends keyof T>(
  levels: readonly (NoInfer<T>[K] | KawaiDeepPartial<NoInfer<T>> | null | undefined)[],
  defaults: T,
  shorthandKey: K,
): T | null {
  let combined: KawaiDeepPartial<T> | null | undefined;
  for (const level of levels) {
    if (level === undefined) continue;
    if (level === null) {
      combined = null;
      continue;
    }
    const partial: KawaiDeepPartial<T> = isPlainObject(level)
      ? level
      : ({ [shorthandKey]: level } as KawaiDeepPartial<T>);
    combined = combined ? merge(combined, partial) : partial;
  }
  return resolveOptions(combined, defaults, shorthandKey);
}

/** For plain (non-options) inputs: the nearest level that isn't `undefined`, else `fallback`. */
export function resolveValueChain<T>(levels: readonly (T | undefined)[], fallback: T): T {
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    if (level !== undefined) return level;
  }
  return fallback;
}

function merge<T extends object>(base: T, override: object): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(base)) {
    result[key] = isPlainObject(value) ? merge(value, {}) : value;
  }
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const current = result[key];
    result[key] = isPlainObject(value) && isPlainObject(current) ? merge(current, value) : value;
  }
  return result as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
