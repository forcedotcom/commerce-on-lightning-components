/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-case': [2, 'always', 'lower-case'],
        'scope-enum': [2, 'always', ['component', 'release', 'deps']],
        'subject-exclamation-mark': [2, 'never'],
    },
};
