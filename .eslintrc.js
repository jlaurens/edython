module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaVersion: 2020,
  },

  env: {
    browser: true,
    node: true
  },

  extends: [
    'plugin:vue/recommended',
    'eslint:recommended'
  ],

  globals: {
    __static: true,
    goog: true,
    Blockly: true,
    eYo: true,
    XRegExp: true,
    brython: true,
    tippy: true,
  },

  plugins: [
    'vue',
  ],

  rules: {
    "indent": ["error", 2],
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    camelcase: 'off',
    'comma-dangle': [
      'error',
      'only-multiline'
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-v-html': 'off'
  }
}
