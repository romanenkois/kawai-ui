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
