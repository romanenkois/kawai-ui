# kawai-ui project rules

Rules for all code in the library. Component and directive specifics are in `component-guide.md`.

## TypeScript

Lint enforces all of these:

- Use strict type checking
- Always write type arguments on Angular signal factories, even when equal to the default: `input`, `model`, `output`, `signal`, `computed`, `linkedSignal`, `viewChild(ren)`, `contentChild(ren)`, `resource`, `toSignal`, and their `.required` variants
  - `output<void>()`, never `output()`
  - `input<TooltipPosition>('bottom')`, `signal<boolean>(false)`
  - inputs with a transform state both types: `input<boolean, unknown>(false, { transform: booleanAttribute })`
- Every function, method and arrow assigned to a variable or field states its return type, `: void` included. Only inline callbacks whose type comes from where they're passed are exempt (`onDestroy(() => …)`, `.map((x) => …)`)
- Avoid the `any` type; use `unknown` when type is uncertain
- Deliberately unused parameters start with `_`

## Angular

- Use the `inject()` function instead of constructor injection
- Use signals for state; keep state transformations pure. Do NOT use `mutate` on signals, use `update` or `set` instead
- Design services around a single responsibility
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)

## Theme

Component styling is in the component guide; these rules are about the theme itself (`styles/kawai-theme.css`, `tokens.ts`):

- Token tiers, each with its own prefix:
  - `--kawai-ref-<light|dark>-<role>`: raw palette, one set per mode. Declared in `kawai-theme.css` only.
  - `--kawai-sys-<category>-<name>`: semantic tokens that components read. Themes map sys colors to ref colors.
  - `--kawai-comp-<component>[-<part>]-<property>[-<state>]`: per-component overrides. Never declared in the theme CSS.
- Add every new token to `tokens.ts`. `check:theme` fails otherwise.
- `--kawai-sys-font-family` is deliberately undeclared, so components inherit the app font.
- The library never picks a theme. Apps set `kawai-theme="light|dark|auto"`. Only `[kawai-theme='auto']` may read `prefers-color-scheme`.
- Dark sys values appear twice in `kawai-theme.css`: in `[kawai-theme='dark']` and in the `auto` media query. Change both together.
- Tokens in `kawai-theme.css` stay inside `@layer kawai`, so app overrides always win. Style rules there (only for elements rendered outside components, like `.kawai-tooltip`) go unlayered after the layer, so global resets in the app can't strip them.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Text tokens need 4.5:1 contrast against the surface tokens, and borders and focus rings 3:1. Any palette change must pass `check:theme`.

## Storybook

- Keep every Storybook package on the same version, `eslint-plugin-storybook` included
- The Foundations/Tokens gallery reads `tokens.ts`, so new tokens appear there automatically
