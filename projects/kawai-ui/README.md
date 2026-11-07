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

The library CSS sits in `@layer kawai`, so any normal rule in your app wins, whatever its
selector or order.

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

Prefer `kawai-theme` values for custom themes. Tooltips render at `<body>` and copy the nearest
`kawai-theme` value, but they don't see tokens set by other selectors on their host's ancestors.

Custom themes are responsible for their own contrast: text colors need 4.5:1 against the
surface colors, borders and focus rings 3:1. `npm run check:theme` in this repo checks the
built-in palettes.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

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
