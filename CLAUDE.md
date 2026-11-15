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

Everything public goes through the `index.ts` barrels into `src/public-api.ts`. Export every new public symbol there.

Project-wide rules (TypeScript, Angular, theme, accessibility, Storybook):

@.claude/project-rules.md

How components and directives are built (files, inputs, options, defaults, styling, tests, stories, checklist, skeletons):

@.claude/component-guide.md

## Before finishing

Run whichever of these the change touches. All must pass:

- `npm run lint`: ESLint, including template accessibility and the type rules in `project-rules.md`
- `npm test`: unit tests
- `npm run check:theme`: token list in sync with usage; built-in palettes pass WCAG AA contrast
- `ng build kawai-ui`: library build
- `npm run build-storybook`: when components, stories or tokens changed

The editor's ESLint doesn't see files changed outside the editor (typescript-eslint's editor mode doesn't watch files). After changing shared files such as models, constants or `kawai-defaults.ts`, tell the user to run "ESLint: Restart ESLint Server" if the editor shows errors the CLI doesn't.
