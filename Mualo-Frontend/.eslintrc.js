module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  rules: {
    // Suppress @env import error - it's handled by babel
    'import/no-unresolved': ['error', { ignore: ['^@env$'] }],
  },
  settings: {
    'import/resolver': {
      'babel-module': {}
    }
  }
};