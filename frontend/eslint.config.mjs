import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: ['.next/', 'node_modules/', 'out/'],
  },
];
