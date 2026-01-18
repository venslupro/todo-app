module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'google',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // Google Style Guide rules
    'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'arrow-parens': ['error', 'always'],
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    
    // TypeScript specific rules - relaxed for Hono/Cloudflare Workers
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // Allow any for Hono context types
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/type-annotation-spacing': 'error',
    
    // Custom rules for better code quality
    'no-console': 'off', // Allow console for Cloudflare Workers
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    'no-throw-literal': 'off', // Allow throwing string literals
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    '*.d.ts',
  ],
};