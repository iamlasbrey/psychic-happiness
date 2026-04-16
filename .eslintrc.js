// .eslintrc.js
module.exports = {
    env: {
      node: true,
      es2021: true,
    },
    extends: [
      'airbnb-base',               // 1. Add this
      'plugin:prettier/recommended', // 2. Make sure Prettier is LAST
    ],
    parserOptions: {
      ecmaVersion: 'latest',
    },
    rules: {
      // Turn prettier rules into warnings
      'prettier/prettier': 'warn',
      
      // You can add overrides for Airbnb rules here
      // For example, Airbnb prefers named exports, but if you
      // prefer default exports, you can turn this rule off:
      'import/prefer-default-export': 'off',
      'no-console': 'off', // Allow console.log
    },
  };