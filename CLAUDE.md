You are an expert in TypeScript, Angular, and component library development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

# Agent mode

User is always here, always ask about anything that is not 100% clear, never just assume, ask as much question as needed to clarify all the potential cases of the dispatched work. If the question has some fundamental important decision, explain the pros and cons of each options, what are the potential pitfalls

## Project

kawai-ui is an Angular v22 component library, built with ng-packagr. The workspace has one project, `kawai-ui`, in `projects/kawai-ui`:

- `src/lib/ui/components/<name>/`: components
- `src/lib/ui/directives/<name>/`: directives
- `src/lib/theme/tokens.ts`: the TypeScript list of every design token
- `styles/kawai-theme.css`: the theme stylesheet, shipped as `kawai-ui/styles/kawai-theme.css`
- `stories/`: Storybook stories (not shipped). Config is in `.storybook/`.

Everything public goes through the `index.ts` barrels into `src/public-api.ts`. Export every new public symbol there.

## Before finishing

Run whichever of these the change touches. All must pass:

- `npm run lint`: ESLint, including template accessibility and the type rules below
- `npm run check:theme`: token list in sync with usage; built-in palettes pass WCAG AA contrast
- `ng build kawai-ui`: library build
- `npm run build-storybook`: when components, stories or tokens changed

## TypeScript

Lint enforces all of these:

- Use strict type checking
- Always write type arguments on Angular signal factories, even when equal to the default: `input`, `model`, `output`, `signal`, `computed`, `linkedSignal`, `viewChild(ren)`, `contentChild(ren)`, `resource`, `toSignal`, and their `.required` variants
  - `output<void>()`, never `output()`
  - `input<TooltipPosition>('bottom')`, `signal<boolean>(false)`
  - inputs with a transform state both types: `input<boolean, unknown>(false, { transform: booleanAttribute })`
- Every function, method and arrow assigned to a variable or field states its return type, `: void` included. Only inline callbacks whose type comes from where they're passed are exempt (`onDestroy(() => …)`, `.map((x) => …)`)
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use the `inject()` function instead of constructor injection
- Selectors use the `kawai` prefix: components `kawai-<kebab-case>`, directives `kawai<CamelCase>`
- Directive inputs are aliased with the directive name: `kawaiTooltip`, `kawaiTooltipPosition`
- Generated element ids are prefixed `kawai-<component>-`, with a module-level counter for uniqueness

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- When using external templates/styles, use paths relative to the component TS file
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- Give every public component and directive a JSDoc comment describing its behavior and who owns its state. Storybook autodocs shows it.

## State Management

- Use signals for local component state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Templates can't use globals: don't assume something like `new Date()` is available

## Styling and theming

- Component styles read only `--kawai-*` tokens. Never hard-code colors, spacing, radii, font sizes, weights, shadows or z-indexes.
- Token tiers, each with its own prefix:
  - `--kawai-ref-<light|dark>-<role>`: raw palette, one set per mode. Declared in `kawai-theme.css` only.
  - `--kawai-sys-<category>-<name>`: semantic tokens that components read. Themes map sys colors to ref colors.
  - `--kawai-comp-<component>[-<part>]-<property>[-<state>]`: per-component overrides. Never declared in the theme CSS; components use them with a sys fallback, e.g. `var(--kawai-comp-accordion-radius, var(--kawai-sys-radius-md))`.
- Give each themable property of a new component a comp token in that pattern. Property names come from: `color`, `background`, `border-color`, `radius`, `padding`, `gap`, `font-size`, `font-weight`, `shadow`, `focus-ring-color`. State suffixes: `hover`, `checked`, `disabled`.
- Add every new token to `tokens.ts`. `check:theme` fails otherwise.
- `--kawai-sys-font-family` is deliberately undeclared, so components inherit the app font. Set `font-family: var(--kawai-sys-font-family)` on the host, never a font stack.
- The library never picks a theme. Apps set `kawai-theme="light|dark|auto"`. Only `[kawai-theme='auto']` may read `prefers-color-scheme`.
- Dark sys values appear twice in `kawai-theme.css`: in `[kawai-theme='dark']` and in the `auto` media query. Change both together.
- Everything in `kawai-theme.css` stays inside `@layer kawai`, so app overrides always win.
- Elements rendered outside the host (such as the tooltip in `<body>`) copy the nearest `kawai-theme` attribute value.
- Use logical properties (`inline-size`, `margin-inline-start`, `border-start-start-radius`) so layouts work right to left.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Components assume they sit on `--kawai-sys-color-surface`. Text tokens need 4.5:1 contrast against the surface tokens, and borders and focus rings 3:1. Any palette change must pass `check:theme`.
- Build on native elements first (buttons, radio inputs, labels), then add ARIA.
- Controls at a limit use `aria-disabled`, not `disabled`, so they keep focus.
- Every interactive element has a visible `:focus-visible` outline, using `--kawai-sys-focus-ring-width` and a focus ring color token.

## Services

- Design services around a single responsibility
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)

## Storybook

- Stories live in `projects/kawai-ui/stories/<components|directives|foundations>/<name>.stories.ts` and import from `../../src/public-api`
- Components are stateless, so stories act as the parent: the `render` template stores emitted values (`(valueChange)="value = $event; valueChange($event)"`), and outputs are `fn()` args so they show in the Actions panel
- Cover each meaningful state as its own story: bounds, truncation, overflow, empty
- The Foundations/Tokens gallery reads `tokens.ts`, so new tokens appear there automatically
- Keep every Storybook package on the same version, `eslint-plugin-storybook` included
