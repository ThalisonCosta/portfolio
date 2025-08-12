import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config([
  { ignores: ['dist', 'node_modules', '**/*.d.ts', 'tests/drag-drop.spec.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strict,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Airbnb-style rules adapted for ESLint 9
      // Variables
      'no-unused-vars': 'off', // handled by @typescript-eslint
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-const-assign': 'error',
      'no-undef': 'error',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
          variables: false,
        },
      ],

      // Objects
      'object-shorthand': ['error', 'always'],
      'quote-props': ['error', 'as-needed'],
      'no-prototype-builtins': 'error',
      'prefer-object-spread': 'error',

      // Arrays
      'array-callback-return': 'error',
      'prefer-destructuring': [
        'error',
        {
          array: true,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],

      // Strings
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],
      'prefer-template': 'error',
      'template-curly-spacing': ['error', 'never'],
      'no-eval': 'error',
      'no-useless-escape': 'error',

      // Functions
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'wrap-iife': ['error', 'outside', { functionPrototypeMethods: false }],
      'prefer-rest-params': 'error',
      'default-param-last': 'error',
      'no-new-func': 'error',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: [
            'acc',
            'accumulator',
            'e',
            'ctx',
            'context',
            'req',
            'request',
            'res',
            'response',
            '$scope',
            'staticContext',
          ],
        },
      ],
      'prefer-arrow-callback': [
        'error',
        {
          allowNamedFunctions: false,
          allowUnboundThis: true,
        },
      ],
      'arrow-spacing': ['error', { before: true, after: true }],
      'arrow-parens': ['error', 'always'],
      'arrow-body-style': [
        'error',
        'as-needed',
        {
          requireReturnForObjectLiteral: false,
        },
      ],
      'no-confusing-arrow': [
        'error',
        {
          allowParens: true,
        },
      ],
      'implicit-arrow-linebreak': ['error', 'beside'],

      // Classes & Constructors
      'class-methods-use-this': 'error',
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',
      'no-dupe-class-members': 'off',
      '@typescript-eslint/no-dupe-class-members': 'error',

      // Modules
      'no-duplicate-imports': 'error',
      'import/no-mutable-exports': 'off', // Would need eslint-plugin-import
      'import/prefer-default-export': 'off', // Would need eslint-plugin-import
      'import/no-webpack-loader-syntax': 'off', // Would need eslint-plugin-import

      // Control Statements
      'no-else-return': ['error', { allowElseIf: false }],
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-mixed-operators': [
        'error',
        {
          groups: [
            ['%', '**'],
            ['%', '+'],
            ['%', '-'],
            ['%', '*'],
            ['%', '/'],
            ['/', '*'],
            ['&', '|', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!=='],
            ['&&', '||'],
          ],
          allowSamePrecedence: false,
        },
      ],
      'multiline-ternary': ['error', 'never'],

      // Blocks
      'nonblock-statement-body-position': ['error', 'beside', { overrides: {} }],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      curly: ['error', 'multi-line'],
      'no-lone-blocks': 'error',

      // Comments
      'spaced-comment': [
        'error',
        'always',
        {
          line: {
            exceptions: ['-', '+'],
            markers: ['=', '!', '/'],
          },
          block: {
            exceptions: ['-', '+'],
            markers: ['=', '!', ':', '::'],
            balanced: true,
          },
        },
      ],

      // Whitespace
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          FunctionDeclaration: {
            parameters: 1,
            body: 1,
          },
          FunctionExpression: {
            parameters: 1,
            body: 1,
          },
          CallExpression: {
            arguments: 1,
          },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          flatTernaryExpressions: false,
          ignoredNodes: [
            'JSXElement',
            'JSXElement > *',
            'JSXAttribute',
            'JSXIdentifier',
            'JSXNamespacedName',
            'JSXMemberExpression',
            'JSXSpreadAttribute',
            'JSXExpressionContainer',
            'JSXOpeningElement',
            'JSXClosingElement',
            'JSXFragment',
            'JSXOpeningFragment',
            'JSXClosingFragment',
            'JSXText',
            'JSXEmptyExpression',
            'JSXSpreadChild',
          ],
          ignoreComments: false,
        },
      ],
      'space-before-blocks': 'error',
      'keyword-spacing': [
        'error',
        {
          before: true,
          after: true,
          overrides: {
            return: { after: true },
            throw: { after: true },
            case: { after: true },
          },
        },
      ],
      'space-infix-ops': 'error',
      'eol-last': ['error', 'always'],
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
      'no-whitespace-before-property': 'error',
      'padded-blocks': [
        'error',
        {
          blocks: 'never',
          classes: 'never',
          switches: 'never',
        },
        {
          allowSingleLineBlocks: true,
        },
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxBOF: 0,
          maxEOF: 0,
        },
      ],
      'space-in-parens': ['error', 'never'],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'max-len': [
        'error',
        120,
        2,
        {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      'comma-style': [
        'error',
        'last',
        {
          exceptions: {
            ArrayExpression: false,
            ArrayPattern: false,
            ArrowFunctionExpression: false,
            CallExpression: false,
            FunctionDeclaration: false,
            FunctionExpression: false,
            ImportDeclaration: false,
            ObjectExpression: false,
            ObjectPattern: false,
            VariableDeclaration: false,
            NewExpression: false,
          },
        },
      ],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],

      // Semicolons
      semi: ['error', 'always'],
      'no-extra-semi': 'error',

      // Type Conversion
      radix: 'error',
      'no-new-wrappers': 'error',

      // Naming Conventions
      camelcase: ['error', { properties: 'never', ignoreDestructuring: false }],
      'new-cap': [
        'error',
        {
          newIsCap: true,
          newIsCapExceptions: [],
          capIsNew: false,
          capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
          properties: true,
        },
      ],
      'no-underscore-dangle': [
        'error',
        {
          allow: [],
          allowAfterThis: false,
          allowAfterSuper: false,
          enforceInMethodNames: true,
          allowAfterThisConstructor: false,
          allowFunctionParams: true,
        },
      ],

      // Accessors
      'accessor-pairs': 'off',
      'getter-return': ['error', { allowImplicit: true }],

      // Comparison Operators & Equality
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-case-declarations': 'error',
      'no-nested-ternary': 'error',
      'no-unreachable': 'error',
      'default-case': ['error', { commentPattern: '^no default$' }],

      // TypeScript specific rules
      '@typescript-eslint/no-non-null-assertion': 'warn', // Allow but warn

      // React specific rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.{ts,tsx}', '**/tests/**/*', '**/__tests__/**/*.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        // Playwright globals
        test: 'readonly',
        expect: 'readonly',
        page: 'readonly',
        browser: 'readonly',
        context: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Relax rules for test files
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-undef': 'off', // Jest globals are handled by globals.jest
      'max-len': 'off', // Allow longer lines in tests
    },
  },
  prettierConfig, // This disables ESLint rules that conflict with Prettier
]);
