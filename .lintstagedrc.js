module.exports = {
    '**/*.{css,html,js,json,md,xml,yaml,yml}': ['prettier --write'],
    '**/lwc/**/*.js': [
        'eslint --config .eslintrc.cjs --fix',
        (files) => {
            // Only run tests on the specific changed files
            const testFiles = files.filter(
                (file) => file.includes('__tests__') || file.includes('.test.js') || file.includes('mockData.js')
            );

            if (testFiles.length > 0) {
                // Get the component files that correspond to the test files
                const componentFiles = files.filter(
                    (file) =>
                        !file.includes('__tests__') &&
                        !file.includes('.test.js') &&
                        !file.includes('mockData.js') &&
                        file.includes('lwc')
                );

                const coverageFrom = [...componentFiles, ...testFiles].join(',');
                return `sfdx-lwc-jest --skipApiVersionCheck -- --bail --coverage --collectCoverageFrom="${coverageFrom}" --coverageThreshold='{"global":{"branches":90,"functions":90,"lines":90,"statements":90}}' ${testFiles.join(
                    ' '
                )}`;
            }
            return 'echo "No test files to run"';
        },
    ],
};
