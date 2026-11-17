# kawai-ui

nya

## Playground

`projects/playground` is a small app with one page per component, for trying the library the way an app uses it. It always imports from `'kawai-ui'`; the build mode decides what that is. The badge in its header shows the mode.

| Mode     | `kawai-ui` is                          | Run                                               |
| -------- | -------------------------------------- | ------------------------------------------------- |
| `source` | the library source, rebuilt on edit    | `npm start`                                       |
| `built`  | the ng-packagr output, `dist/kawai-ui` | `npm run start:built`                             |
| `packed` | the `npm pack` tarball in node_modules | `npm run test:pack` (build check only, see below) |

- **Switching** is one flag: `ng serve playground` or `ng serve playground --configuration built`. The `built` configuration swaps the `kawai-ui` path mapping (`tsconfig.app.built.json`) and the theme stylesheet (`angular.json`).
- **Built mode** reads `dist/kawai-ui`, so the library has to be built first; `npm run start:built` does that once. To follow library edits, run `npm run watch` in a second terminal.
- **Production builds:** `npm run build:playground` (source) and `npm run build:playground:built`.
- **`npm run test:pack`** checks the package as published: it builds and packs the library, installs the tarball into a temp app outside this workspace with a real `npm install`, and builds it. That tests the package `exports`, peer dependencies and shipped files, which the path mappings of the other two modes skip. It needs network and takes a few minutes. `npm run test:pack -- --keep` keeps the temp app for inspection.

The playground is a sandbox: it has to build, but it isn't linted and has no tests.

## Checks

| Command                    | What it checks                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run lint`             | ESLint, including template accessibility                                                     |
| `npm test`                 | Unit tests (Vitest), with an axe check per component in jsdom                                |
| `npm run check:theme`      | Token list in sync with usage; built-in palettes pass WCAG AA contrast                       |
| `npm run build`            | The library build, into `dist/kawai-ui`                                                      |
| `npm run build:playground` | The playground compiles                                                                      |
| `npm run test:a11y`        | Builds Storybook and runs axe on every story in a real browser, in light and dark            |
| `npm run test:pack`        | The packed tarball ships its license, installs into a clean app outside this repo and builds |

jsdom has no layout, so `npm test` can't judge color contrast; `npm run test:a11y` can. Before
its first run, download the browser with `npx playwright install chromium-headless-shell`.
`npm run storybook` starts Storybook locally on port 6006.

CI (`.github/workflows/ci.yml`) runs all of these except `test:pack` on every push to `master`
and every pull request. On `master`, once they pass, it deploys Storybook to
<https://romanenkois.github.io/kawai-ui/>.

## Releasing

1. Set the new `version` in `projects/kawai-ui/package.json`. npm never accepts a version twice,
   and 0.0.1 to 0.0.3 were taken by an earlier, since unpublished `kawai-ui`.
2. `npm run release -- --dry-run` runs every check above, then shows what would be published.
3. `npm run release` does the same and publishes `dist/kawai-ui`; npm asks for your 2FA code.
4. Tag the commit: `git tag v<version> && git push --tags`.

Never run `npm publish` in `projects/kawai-ui`: that is the TypeScript source, and its
`prepublishOnly` script refuses.
