module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['node_modules/', 'dist/', '.next/'],
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': 'warn',
  },
};
