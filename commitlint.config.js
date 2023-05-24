module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-case': [2, 'always', 'lower-case'],
        'scope-enum': [2, 'always', ['component', 'release', 'deps']],
        'subject-exclamation-mark': [2, 'never'],
    },
};
