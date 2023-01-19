import { changeSign } from '../transformers';

describe('changeSign', () => {
    [
        {
            value: 0,
            makePositive: true,
            expected: 0,
        },
        {
            value: -1.5,
            makePositive: true,
            expected: 1.5,
        },
        {
            value: -1.5,
            makePositive: false,
            expected: -1.5,
        },
        {
            value: 1.5,
            makePositive: false,
            expected: -1.5,
        },
        {
            value: 1.5,
            makePositive: true,
            expected: 1.5,
        },
        {
            value: undefined,
            makePositive: true,
            expected: undefined,
        },
    ].forEach((values) => {
        it(`returns: ${values.expected}, when the value is: ${values.value} and makePositive is: ${values.makePositive}`, () => {
            expect(changeSign(values.value, values.makePositive)).toBe(values.expected);
        });
    });
});
