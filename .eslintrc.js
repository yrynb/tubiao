// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    SYS_CONFIG: true,
    spray: true
  },
  extends: ['plugin:vue/essential', 'standard', 'prettier'],
  // required to lint *.vue files
  plugins: ['vue', 'prettier'],
  // add your custom rules here
  rules: {
    // allow async-await
    // 'generator-star-spacing': 'off',
    // // allow debugger during development
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'space-before-function-paren': 'off',
    // 'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }],
    // 'no-useless-escape': 0,
    // 'indent' : "off",
    // 'template-curly-spacing' : "off",
    'prettier/prettier': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }]
  }
}
