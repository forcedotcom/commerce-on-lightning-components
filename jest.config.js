const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

const setupFilesAfterEnv = jestConfig.setupFilesAfterEnv || [];
setupFilesAfterEnv.push('<rootDir>/jest-sa11y-setup.js');

module.exports = {
    ...jestConfig,
    passWithNoTests: true,
    moduleNameMapper: {
        '^lightning/modal$': '<rootDir>/force-app/test/jest-mocks/lightning/modal/modal.js',
    },
    setupFilesAfterEnv,
    preset: '@lwc/jest-preset',
    moduleFileExtensions: ['js', 'html'],
    coverageThreshold: {
        global: {
            branches: 88,
            functions: 91,
            lines: 93,
            statements: 93,
        },
    },
};
