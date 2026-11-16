// Checks kawai-ui the way a consumer gets it: builds the library, packs it with `npm pack`,
// installs the tarball into a throwaway copy of the playground outside this workspace, and
// builds that app. Unlike the playground's `source` and `built` modes (tsconfig path mappings),
// this goes through node_modules, so it tests the package's `exports`, its peer dependencies
// and the files that really ship. Needs network for `npm install`; takes a few minutes.
//
// `npm run test:pack` removes the temp folder when it passes and keeps it when it fails.
// `npm run test:pack -- --keep` always keeps it.
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const PLAYGROUND = join(ROOT, 'projects/playground');
const KEEP = process.argv.includes('--keep');
/** What the consumer app needs to build, taken from this workspace so the versions match. */
const CONSUMER_DEV_DEPENDENCIES = [
  '@angular/build',
  '@angular/cli',
  '@angular/compiler-cli',
  'typescript',
];

const ts = createRequire(import.meta.url)('typescript');
// Outside the workspace, so nothing can resolve from this repo's node_modules or dist.
const temp = mkdtempSync(join(tmpdir(), 'kawai-ui-pack-'));
const app = join(temp, 'app');

function fail(message) {
  console.error(`\n✗ ${message}\n  Left for inspection: ${temp}`);
  process.exit(1);
}

function run(title, command, args, cwd) {
  console.log(`\n▸ ${title}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
  });
  if (result.status !== 0) fail(`${title} failed.`);
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

run('Build the library', 'npx', ['ng', 'build', 'kawai-ui'], ROOT);
run('Pack it', 'npm', ['pack', '--pack-destination', temp], join(ROOT, 'dist/kawai-ui'));
const tarball = readdirSync(temp).find((file) => file.endsWith('.tgz'));
if (!tarball) fail('npm pack produced no tarball.');

console.log(`\n▸ Create the consumer app in ${app}`);
mkdirSync(app);
cpSync(join(PLAYGROUND, 'src'), join(app, 'src'), { recursive: true });
cpSync(join(PLAYGROUND, 'public'), join(app, 'public'), { recursive: true });
// The import the library README tells apps to write; it resolves through the package `exports`.
writeFileSync(join(app, 'src/kawai-theme.css'), "@import 'kawai-ui/styles/kawai-theme.css';\n");

const workspace = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
writeJson(join(app, 'package.json'), {
  name: 'kawai-ui-pack-check',
  private: true,
  dependencies: { ...workspace.dependencies, 'kawai-ui': `file:../${tarball}` },
  devDependencies: Object.fromEntries(
    CONSUMER_DEV_DEPENDENCIES.map((name) => [name, workspace.devDependencies[name]]),
  ),
});

// Same compiler options as the workspace, minus the path mapping: `kawai-ui` must come from
// node_modules here.
const { config: tsconfig, error } = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile);
if (error) fail('Could not read the workspace tsconfig.json.');
delete tsconfig.compilerOptions.paths;
delete tsconfig.references;
delete tsconfig.files;
tsconfig.compilerOptions.types = [];
tsconfig.include = ['src/**/*.ts'];
writeJson(join(app, 'tsconfig.json'), tsconfig);

writeJson(join(app, 'angular.json'), {
  version: 1,
  cli: { analytics: false },
  projects: {
    app: {
      projectType: 'application',
      root: '',
      sourceRoot: 'src',
      architect: {
        build: {
          builder: '@angular/build:application',
          options: {
            browser: 'src/main.ts',
            tsConfig: 'tsconfig.json',
            inlineStyleLanguage: 'scss',
            assets: [{ glob: '**/*', input: 'public' }],
            styles: ['src/kawai-theme.css', 'src/styles.scss'],
            define: { KAWAI_UI_MODE: '"packed"' },
          },
        },
      },
    },
  },
});

run(
  'Install the tarball and Angular (npm install)',
  'npm',
  ['install', '--no-audit', '--no-fund'],
  app,
);
// A real copy, not a link back into this workspace.
if (lstatSync(join(app, 'node_modules/kawai-ui')).isSymbolicLink()) {
  fail('kawai-ui was linked instead of installed from the tarball.');
}
run('Build the consumer app', 'npx', ['ng', 'build'], app);

if (KEEP) {
  console.log(`\n✓ The packed library installs and builds. Kept: ${temp}`);
} else {
  rmSync(temp, { recursive: true, force: true });
  console.log('\n✓ The packed library installs and builds.');
}
