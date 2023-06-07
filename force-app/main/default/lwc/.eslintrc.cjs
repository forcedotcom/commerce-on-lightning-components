module.exports = {
    extends: ['@salesforce/eslint-config-lwc/recommended', 'plugin:jsdoc/recommended'],
    plugins: ['notice', 'prettier', 'jsdoc'],
    rules: {
        'notice/notice': [
            'error',
            {
                mustMatch: 'Copyright \\(c\\) \\d{4}, salesforce.com, inc.',
                template: [
                    '/*',
                    ' * Copyright (c) <%= YEAR %>, salesforce.com, inc.',
                    ' * All rights reserved.',
                    ' * SPDX-License-Identifier: Apache-2.0',
                    ' * For full license text, see the LICENSE file in the repo',
                    ' * root or https://opensource.org/licenses/apache-2-0/',
                    ' */',
                    '',
                ].join('\n'),
            },
        ],
        'prettier/prettier': 'error',
        'jsdoc/check-tag-names': ['warn', { definedTags: ['slot'] }],
        'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    },
    overrides: [
        {
            files: ['*.test.js'],
            rules: {
                '@lwc/lwc/no-unexpected-wire-adapter-usages': 'off',
            },
            env: {
                node: true,
            },
        },
    ],
};
