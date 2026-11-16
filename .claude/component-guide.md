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
| `<name>.component.spec.ts`      | Tests: the defaults chain plus the component's core behaviour                                              |
| `<name>-templates.directive.ts` | Marker directives for projected templates, when the component takes any                                    |
| `index.ts`                      | The folder's barrel: `export *` of every public file in it (never the spec). Required in every folder      |

The parent barrel (`components/index.ts`, `directives/index.ts`) only re-exports the folders (`export * from './accordion';`), never individual files. A new public file goes in the folder's own `index.ts`.

Pieces several components share go in `src/lib/ui/shared/<name>/` with the same model/constant split (e.g. `shared/label/`).

**Why:** the same layout everywhere means every component can be read, reviewed and extended the same way, and types, values and behaviour never mix in one file.

## 2. Angular basics

- Keep each component small and focused on one responsibility.
- Standalone components (the default; never write `standalone: true`). Don't set `changeDetection: OnPush` either, it's the default in v22.
- Selectors: components `kawai-<kebab-case>`, directives `kawai<CamelCase>` (lint enforces the prefix). A directive's main input is aliased with the directive name (`kawaiTooltip`).
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

Every label or heading uses the shared `KawaiLabelOptions` from `src/lib/ui/shared/label/`:

```ts
interface KawaiLabelOptions {
  text: string; // also the accessible name of what it labels
  truncate: boolean; // one line + ellipsis (default true)
  tooltip: KawaiDeepPartial<Pick<TooltipOptions, 'position'>> | null; // full text while truncated; null = none
  align: KawaiLabelAlign; // 'start' | 'center' | 'end' within the label's area
}
```

- The input is `input.required<string | KawaiDeepPartial<KawaiLabelOptions>>()` (or optional when a template can replace it, as with the accordion heading).
- Defaults: `KAWAI_LABEL_DEFAULTS` in the component's constant. Tooltip: `labelTooltip(resolvedLabel)` from `label.util.ts`. A tooltip position left out falls through to the tooltip defaults.
- A component-specific label **extends** the type instead of redefining it.
- When the label sits in a column, add a `--kawai-comp-<component>-label-width` token (default: fits the text), so `align` has an area to align within.
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

All text and labels (headings, field labels, values, option labels, button text) stay on **one line** by default, cut off with an ellipsis, with the full text in `kawaiTooltip` with `onlyWhenTruncated: true`. Exceptions: free-form content (bodies, descriptions), and places where an option (`truncate: false`) turns it off.

The tooltip's host must be the element that clips (`overflow: hidden; text-overflow: ellipsis`), and the mouse must be able to reach it: an overlay on top (like a transparent radio input) blocks hover, so give the overlay `pointer-events: none`.

The keyboard must reach it too, and `kawaiTooltip` finds how by itself: a host inside a `button` or link, or that is (or is inside) the `<label>` of a control, opens while that control has keyboard focus; any other host becomes a tab stop (`tabindex="0"`) while its text is clipped. So put the clipped text inside its control or `<label>` where there is one.

**Why:** compact, predictable layouts that never break on long text, without hiding information.

## 5. Defaults

Every configuration input resolves through one chain, nearest first:

**instance input → nearest `provideKawaiDefaults()` → … → app-level `provideKawaiDefaults()` → library defaults**

- **Library defaults** (`<name>.constant.ts`): one object per component, every value filled in, typed `Readonly<<Component>Defaults>`. Same shape as the component's part of `provideKawaiDefaults()`.
- **`<Component>DefaultsConfig`** (`<name>.model.ts`): the same values as the inputs (shorthands and `null` included), every field optional, minus content. Register it in `KawaiDefaultsConfig` (`src/lib/defaults/kawai-defaults.ts`) under the component's camelCase name (`numberStepper`).
- **`provideKawaiDefaults(config | Signal<config>)`** works in app config, route and component `providers`. Each level only states what it changes. A signal updates components live.
- **Resolution:** read levels with `injectKawaiDefaults()`, resolve inside a `computed()`: options inputs with `resolveOptionsChain()`, plain inputs with `resolveValueChain()`. Never ad-hoc spreads.
- **Configuration inputs have no initial value** (`input<AccordionOverflow>()`), so `undefined` means "not set here" and the chain continues. The default exists only in the constant.
- **`null`** at any level turns an option off from there down; a nearer level can turn it back on (merging over the library defaults).
- **Defaults that depend on the component's own content** (e.g. a custom indicator template isn't rotated) are applied to the library defaults inside the component, so any level can still override them.
- **A value set on a data item wins over everything** (e.g. an info panel field's own `linksOverflow`), then the chain applies.

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

Query through `fixture.nativeElement`, throw a clear error instead of `!` when an element is missing (lint forbids `!`).

## 10. Stories (`stories/<components|directives>/<name>.stories.ts`)

- Import from `../../src/public-api`.
- Flatten options into separate controls and rebuild the object in `render` (`stories/shared/label-controls.ts` does it for labels). Each control's `description` names the option path (`` `layout.body` ``).
- The story acts as the parent: it stores emitted values (`(valueChange)="value = $event; valueChange($event)"`), and outputs are `fn()` args so they show in the Actions panel.
- One story per meaningful state: defaults, each option value worth seeing, bounds, long text (truncation), overflow, custom templates, and one with `applicationConfig({ providers: [provideKawaiDefaults(…)] })` showing app defaults.

## 11. Checklist: adding a component

1. Ask about anything unclear first (inputs, options, defaults, null meaning, accessibility), with pros, cons and pitfalls for real decisions.
2. Create the folder and files from section 1 (`ng generate component` already makes `.scss`).
3. Sort the inputs (section 3). Write the model: options interfaces, `<Component>Defaults`, `<Component>DefaultsConfig`.
4. Write the constant: `KAWAI_<COMPONENT>_DEFAULTS`.
5. Write the component: inputs without initial values for configuration, `injectKawaiDefaults()`, one `computed()` per resolved input, dev-mode warnings for missing accessible names, JSDoc.
6. Styles: tokens only, comp tokens for themable properties, reduced motion, logical properties.
7. Register:
   - `src/lib/ui/components/<name>/index.ts`: export the component, model, constant (and templates directive); `src/lib/ui/components/index.ts`: add `export * from './<name>';`
   - `src/lib/defaults/kawai-defaults.ts`: add `<camelName>?: <Component>DefaultsConfig` to `KawaiDefaultsConfig`
   - `src/lib/theme/tokens.ts`: every new token
8. Spec (section 9) and stories (section 10).
9. Run: `npm run lint`, `npm test`, `npm run check:theme`, `ng build kawai-ui`, `npm run build-storybook`, `npm run test:a11y`.

## 12. Skeletons

A component `kawai-example` with a label and one plain configuration input, `density`.

**`example.model.ts`**

```ts
import type { KawaiLabelDefaultsConfig, KawaiLabelOptions } from '../../shared/label/label.model';

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
import { KAWAI_LABEL_DEFAULTS } from '../../shared/label/label.constant';
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
import { KawaiDeepPartial, resolveOptionsChain, resolveValueChain } from '../../../utils/options';
import { TooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { TooltipOptions } from '../../directives/tooltip/tooltip.model';
import { KawaiLabelOptions } from '../../shared/label/label.model';
import { labelTooltip } from '../../shared/label/label.util';
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
  imports: [TooltipDirective],
  host: { '[class.compact]': "densityValue() === 'compact'" },
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
    resolveOptionsChain(
      [...this.defaultLevels().map((level) => level.example?.label), this.label()],
      KAWAI_EXAMPLE_DEFAULTS.label,
      'text',
    ),
  );
  protected readonly labelTooltip = computed<KawaiDeepPartial<TooltipOptions> | null>(() =>
    labelTooltip(this.labelOptions()),
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
<span
  class="label"
  [id]="labelId"
  [class.truncate]="labelOptions().truncate"
  [style.text-align]="labelOptions().align"
  [kawaiTooltip]="labelTooltip()"
  >{{ labelOptions().text }}</span
>
```

**`example.component.scss`**

```scss
:host {
  display: grid;
  grid-template-columns: var(--kawai-comp-example-label-width, fit-content(50%)) minmax(0, 1fr);
  gap: 0 var(--kawai-comp-example-gap, var(--kawai-sys-space-lg));
  font-family: var(--kawai-sys-font-family);
}

:host(.compact) {
  gap: 0 var(--kawai-comp-example-gap, var(--kawai-sys-space-sm));
}

.label {
  min-inline-size: 0;
  color: var(--kawai-comp-example-label-color, var(--kawai-sys-color-text-muted));
}

.label.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
    expect(example('plain').querySelector('.label')?.classList).not.toContain('truncate'); // local
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
```
