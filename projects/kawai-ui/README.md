# KawaiUi

## Theming

kawai-ui is styled entirely through CSS custom properties. Import the theme stylesheet once,
before your own styles:

```jsonc
// angular.json → projects.<app>.architect.build.options
"styles": ["node_modules/kawai-ui/styles/kawai-theme.css", "src/styles.css"]
```

or `@import 'kawai-ui/styles/kawai-theme.css';` at the top of your global stylesheet.

Components assume they sit on `--kawai-sys-color-surface`; the built-in palettes meet WCAG AA
contrast against it.

### Choosing a theme

The library never picks a theme on its own. Set the `kawai-theme` attribute on `<html>` or on
any element to theme that subtree:

| Value       | Result                                              |
| ----------- | --------------------------------------------------- |
| _(not set)_ | light; the OS setting is ignored                    |
| `light`     | light, and `color-scheme: light` for native widgets |
| `dark`      | dark, and `color-scheme: dark`                      |
| `auto`      | follows the OS `prefers-color-scheme`               |

```html
<html kawai-theme="dark">
  …
  <aside kawai-theme="light">…</aside>
</html>
```

Switching, persisting the choice and any toggle UI are up to your app. In a template, bind it
with `[attr.kawai-theme]="theme()"`. The `KAWAI_THEME_ATTRIBUTE` constant and the
`KawaiBuiltInTheme` type are exported for this.

### Tokens

All tokens are prefixed by tier, so names never collide:

| Tier   | Pattern                                                  | Use it to                    |
| ------ | -------------------------------------------------------- | ---------------------------- |
| `ref`  | `--kawai-ref-<light\|dark>-<role>`                       | restyle one mode             |
| `sys`  | `--kawai-sys-<category>-<name>`                          | change a value for all modes |
| `comp` | `--kawai-comp-<component>[-<part>]-<property>[-<state>]` | change a single component    |

The full list is exported as `KAWAI_TOKENS` with the `KawaiToken` type.

The tokens sit in `@layer kawai`, so any normal rule in your app wins, whatever its selector
or order. The only style rules in the stylesheet, `.kawai-tooltip` and the focus ring of
truncated text (`[data-kawai-truncated]:focus-visible`), are unlayered so global resets don't
strip them; override them with a rule at least as specific, loaded after the theme.

```css
/* Restyle a mode. Applies to `light`/`dark` and to `auto` in that mode. Set ref tokens on :root. */
:root {
  --kawai-ref-light-primary: #a3195b;
  --kawai-ref-dark-primary: #f7a8cb;
}

/* Change a value for every mode, globally or for one subtree. */
:root {
  --kawai-sys-radius-md: 0.75rem;
  --kawai-sys-font-family: 'Nunito', system-ui, sans-serif; /* unset = inherit your app font */
}

/* Change one component, globally, for a subtree, or on one instance via style="". */
.sidebar {
  --kawai-comp-accordion-header-padding: 0.5rem 1rem;
}
```

### Custom themes

A theme is any selector that sets `sys` tokens. Tokens a theme leaves out are inherited from the
enclosing theme:

```css
[kawai-theme='sepia'] {
  color-scheme: light;
  --kawai-sys-color-surface: #f4ecd8;
  --kawai-sys-color-text: #3b2f1e;
  --kawai-sys-color-primary: #8a4b0f;
}
```

Prefer `kawai-theme` values for custom themes. Tooltips render at `<body>` (in the browser's top
layer, so they need no z-index) and copy the nearest `kawai-theme` value, but they don't see
tokens set by other selectors on their host's ancestors.

Custom themes are responsible for their own contrast: text colors need 4.5:1 against the
surface colors, borders and focus rings 3:1. `npm run check:theme` in this repo checks the
built-in palettes.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

## Defaults

Components take configuration like layout or tooltip position as inputs. Anything an instance
doesn't set comes from `provideKawaiDefaults()`, so you can set it once for the whole app, and
differently for one route or feature:

```ts
// app.config.ts
providers: [provideKawaiDefaults({ accordion: { layout: { border: false } }, tooltip: { position: 'top' } })];

// a feature component: only what differs there
@Component({ providers: [provideKawaiDefaults({ accordion: { layout: 'separated' } })], … })
```

Each value is resolved from the nearest place that sets it:

**instance input → nearest `provideKawaiDefaults()` → … → app-level `provideKawaiDefaults()` → library defaults**

- Every level is partial. Nested options merge, so `{ layout: { border: false } }` keeps the
  inherited `body` and `innerCorners`.
- `null` turns an option off from that level down, e.g. `{ accordion: { indicator: null } }`. A
  nearer level or an instance can turn it back on.
- Pass a signal instead of an object to change defaults at runtime, e.g. from a user setting.
  Components update live.
- Content such as heading or tooltip text is never a default.
- The library defaults are exported per component, e.g. `KAWAI_ACCORDION_DEFAULTS`.

## Accessibility

- **Truncated text** shows in full in a tooltip on hover. The keyboard reaches it too: text
  inside a control (an accordion heading, a segmented option, a field label) opens when that
  control has keyboard focus, and other clipped text becomes a tab stop while it is clipped.
- **Tooltips** open after `showDelay` (300 ms) on hover and at once on keyboard focus, stay open
  while the pointer is on them, and close `hideDelay` (100 ms) after it leaves, or at once on
  Escape. Both delays are tooltip options, so `provideKawaiDefaults({ tooltip: { showDelay: 0 } })`
  changes them app-wide.
- **Heading levels**: the accordion renders `<h2>` and info panel titles `<h3>` by default. Set
  `headingLevel` / `titleLevel` (on an instance or in `provideKawaiDefaults()`) to fit the page
  outline around them.
- **Translating built-in text**: the number stepper names its buttons from the templates
  `decreaseLabel` and `increaseLabel`, where `{label}` stands for the label text:

  ```ts
  provideKawaiDefaults({
    numberStepper: { decreaseLabel: '{label} verringern', increaseLabel: '{label} erhöhen' },
  });
  ```

In this repo, `npm test` runs axe on every component in jsdom, and `npm run test:a11y` builds
Storybook and runs axe on every story in a real browser, in the light and the dark theme. The
first time, download the browser with `npx playwright install chromium-headless-shell`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run:

```bash
ng build kawai-ui
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:

   ```bash
   cd dist/kawai-ui
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
