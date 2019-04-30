// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: "babel-eslint",
    sourceType: 'module',
    allowImportExportEverywhere: false
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: [
      'eslint:recommended',
      'plugin:vue/recommended'
  ],
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // ignores multiple spaces before comments that occur at the end of lines
    'no-multi-spaces': [
      "error",
      { ignoreEOLComments: true }],
    'object-curly-spacing': ["error", "never"],
    'no-console': "warn",
    'vue/max-attributes-per-line': ["error", {
        "singleline": 3
    }],
    "vue/singleline-html-element-content-newline": "off",
    "vue/html-self-closing": ["warn", {
      "html": {
        "void": "never",
        "normal": "any",
        "component": "always"
      },
      "svg": "always",
      "math": "always"
    }],
    "vue/name-property-casing": ["error", "PascalCase"],
    "vue/no-side-effects-in-computed-properties": "warn"

  }
}
