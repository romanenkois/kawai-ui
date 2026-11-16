You are an expert in TypeScript, Angular, and component library development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

# Agent mode

User is always here, always ask about anything that is not 100% clear, never just assume, ask as much question as needed to clarify all the potential cases of the dispatched work. If the question has some fundamental important decision, explain the pros and cons of each options, what are the potential pitfalls

## Project

kawai-ui is an Angular v22 component library, built with ng-packagr. The workspace has one project, `kawai-ui`, in `projects/kawai-ui`:

- `src/lib/ui/components/<name>/`: components
- `src/lib/ui/directives/<name>/`: directives
- `src/lib/ui/shared/<name>/`: pieces several components share (e.g. `label/`: `KawaiLabelOptions`)
- `src/lib/defaults/`: `provideKawaiDefaults()` and `KawaiDefaultsConfig`
- `src/lib/utils/`: internal helpers such as `resolveOptionsChain()`
- `src/lib/theme/tokens.ts`: the TypeScript list of every design token
- `styles/kawai-theme.css`: the theme stylesheet, shipped as `kawai-ui/styles/kawai-theme.css`
- `stories/`: Storybook stories (not shipped). Config is in `.storybook/`.

A second project, `playground` in `projects/playground`, is a sandbox app with one page per component (not shipped, not linted, no tests). It imports only from `'kawai-ui'`, never by relative path, so the same code runs against the library source (default), the built `dist/kawai-ui` (`--configuration built`) or the packed tarball (`npm run test:pack`). A new component gets a page in `src/app/pages/`, a route in `app.routes.ts` and a nav link in `app.ts`.

Everything public goes through the `index.ts` barrels into `src/public-api.ts`. Export every new public symbol there.

Project-wide rules (TypeScript, Angular, theme, accessibility, Storybook):

@.claude/project-rules.md

How components and directives are built (files, inputs, options, defaults, styling, tests, stories, checklist, skeletons):

@.claude/component-guide.md

## Before finishing

Run whichever of these the change touches. All must pass:

- `npm run lint`: ESLint, including template accessibility and the type rules in `project-rules.md`
- `npm test`: unit tests, including an axe check per component
- `npm run check:theme`: token list in sync with usage; built-in palettes pass WCAG AA contrast
- `ng build kawai-ui`: library build
- `npm run build:playground`: when the public API or the playground changed. The playground must compile; it isn't linted or tested
- `npm run test:pack`: before a release, or when `package.json`, `ng-package.json`, `exports` or the shipped styles changed. Packs the built library, installs the tarball into a temp app outside the workspace and builds it (needs network, takes a few minutes)
- `npm run build-storybook`: when components, stories or tokens changed
- `npm run test:a11y`: when components, stories or tokens changed. Builds Storybook itself, then runs axe on every story in a real browser, in light and dark (first time: `npx playwright install chromium-headless-shell`)

The editor's ESLint doesn't see files changed outside the editor (typescript-eslint's editor mode doesn't watch files). After changing shared files such as models, constants or `kawai-defaults.ts`, tell the user to run "ESLint: Restart ESLint Server" if the editor shows errors the CLI doesn't.
