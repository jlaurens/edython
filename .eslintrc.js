module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  globals: {
    __static: true,
    goog: true,
    Blockly: true,
    eYo: true,
    XRegExp: true,
    brython: true,
  },
  plugins: [
    'html'
  ],
  'rules': {
    "indent": [2, 2],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'camelcase': 'off',
    'comma-dangle': ["error", "only-multiline"]
  }
}
