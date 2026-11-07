// Checks the kawai-ui theme:
//  1. every `--kawai-*` custom property used in the library is listed in tokens.ts, and vice versa;
//  2. the built-in light and dark palettes meet WCAG AA contrast.
// Run with `npm run check:theme`. Exits 1 on any failure.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LIB = join(import.meta.dirname, '../projects/kawai-ui');
const THEME_CSS = join(LIB, 'styles/kawai-theme.css');
const TOKENS_TS = join(LIB, 'src/lib/theme/tokens.ts');

const failures = [];
const tokenNames = (text) =>
  new Set(
    [...text.matchAll(/--kawai-[a-z0-9-]+/g)].map(([m]) => m).filter((m) => !m.endsWith('-')),
  );

// 1. Token list in sync with usage.
const sources = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.(ts|html|css|scss)$/.test(entry.name) && path !== TOKENS_TS ? [path] : [];
  });
const listed = tokenNames(readFileSync(TOKENS_TS, 'utf8'));
const used = new Set();
for (const file of [THEME_CSS, ...sources(join(LIB, 'src'))]) {
  for (const name of tokenNames(readFileSync(file, 'utf8'))) used.add(name);
}
for (const name of used)
  if (!listed.has(name)) failures.push(`${name} is used but missing from tokens.ts`);
for (const name of listed)
  if (!used.has(name)) failures.push(`${name} is in tokens.ts but never used`);

// 2. Contrast of the built-in palettes.
const css = readFileSync(THEME_CSS, 'utf8');
const ref = (mode, role) => {
  const match = css.match(new RegExp(`--kawai-ref-${mode}-${role}:\\s*(#[0-9a-f]{6})\\s*;`, 'i'));
  if (!match) throw new Error(`--kawai-ref-${mode}-${role} is not a #rrggbb value`);
  return match[1];
};
const luminance = (hex) => {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)
    .map((h) => {
      const c = parseInt(h, 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const backgrounds = ['surface', 'surface-hover', 'surface-raised'];
const pairs = [
  // Text: 4.5:1 (WCAG 1.4.3).
  ...['text', 'text-muted', 'primary', 'primary-hover', 'secondary'].flatMap((fg) =>
    backgrounds.map((bg) => [fg, bg, 4.5]),
  ),
  // Control borders and focus rings: 3:1 (WCAG 1.4.11).
  ['border', 'surface', 3],
  ['border', 'surface-hover', 3],
  ['primary', 'surface', 3],
];
for (const mode of ['light', 'dark']) {
  for (const [fg, bg, min] of pairs) {
    const ratio = contrast(ref(mode, fg), ref(mode, bg));
    if (ratio < min)
      failures.push(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`);
  }
}

if (failures.length) {
  console.error(failures.map((f) => `✗ ${f}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${listed.size} tokens in sync; light and dark palettes pass WCAG AA.`);
