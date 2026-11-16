// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const storybookPlugin = require('eslint-plugin-storybook');

/** The plugin is ESM; `require` returns its namespace, so its config is under `default`. */
const storybook = storybookPlugin.default ?? storybookPlugin;

/** Angular signal factories that must always get an explicit type argument (esquery regex). */
const SIGNAL_FACTORIES =
  '/^(input|model|output|signal|computed|linkedSignal|viewChild|viewChildren|contentChild|contentChildren|resource|toSignal)$/';

module.exports = defineConfig([
  // Build output and caches, never source.
  // The playground is a sandbox: it only has to build.
  { ignores: ['dist/', 'out-tsc/', '.angular/', 'coverage/', 'projects/playground/'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        // Finds each file's tsconfig through the root tsconfig.json references.
        projectService: {
          allowDefaultProject: ['projects/kawai-ui/.storybook/main.ts'],
        },
        tsconfigRootDir: __dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // Parameters starting with `_` are deliberately unused, e.g. in `ngTemplateContextGuard(_dir, _context)`.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Angular classes can be empty when the decorator does the work (template-only components).
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      // Numbers in template strings (generated ids, px values) are always safe to interpolate.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

      // Types are written out, never left to defaults or inference:
      // signal factories always take explicit type arguments, even when equal to the default.
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: `CallExpression[callee.type='Identifier'][callee.name=${SIGNAL_FACTORIES}]:not([typeArguments])`,
          message:
            'Signal factories need an explicit type argument, e.g. output<void>() or signal<boolean>(false).',
        },
        {
          selector: `CallExpression[callee.object.name=${SIGNAL_FACTORIES}][callee.property.name='required']:not([typeArguments])`,
          message:
            'Signal factories need an explicit type argument, e.g. input.required<string>().',
        },
      ],
      // Needed for output<void>(): this rule rejects void in any call's type arguments, with no option to allow it.
      '@typescript-eslint/no-invalid-void-type': 'off',
      // Every function states its return type, `: void` included. Only callbacks whose type is fixed
      // by where they're passed or assigned (`onDestroy(() => …)`, `.map(x => …)`) are exempt.
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: false,
          allowDirectConstAssertionInArrowFunctions: false,
          allowIIFEs: false,
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'kawai',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'kawai',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
  // Story files and .storybook/main.ts.
  ...storybook.configs['flat/recommended'],
]);
