import axe from 'axe-core';

/**
 * Fails the test when axe finds a WCAG A/AA violation inside `element`. Test only, never
 * shipped. jsdom has no layout, so axe can't judge color contrast here: palettes are checked
 * by `npm run check:theme`, and rendered stories by `npm run test:a11y`.
 */
export async function expectNoAxeViolations(element: Element): Promise<void> {
  const results = await axe.run(element, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  const violations = results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(' ')).join(', ')})`,
  );
  expect(violations).toEqual([]);
}
