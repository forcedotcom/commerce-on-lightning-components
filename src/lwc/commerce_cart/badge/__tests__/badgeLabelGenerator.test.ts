import generateBadgeLabel from '../badgeLabelGenerator';

// Mock the labels with known values.
jest.mock('../labels', () => ({
    maximumCount: '{maximumCount}+',
}));

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

describe('commerce_cart/badgeLabelGenerator: Badge Label Generator', () => {
    [
        {
            maxLimit: 999,
            totalCount: [-500.0, -399.99, -0.9, '', 'Not a number', {}, [], 0, undefined, null],
        },
    ].forEach((scenario) => {
        scenario.totalCount.forEach((count) => {
            it(` returns no badge label text when count is ${count} and maxLimit is ${scenario.maxLimit})`, () => {
                expect(
                    //@ts-ignore Ignoring the types that we are passing in for testing
                    generateBadgeLabel(count, scenario.maxLimit)
                ).toBeUndefined();
            });
        });
    });

    [
        {
            count: 0.9,
            maxLimit: 999,
            result: '0.9',
        },
        {
            count: 0.901,
            maxLimit: 999,
            result: '0.901',
        },
        {
            count: 1,
            maxLimit: 999,
            result: '1',
        },
        {
            count: 999,
            maxLimit: 999,
            result: '999',
        },
        {
            count: 132.3333333,
            maxLimit: 999,
            result: '132.3333333',
        },
        {
            // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
            count: 998.3333333333333333333333333, // eslint-disable-line no-loss-of-precision
            maxLimit: 999,
            result: '998.3333333333334',
        },
    ].forEach((scenario) => {
        it(`returns the total count label text when the given total count (${scenario.count}) is less than or equal to (${scenario.maxLimit}) `, () => {
            expect(generateBadgeLabel(scenario.count, scenario.maxLimit)).toBe(scenario.result);
        });
    });

    [
        {
            count: 1000,
            maxLimit: 999,
            result: '999+',
        },
        {
            count: 100000,
            maxLimit: 999,
            result: '999+',
        },
        {
            // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
            count: 999.3333333333333333333333333333333, // eslint-disable-line no-loss-of-precision
            maxLimit: 999,
            result: '999+',
        },
    ].forEach((scenario) => {
        it(`returns ${scenario.result} label text when the given total count is greater than (${scenario.maxLimit})`, () => {
            expect(generateBadgeLabel(scenario.count, scenario.maxLimit)).toBe(scenario.result);
        });
    });
});
