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
  value: T[K] | KawaiDeepPartial<T> | undefined,
  defaults: T,
  shorthandKey: K,
): T;
export function resolveOptions<T extends object, K extends keyof T>(
  value: T[K] | KawaiDeepPartial<T> | null | undefined,
  defaults: T,
  shorthandKey: K,
): T | null;
export function resolveOptions<T extends object, K extends keyof T>(
  value: T[K] | KawaiDeepPartial<T> | null | undefined,
  defaults: T,
  shorthandKey: K,
): T | null {
  if (value === null) return null;
  if (value === undefined) return merge(defaults, {});
  if (isPlainObject(value)) return merge(defaults, value);
  return merge(defaults, { [shorthandKey]: value });
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
