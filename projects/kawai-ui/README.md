# kawai-ui

Accessible, themable Angular components built on signals and CSS design tokens.

**[Live demos and API docs (Storybook)](https://romanenkois.github.io/kawai-ui/)**

## Install

```bash
npm install kawai-ui
```

Needs Angular 22.2 or later (`@angular/core` and `@angular/common`).

## Quick start

1. Add the theme stylesheet to your app (details in [Theming](#theming)):

   ```jsonc
   // angular.json → projects.<app>.architect.build.options
   "styles": ["node_modules/kawai-ui/styles/kawai-theme.css", "src/styles.css"]
   ```

2. Import a component and use it:

   ```ts
   import { Component, signal } from '@angular/core';
   import { AccordionBodyDirective, AccordionComponent } from 'kawai-ui';

   @Component({
     selector: 'app-faq',
     imports: [AccordionComponent, AccordionBodyDirective],
     template: `
       <kawai-accordion heading="Shipping" [expanded]="open()" (toggled)="open.set(!open())">
         <ng-template kawaiAccordionBody>Orders ship within two days.</ng-template>
       </kawai-accordion>
     `,
   })
   export class Faq {
     protected readonly open = signal<boolean>(false);
   }
   ```

Components are stateless: your app owns the state (`expanded`, `value`) and updates it from
their events (`toggled`, `valueChange`).

## Components and directives

| Name              | Selector                  | What it is                                                              |
| ----------------- | ------------------------- | ----------------------------------------------------------------------- |
| Accordion         | `kawai-accordion`         | [Collapsible section with a header button][accordion]                   |
| Info panel        | `kawai-info-panel`        | [Titles, text, label/value fields, tables and buttons from data][info]  |
| Number stepper    | `kawai-number-stepper`    | [Labelled whole-number field with − and + buttons][stepper]             |
| Segmented control | `kawai-segmented-control` | [Row of mutually exclusive options on native radios][segmented]         |
| Label             | `kawaiLabel`              | [The one-line label every component uses, for your own controls][label] |
| Tooltip           | `kawaiTooltip`            | [Plain-text tooltip on hover and keyboard focus][tooltip]               |

[accordion]: https://romanenkois.github.io/kawai-ui/?path=/docs/components-accordion--docs
[info]: https://romanenkois.github.io/kawai-ui/?path=/docs/components-info-panel--docs
[stepper]: https://romanenkois.github.io/kawai-ui/?path=/docs/components-number-stepper--docs
[segmented]: https://romanenkois.github.io/kawai-ui/?path=/docs/components-segmented-control--docs
[label]: https://romanenkois.github.io/kawai-ui/?path=/docs/directives-label--docs
[tooltip]: https://romanenkois.github.io/kawai-ui/?path=/docs/directives-tooltip--docs

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
or order. The only style rules in the stylesheet, `.kawai-tooltip`, the focus ring of
truncated text (`[data-kawai-truncated]:focus-visible`) and `.kawai-label-truncate`, are unlayered so global resets don't
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
surface colors, borders and focus rings 3:1. The built-in palettes are checked against these
ratios.

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

### Labels

`kawaiLabel` is the label every kawai-ui component uses, and you can put it on your own elements
to label your controls the same way: one line with an ellipsis, the full text in a tooltip while
it is cut off, and an alignment.

```html
<label kawaiLabel="Email" for="email"></label>
<input id="email" />

<span id="range" [kawaiLabel]="{ text: 'Range', align: 'end', truncate: false }"></span>
```

It takes the text or `KawaiLabelOptions` (`text`, `truncate`, `tooltip`, `align`, `position`) and writes the
text into its host, replacing any content. The host stays your element, so `for`, `id` and
`aria-labelledby` work as usual. Truncation makes the host `display: block` (the
`.kawai-label-truncate` rule in the theme stylesheet), so give it a width or put it in a grid or
flex column.

Components that pair a label with a control (number stepper, segmented control) put it on top
by default, across their full width, so `align` moves it left, centre or right over the control.
`position: 'start'` puts it beside the control in the same line instead, in a column whose width
is the `--kawai-comp-<component>-label-width` token. `position` has no effect on a bare
`kawaiLabel`, which sits where you put it.

The `label` key of `provideKawaiDefaults()` sets these options for every label and heading at
once, `kawaiLabel` and component labels alike. A component's own key beats it:

```ts
provideKawaiDefaults({
  label: { align: 'end' }, // every label and heading
  accordion: { heading: { align: 'start' } }, // except accordion headings
});
```

Labels resolve as **instance input → the component's own key (nearest level first) → the shared
`label` key (nearest level first) → library defaults**. So a component key always wins over the
shared key, even when the shared key is set at a nearer level: a route-level `label` doesn't
change a component whose own key is set at the app level.

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

## License

[Apache-2.0](https://github.com/romanenkois/kawai-ui/blob/master/LICENSE.txt)
