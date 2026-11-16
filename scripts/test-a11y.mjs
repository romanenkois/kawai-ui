// Runs axe against every Storybook story in a real browser, in the light and the dark theme.
// Unlike the axe checks in the unit tests (jsdom, no layout), this sees real rendering, so it
// also checks color contrast. Needs the static Storybook from `npm run build-storybook`;
// `npm run test:a11y` builds it first. Exits 1 on any violation or story that fails to render.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const STORYBOOK = join(import.meta.dirname, '../dist/storybook/kawai-ui');
const THEMES = ['light', 'dark'];
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

const indexPath = join(STORYBOOK, 'index.json');
if (!existsSync(indexPath)) {
  console.error(`✗ ${indexPath} not found. Run \`npm run build-storybook\` first.`);
  process.exit(1);
}
const stories = Object.values(JSON.parse(readFileSync(indexPath, 'utf8')).entries).filter(
  (entry) => entry.type === 'story',
);

// Static file server for the built Storybook, on a free port.
const server = createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  const file = join(STORYBOOK, path === '/' ? 'index.html' : path);
  if (!file.startsWith(STORYBOOK) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const axeSource = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const failures = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const story of stories) {
    for (const theme of THEMES) {
      const name = `${story.title} / ${story.name} [${theme}]`;
      await page.goto(`${origin}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`);
      // Storybook marks <body> once the story has rendered, or failed to.
      await page.waitForFunction(() =>
        ['sb-show-main', 'sb-show-errordisplay', 'sb-show-nopreview'].some((state) =>
          document.body.classList.contains(state),
        ),
      );
      const rendered = await page.evaluate(() => document.body.classList.contains('sb-show-main'));
      if (!rendered) {
        failures.push(`${name}: the story did not render`);
        continue;
      }
      // The theme decorator sets `kawai-theme` on <html> just after the story renders.
      const themed = await page
        .waitForFunction(
          (expected) => document.documentElement.getAttribute('kawai-theme') === expected,
          theme,
          { timeout: 5000 },
        )
        .then(
          () => true,
          () => false,
        );
      if (!themed) {
        failures.push(`${name}: kawai-theme="${theme}" was not applied`);
        continue;
      }
      await page.addScriptTag({ path: axeSource });
      // The a11y addon runs axe on the story too, and axe allows one run at a time: wait our turn.
      const violations = await page.evaluate(async (tags) => {
        for (;;) {
          try {
            const options = { runOnly: { type: 'tag', values: tags } };
            return (await window.axe.run('#storybook-root', options)).violations;
          } catch (error) {
            if (!String(error).includes('already running')) throw error;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
      }, WCAG_TAGS);
      for (const violation of violations) {
        const targets = violation.nodes.map((node) => node.target.join(' ')).join(', ');
        failures.push(`${name}: ${violation.id}: ${violation.help} (${targets})`);
      }
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${stories.length} stories pass axe (WCAG A/AA) in ${THEMES.join(' and ')}.`);
