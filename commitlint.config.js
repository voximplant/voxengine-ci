module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [2, 'always', ['upper-case', 'lower-case']],
  },
  ignores: [(message) => message.includes('chore(release):')],
};
