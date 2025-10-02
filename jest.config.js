/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
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
    coverageThreshold: {
        global: {
            branches: 96,
            functions: 100,
            lines: 98,
            statements: 98,
        },
    },
};
