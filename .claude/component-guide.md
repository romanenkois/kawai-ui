# kawai-ui component guide

How every kawai-ui component and directive is built. The accordion (`src/lib/ui/components/accordion/`) is the reference implementation: when this guide and the accordion disagree, ask.

Paths below are relative to `projects/kawai-ui/`.

## 1. Folder and files

Each component lives in `src/lib/ui/components/<name>/`, each directive in `src/lib/ui/directives/<name>/`:

| File                            | Holds                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `<name>.component.ts`           | The component class (`<name>.directive.ts` for a directive)                                                |
| `<name>.component.html`         | The template (`templateUrl`)                                                                               |
| `<name>.component.scss`         | The styles (`styleUrl`). Never an inline `styles:` block                                                   |
| `<name>.model.ts`               | Types only: options interfaces, `<Component>Defaults`, `<Component>DefaultsConfig`, template context types |
| `<name>.constant.ts`            | Only the library defaults, `KAWAI_<COMPONENT>_DEFAULTS`                                                    |
| `<name>.component.spec.ts`      | Tests: the defaults chain plus the component's core behaviour (`<name>.directive.spec.ts` for a directive) |
| `<name>-templates.directive.ts` | Marker directives for projected templates, when the component takes any                                    |
| `<name>.util.ts`                | Internal helper functions of that folder (`label.util.ts`: `resolveLabelChain()`). Not in the barrel       |
| `<name>.controller.ts`          | Internal behaviour class that more than one directive uses (`tooltip.controller.ts`). Not in the barrel    |
| `index.ts`                      | The folder's barrel: `export *` of every public file in it (never the spec). Required in every folder      |

The parent barrel (`components/index.ts`, `directives/index.ts`) only re-exports the folders (`export * from './accordion';`), never individual files. A new public file goes in the folder's own `index.ts`.

Types and constants several components share, with no directive or component of their own, go in `src/lib/ui/shared/<name>/` with the same model/constant split (e.g. `shared/heading/`). Something shared that renders or behaves is a directive in `directives/<name>/` instead, as the label is.

A directive that needs another directive's behaviour on its own host doesn't use `hostDirectives` when that directive's input is required (the input can't be bound from inside). The behaviour lives in a `<name>.controller.ts` class instead, created in a field initializer (an injection context) by every directive that needs it: `kawaiTooltip` and `kawaiLabel` both create a `TooltipController` and bind the host's `mouseenter`, `mouseleave`, `focusin` and `focusout` to it in their own `host` object.

**Why:** the same layout everywhere means every component can be read, reviewed and extended the same way, and types, values and behaviour never mix in one file.

## 2. Angular basics

- Keep each component small and focused on one responsibility.
- Standalone components (the default; never write `standalone: true`). Don't set `changeDetection: OnPush` either, it's the default in v22.
- Selectors: components `kawai-<kebab-case>`, directives `kawai<CamelCase>` (lint enforces the prefix). A directive's main input is aliased with the directive name (`kawaiTooltip`, `kawaiLabel`).
- `input()`, `output()`, `model()` instead of decorators; `computed()` for derived state, `linkedSignal()` for state derived from several sources that must stay in sync. Host bindings and listeners go in the decorator's `host` object, never `@HostBinding` / `@HostListener`.
- `inject()`, never constructor injection.
- Templates in `<name>.component.html` (an inline template is fine for a very small component), styles always in `<name>.component.scss`; paths relative to the component file.
- Templates stay simple, with logic in `computed()`s. Native control flow (`@if`, `@for`, `@switch`), `class` / `style` bindings (no `ngClass` / `ngStyle`), import only the directives and pipes used (never `CommonModule`), the `async` pipe for observables. Templates can't use globals such as `new Date()`.
- Generated element ids are `kawai-<component>-<n>-<part>`, from a module-level counter (`let nextId = 0`), so they're unique and never clash with app ids.
- Every public class gets a JSDoc comment: what it does, who owns its state, and where its defaults come from. Storybook autodocs shows it.
- Components are **stateless**: the parent owns the state (`expanded`, `value`) and reacts to events (`toggled`, `valueChange`). (Whether to move to `model()` two-way binding is still undecided; don't change it unasked.)

Types follow the TypeScript section of `project-rules.md` (explicit type arguments on every signal factory, explicit return types, no `any`); lint enforces it. In components that means `output<void>()`, `input<boolean, unknown>(false, { transform: booleanAttribute })`, `contentChild.required<AccordionBodyDirective>(AccordionBodyDirective)`.

## 3. Inputs: state, content, configuration

Sort every input into one of these before writing it:

| Kind              | Examples                                   | How                                                                                      |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **State**         | `expanded`, `value`                        | Plain required input, paired with an event output. Never a default                       |
| **Content**       | `heading.text`, `label.text`, `items`      | Instance-only. Never a default (an app-wide default heading makes no sense)              |
| **Data limits**   | stepper `min`, `max`                       | Plain required inputs. Not defaults: a wrong app-wide `max` would silently cap values    |
| **Configuration** | `indicator`, `layout`, `overflow`, `label` | Goes through the defaults chain (section 5). Options input when it's a group (section 4) |
| **Styling**       | sizes, colors, spacing, motion             | Never an input. CSS tokens (section 7)                                                   |

## 4. Options inputs

When several inputs would configure one thing (a label, an indicator, a layout), make them **one** input instead:

```ts
readonly indicator = input<
  AccordionIndicatorPosition | KawaiDeepPartial<AccordionIndicatorOptions> | null
>();
```

- **Shorthand:** the one value usually needed, always a primitive (`indicator="start"`, `heading="Details"`). It sets one field (the "shorthand key").
- **Object:** `KawaiDeepPartial<Options>`: every field, at any depth, may be left out. Nested plain objects merge with the defaults; arrays, templates and functions replace them.
- **Not passed (`undefined`):** defaults.
- **`null`:** off, not rendered. Only allow it where off makes sense: an indicator can be off, a heading can't, so `heading`'s type has no `null`.
- **Booleans** stay `true` / `false` and never take `null`.
- **Immutable:** a new object is needed to change options. Mutating one in place doesn't update the component (signal inputs compare by reference).
- Each options type is a JSDoc'd interface in `<name>.model.ts`, every field documented, including what it does in special cases (e.g. "separated layout only").
- Not for state, events, styling or projected templates.

**Why:** small, stable APIs. The common case stays one plain value, rare tweaks don't need new inputs, and new fields never break anyone because every field is optional.

### Labels and headings

Every label or heading is rendered by the public `kawaiLabel` directive (`src/lib/ui/directives/label/`), which apps also put on their own elements. It takes `KawaiLabelOptions`:

```ts
interface KawaiLabelOptions {
  text: string; // also the accessible name of what it labels
  truncate: boolean; // one line + ellipsis (default true)
  tooltip: KawaiDeepPartial<Pick<TooltipOptions, 'position'>> | null; // full text while truncated; null = none
  align: KawaiLabelAlign; // 'start' | 'center' | 'end' within the label's area
  position: KawaiLabelPosition; // 'top' (default): above the control; 'start': beside it
}
```

- The input is `input.required<string | KawaiDeepPartial<KawaiLabelOptions>>()` (or optional when a template can replace it, as with the accordion heading).
- Defaults: `KAWAI_LABEL_DEFAULTS` in the component's constant. Resolve with `resolveLabelChain()` from `label.util.ts`, never `resolveOptionsChain()`: it also applies the shared `label` key (section 5).
- Template: put `[kawaiLabel]="labelOptions()"` on the element the label really is (`<label [for]>`, a `<span [id]>` for `aria-labelledby`, a `<span>` inside a button). The directive writes the text, truncation (`.kawai-label-truncate`, a rule in `kawai-theme.css`), alignment and the full-text tooltip. The component keeps only its own styling of that element (color, width, flex). A tooltip position left out falls through to the tooltip defaults.
- A component-specific label **extends** the type instead of redefining it.
- A component that pairs the label with a control lays it out from `position`: on `top` (the default) the label spans the component's full width above the control, so `align` moves it across that width; `start` puts it in a column beside the control, via a `[class.label-start]` host class. Give that column a `--kawai-comp-<component>-label-width` token (default: fits the text), so `align` has an area to align within. `position` does nothing on a bare `kawaiLabel` or a heading.
- If the label text is the accessible name of a control, warn in dev mode when it resolves to empty:

  ```ts
  constructor() {
    if (isDevMode()) {
      effect(() => {
        if (this.labelOptions().text) return;
        console.warn('kawai-<name>: `label` has no text, so … has no accessible name.');
      });
    }
  }
  ```

### Text truncation

All text and labels (headings, field labels, values, option labels, button text) stay on **one line** by default, cut off with an ellipsis, with the full text in a tooltip that only opens while the text is cut off. Exceptions: free-form content (bodies, descriptions), and places where an option (`truncate: false`) turns it off.

A component's label or heading gets all of this from `kawaiLabel` (above); don't add truncation CSS or a `kawaiTooltip` for it. Any other text (values, option labels, table cells) does it by hand: the component's own `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` plus `[kawaiTooltip]="{ text, onlyWhenTruncated: true }"`.

The tooltip's host must be the element that clips (`overflow: hidden; text-overflow: ellipsis`), and the mouse must be able to reach it: an overlay on top (like a transparent radio input) blocks hover, so give the overlay `pointer-events: none`.

The keyboard must reach it too, and the tooltip (from `kawaiTooltip` or `kawaiLabel`) finds how by itself: a host inside a `button` or link, or that is (or is inside) the `<label>` of a control, opens while that control has keyboard focus; any other host becomes a tab stop (`tabindex="0"`) while its text is clipped. So put the clipped text inside its control or `<label>` where there is one.

**Why:** compact, predictable layouts that never break on long text, without hiding information.

## 5. Defaults

Every configuration input resolves through one chain, nearest first:

**instance input → nearest `provideKawaiDefaults()` → … → app-level `provideKawaiDefaults()` → library defaults**

- **Library defaults** (`<name>.constant.ts`): one object per component, every value filled in, typed `Readonly<<Component>Defaults>`. Same shape as the component's part of `provideKawaiDefaults()`.
- **`<Component>DefaultsConfig`** (`<name>.model.ts`): the same values as the inputs (shorthands and `null` included), every field optional, minus content. Register it in `KawaiDefaultsConfig` (`src/lib/defaults/kawai-defaults.ts`) under the component's camelCase name (`numberStepper`).
- **`provideKawaiDefaults(config | Signal<config>)`** works in app config, route and component `providers`. Each level only states what it changes. A signal updates components live.
- **Resolution:** read levels with `injectKawaiDefaults()`, resolve inside a `computed()`: options inputs with `resolveOptionsChain()`, plain inputs with `resolveValueChain()`, labels and headings with `resolveLabelChain()`. Never ad-hoc spreads.
- **Configuration inputs have no initial value** (`input<AccordionOverflow>()`), so `undefined` means "not set here" and the chain continues. The default exists only in the constant.
- **`null`** at any level turns an option off from there down; a nearer level can turn it back on (merging over the library defaults).
- **Defaults that depend on the component's own content** (e.g. a custom indicator template isn't rotated) are applied to the library defaults inside the component, so any level can still override them.
- **A value set on a data item wins over everything** (e.g. an info panel field's own `linksOverflow`), then the chain applies.
- **Labels and headings have a shared key too:** `label` in `KawaiDefaultsConfig` applies to every `kawaiLabel`, component label and heading. A component's own key (`numberStepper.label`, `accordion.heading`) always beats it, whichever level either is set at: **instance input → component key, nearest level first → shared `label` key, nearest level first → library defaults**. `resolveLabelChain()` does this. It is the one exception to "the nearest level wins": a route-level `label` doesn't change a component whose own key is set at the app level. The shared key holds `KawaiLabelDefaultsConfig`, so it has no `text`.

**Why:** an app sets its look once, a feature overrides only what differs, an instance overrides one value, and nobody restates what they inherit.

## 6. Projected templates

- Marker directives on `ng-template`, selector `ng-template[kawai<Component><Slot>]` (`kawaiAccordionHeading`, `kawaiAccordionBody`), in `<name>-templates.directive.ts`.
- Each exposes `readonly template = inject<TemplateRef<Context>>(TemplateRef)` and a typed `static ngTemplateContextGuard(_dir, _context): _context is Context`.
- The context passes the main state as `$implicit` (and by name), so templates can write `let-expanded`.
- A template replaces content but not accessibility: if it can lack text, keep a text input that becomes the `aria-label`, and warn in dev mode when the accessible name ends up empty.

## 7. Styling

- Read only `--kawai-*` tokens. Never hard-code colors, spacing, radii, font sizes, weights, shadows, z-indexes or durations.
- Every themable property gets a **comp token** with a sys fallback: `var(--kawai-comp-<component>[-<part>]-<property>[-<state>], var(--kawai-sys-…))`. Comp tokens are never declared in `kawai-theme.css`.
  - Property names: `color`, `background`, `border-color`, `border-width`, `radius`, `padding`, `gap`, `size`, `min-size`, `width`, `font-size`, `font-weight`, `shadow`, `focus-ring-color`, `motion-duration`, `motion-easing`. States: `hover`, `checked`, `disabled`.
  - Padding gets three tokens, the shorthand winning when set: `padding: var(--…-padding, var(--…-padding-y, <y>) var(--…-padding-x, <x>))`. One-axis padding exposes only that axis.
- Add every new token to `src/lib/theme/tokens.ts` (`check:theme` fails otherwise). It then shows in the Storybook token gallery automatically.
- `font-family: var(--kawai-sys-font-family)` on the host: deliberately undeclared, so components inherit the app font.
- Logical properties (`inline-size`, `margin-inline-start`, `border-start-start-radius`) so layouts work right to left.
- Transitions use comp `motion-*` tokens falling back to `--kawai-sys-motion-duration-*` / `-easing-*`, and are off under `@media (prefers-reduced-motion: reduce)`.
- Use host classes for variants (`[class.separated]` in `host`), never inline styles for things apps may want to override. `[style.text-align]` for a value that is itself an option is fine.
- A directive has no stylesheet. Styling it must apply to its host, on app elements too, is a `kawai-<name>-<state>` class it toggles, with an unlayered rule in `kawai-theme.css` (`.kawai-label-truncate`). A component still styles the same element through its own class (`.label`) for color, width and layout.
- Elements rendered outside the host (in `<body>`) are styled by an unlayered rule in `kawai-theme.css`, and copy the nearest `kawai-theme` attribute so they match the themed subtree. Open them as a popover (`popover="manual"`) so they sit in the top layer; no z-index tokens.

**Why:** apps restyle through tokens without touching components, globally, per subtree or per instance; the library never fights app CSS.

## 8. Accessibility

Required: AXE passes, WCAG AA (see `project-rules.md`). For components specifically:

- Native elements first (`button`, radio `input`, `label`, `dl`, `table` with `th scope`), ARIA only on top.
- Every control has an accessible name; derive related names from it. Text the library writes itself is a configuration input holding a template (`decreaseLabel: 'Decrease {label}'`), so apps can translate it through the defaults chain. Never hard-code it in the template.
- A component that renders a heading takes its level as a configuration input (`headingLevel`, typed `KawaiHeadingLevel` from `shared/heading/`) and renders a real `h1`–`h6` with an `@switch`, since the right level depends on the page around it.
- Controls at a limit use `aria-disabled`, not `disabled`, so they keep focus.
- Pointer targets are at least 24px tall (WCAG 2.2 AA): `min-block-size` from a `min-size` comp token falling back to `--kawai-sys-size-target-min`, unless neighbours leave that much space around a smaller one.
- Every interactive element has a visible `:focus-visible` outline: `--kawai-sys-focus-ring-width` and a `focus-ring-color` comp token.
- Hidden content is out of the accessibility tree and tab order (`visibility: hidden` after a collapse animation, not just zero height).
- Components assume they sit on `--kawai-sys-color-surface`; their text and border tokens are contrast-checked against it.

## 9. Tests (`<name>.component.spec.ts`)

Vitest with TestBed. Render the component inside a small host component and cover:

1. **App level:** `TestBed.configureTestingModule({ providers: [provideKawaiDefaults(appSignal)] })` changes an instance without inputs.
2. **Local level:** the host component's own `providers: [provideKawaiDefaults(…)]` overrides the app level field by field.
3. **Instance input** wins over both; a `null` default can be turned back on by an instance.
4. **Live update:** `appSignal.set(…)`, `await fixture.whenStable()`, and the change shows.
5. **Core behaviour:** events emitted, accessible names, bounds.
6. **Axe:** `await expectNoAxeViolations(fixture.nativeElement as HTMLElement)` from `src/lib/testing/axe.ts`.

A component with a label or heading also covers the shared key: the component's own key beats `label`, also when `label` is set at a nearer level, and `label` applies once nothing beats it (see the number stepper spec). A layout that follows `label.position` checks the `label-start` host class.

jsdom has no layout, so nothing is ever clipped there. Specs that need clipped text mock `scrollWidth` from a `data-scroll-width` attribute (see the tooltip and label directive specs).

Query through `fixture.nativeElement`, throw a clear error instead of `!` when an element is missing (lint forbids `!`).

## 10. Stories (`stories/<components|directives>/<name>.stories.ts`)

- Import from `../../src/public-api`.
- Flatten options into separate controls and rebuild the object in `render` (`stories/shared/label-controls.ts` does it for labels, `position` included). Each control's `description` names the option path (`` `layout.body` ``). Hide a shared control that does nothing in a story file with `table: { disable: true }`, as the label directive's stories do for `labelPosition`.
- The story acts as the parent: it stores emitted values (`(valueChange)="value = $event; valueChange($event)"`), and outputs are `fn()` args so they show in the Actions panel.
- One story per meaningful state: defaults, each option value worth seeing, bounds, long text (truncation), the label on top and at the start, overflow, custom templates, and one with `applicationConfig({ providers: [provideKawaiDefaults(…)] })` showing app defaults.

## 11. Checklist: adding a component

1. Ask about anything unclear first (inputs, options, defaults, null meaning, accessibility), with pros, cons and pitfalls for real decisions.
2. Create the folder and files from section 1 (`ng generate component` already makes `.scss`).
3. Sort the inputs (section 3). Write the model: options interfaces, `<Component>Defaults`, `<Component>DefaultsConfig`.
4. Write the constant: `KAWAI_<COMPONENT>_DEFAULTS`.
5. Write the component: inputs without initial values for configuration, `injectKawaiDefaults()`, one `computed()` per resolved input (`resolveLabelChain()` for a label or heading, rendered with `kawaiLabel`), dev-mode warnings for missing accessible names, JSDoc.
6. Styles: tokens only, comp tokens for themable properties, reduced motion, logical properties. With a label beside a control: stacked by default, the `label-start` host class for the label column.
7. Register:
   - `src/lib/ui/components/<name>/index.ts`: export the component, model, constant (and templates directive); `src/lib/ui/components/index.ts`: add `export * from './<name>';`
   - `src/lib/defaults/kawai-defaults.ts`: add `<camelName>?: <Component>DefaultsConfig` to `KawaiDefaultsConfig`
   - `src/lib/theme/tokens.ts`: every new token
8. Spec (section 9) and stories (section 10).
9. Playground (`projects/playground`): a page in `src/app/pages/<name>-page.ts` with one working demo, a route in `app.routes.ts`, a nav link in `app.ts`. Import from `'kawai-ui'` only.
10. Run: `npm run lint`, `npm test`, `npm run check:theme`, `ng build kawai-ui`, `npm run build:playground`, `npm run build-storybook`, `npm run test:a11y`.

A public directive follows the same steps with `directives/` paths, minus the template and stylesheet (see section 7 for its styles).

## 12. Skeletons

A component `kawai-example` with a label (on top by default, beside the control with `position: 'start'`) and one plain configuration input, `density`.

**`example.model.ts`**

```ts
import type {
  KawaiLabelDefaultsConfig,
  KawaiLabelOptions,
} from '../../directives/label/label.model';

/** How much space the example takes. */
export type ExampleDensity = 'comfortable' | 'compact';

/** The example's configuration with every value filled in: the shape of its library defaults. */
export interface ExampleDefaults {
  label: KawaiLabelOptions;
  density: ExampleDensity;
}

/**
 * The `example` part of `provideKawaiDefaults()`. Same values as the inputs, minus content
 * (`label.text`). Anything left out comes from the level above.
 */
export interface ExampleDefaultsConfig {
  label?: KawaiLabelDefaultsConfig;
  density?: ExampleDensity;
}
```

**`example.constant.ts`**

```ts
import { KAWAI_LABEL_DEFAULTS } from '../../directives/label/label.constant';
import type { ExampleDefaults } from './example.model';

/**
 * Library defaults for every example configuration input: the bottom of the chain
 * input → `provideKawaiDefaults()` levels (nearest first) → these.
 */
export const KAWAI_EXAMPLE_DEFAULTS: Readonly<ExampleDefaults> = {
  label: KAWAI_LABEL_DEFAULTS,
  density: 'comfortable',
};
```

**`example.component.ts`**

```ts
import { Component, computed, effect, input, isDevMode, output } from '@angular/core';

import { injectKawaiDefaults } from '../../../defaults/kawai-defaults';
import { KawaiDeepPartial, resolveValueChain } from '../../../utils/options';
import { LabelDirective } from '../../directives/label/label.directive';
import { KawaiLabelOptions } from '../../directives/label/label.model';
import { resolveLabelChain } from '../../directives/label/label.util';
import { KAWAI_EXAMPLE_DEFAULTS } from './example.constant';
import { ExampleDensity } from './example.model';

let nextId = 0;

/**
 * One sentence on what it does. Stateless: the parent owns `value` and reacts to
 * `valueChange`. Configuration left out comes from `provideKawaiDefaults()` levels, then
 * `KAWAI_EXAMPLE_DEFAULTS`.
 */
@Component({
  selector: 'kawai-example',
  imports: [LabelDirective],
  host: {
    '[class.compact]': "densityValue() === 'compact'",
    '[class.label-start]': "labelOptions().position === 'start'",
  },
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent {
  /** Label text, or {@link KawaiLabelOptions}. */
  readonly label = input.required<string | KawaiDeepPartial<KawaiLabelOptions>>();
  /** Spacing of the example. Default `comfortable`. */
  readonly density = input<ExampleDensity>();
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  private readonly defaultLevels = injectKawaiDefaults();
  protected readonly labelOptions = computed<KawaiLabelOptions>(() =>
    resolveLabelChain(
      this.defaultLevels(),
      (level) => level.example?.label,
      this.label(),
      KAWAI_EXAMPLE_DEFAULTS.label,
    ),
  );
  protected readonly densityValue = computed<ExampleDensity>(() =>
    resolveValueChain(
      [...this.defaultLevels().map((level) => level.example?.density), this.density()],
      KAWAI_EXAMPLE_DEFAULTS.density,
    ),
  );

  protected readonly labelId = `kawai-example-${nextId++}-label`;

  constructor() {
    if (isDevMode()) {
      effect(() => {
        if (this.labelOptions().text) return;
        console.warn('kawai-example: `label` has no text, so the control has no accessible name.');
      });
    }
  }
}
```

**`example.component.html`**

```html
<span class="label" [id]="labelId" [kawaiLabel]="labelOptions()"></span>
```

**`example.component.scss`**

```scss
:host {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--kawai-comp-example-gap, var(--kawai-sys-space-xs));
  font-family: var(--kawai-sys-font-family);
}

/* `label.position: 'start'`: the label in its own column, beside the control. */
:host(.label-start) {
  grid-template-columns: var(--kawai-comp-example-label-width, fit-content(50%)) minmax(0, 1fr);
  gap: 0 var(--kawai-comp-example-gap, var(--kawai-sys-space-lg));
  align-items: center;
}

:host(.label-start.compact) {
  gap: 0 var(--kawai-comp-example-gap, var(--kawai-sys-space-sm));
}

.label {
  min-inline-size: 0;
  color: var(--kawai-comp-example-label-color, var(--kawai-sys-color-text-muted));
}
```

**`example.component.spec.ts`**

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KawaiDefaultsConfig, provideKawaiDefaults } from '../../../defaults/kawai-defaults';
import { ExampleComponent } from './example.component';

@Component({
  imports: [ExampleComponent],
  providers: [provideKawaiDefaults({ example: { label: { truncate: false } } })],
  template: `
    <kawai-example id="plain" label="Plain" value="a" />
    <kawai-example id="own" label="Own" value="a" density="comfortable" />
  `,
})
class HostComponent {}

describe('ExampleComponent', () => {
  const appDefaults = signal<KawaiDefaultsConfig>({});
  let fixture: ComponentFixture<HostComponent>;

  function example(id: string): HTMLElement {
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`#${id}`);
    if (!element) throw new Error(`#${id} not rendered`);
    return element;
  }

  beforeEach(async () => {
    appDefaults.set({ example: { density: 'compact' } });
    TestBed.configureTestingModule({ providers: [provideKawaiDefaults(appDefaults)] });
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('merges app and local levels', () => {
    expect(example('plain').classList).toContain('compact'); // app level
    expect(example('plain').querySelector('.label')?.classList).not.toContain(
      'kawai-label-truncate',
    ); // local
  });

  it('lets instance inputs win', () => {
    expect(example('own').classList).not.toContain('compact');
  });

  it('follows a signal default live', async () => {
    appDefaults.set({});
    await fixture.whenStable();
    expect(example('plain').classList).not.toContain('compact'); // library default
  });
});
```

**Registration**

```ts
// src/lib/ui/components/example/index.ts
export * from './example.component';
export * from './example.constant';
export * from './example.model';

// src/lib/ui/components/index.ts
export * from './example';

// src/lib/defaults/kawai-defaults.ts
import type { ExampleDefaultsConfig } from '../ui/components/example/example.model';
export interface KawaiDefaultsConfig {
  // …
  example?: ExampleDefaultsConfig;
}

// src/lib/theme/tokens.ts → KAWAI_COMP_TOKENS
'--kawai-comp-example-gap',
'--kawai-comp-example-label-color',
'--kawai-comp-example-label-width',

// projects/playground/src/app/app.routes.ts (and a nav link in app.ts)
{
  path: 'example',
  title: 'Example',
  loadComponent: () => import('./pages/example-page').then((m) => m.ExamplePage),
},
```
