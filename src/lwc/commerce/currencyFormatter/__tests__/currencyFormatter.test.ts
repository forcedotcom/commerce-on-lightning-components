import currencyFormatter from '../currencyFormatter';

describe('commerce:currencyFormatter Currency Formatter', () => {
    it('throws a TypeError if currency is not provided', () => {
        expect(() => {
            currencyFormatter(undefined, '32');
        }).toThrow(TypeError);
    });

    it.each([''])('throws a RangeError if currency is invalid (%s)', (currency) => {
        expect(() => {
            currencyFormatter(currency, '32');
        }).toThrow(RangeError);
    });

    it.each(['', 'invalidValue'])('throws a RangeError if currencyDisplay is invalid (%s)', (currencyDisplay) => {
        expect(() => {
            currencyFormatter('USD', '32', currencyDisplay);
        }).toThrow(RangeError);
    });

    /*
       This data-driven test is a bit less about testing the logic of 'currencyFormatter',
       since it is nothing more than a thin wrapper around the native API--which is no doubt
       well tested--but rather serves more as documentation for the expected behavior.

       Note: '\xa0' is a non breaking space (&nbsp;) and 'currencyDisplay' defaults to 'symbol'
    */
    it.each`
        currency | value            | currencyDisplay | expected
        ${'USD'} | ${''}            | ${undefined}    | ${'$0.00'}
        ${'USD'} | ${null}          | ${undefined}    | ${'$0.00'}
        ${'USD'} | ${undefined}     | ${undefined}    | ${'$NaN'}
        ${'JPY'} | ${'4000'}        | ${undefined}    | ${'¥4,000'}
        ${'JPY'} | ${'4000.00'}     | ${undefined}    | ${'¥4,000'}
        ${'JPY'} | ${'4000.45'}     | ${undefined}    | ${'¥4,000.45'}
        ${'JPY'} | ${'4000.55'}     | ${undefined}    | ${'¥4,000.55'}
        ${'KRW'} | ${'4000'}        | ${undefined}    | ${'₩4,000'}
        ${'USD'} | ${'32.50'}       | ${undefined}    | ${'$32.50'}
        ${'USD'} | ${32.5}          | ${undefined}    | ${'$32.50'}
        ${'USD'} | ${'132.3333333'} | ${undefined}    | ${'$132.3333333'}
        ${'USD'} | ${'132.335'}     | ${undefined}    | ${'$132.335'}
        ${'USD'} | ${'1500'}        | ${undefined}    | ${'$1,500.00'}
        ${'USD'} | ${1500}          | ${undefined}    | ${'$1,500.00'}
        ${'USD'} | ${1500.00000001} | ${undefined}    | ${'$1,500.00000001'}
        ${'USD'} | ${'500.04'}      | ${undefined}    | ${'$500.04'}
        ${'USD'} | ${'-500.04'}     | ${undefined}    | ${'-$500.04'}
        ${'CAD'} | ${'2500'}        | ${undefined}    | ${'CA$2,500.00'}
        ${'EUR'} | ${'1500'}        | ${undefined}    | ${'€1,500.00'}
        ${'GBP'} | ${'4500'}        | ${undefined}    | ${'£4,500.00'}
        ${'USD'} | ${'32.50'}       | ${'symbol'}     | ${'$32.50'}
        ${'USD'} | ${32.5}          | ${'symbol'}     | ${'$32.50'}
        ${'USD'} | ${'500.04'}      | ${'code'}       | ${'USD\xa0500.04'}
        ${'JPY'} | ${'4000'}        | ${'code'}       | ${'JPY\xa04,000'}
        ${'JPY'} | ${'4000.00'}     | ${'code'}       | ${'JPY\xa04,000'}
        ${'JPY'} | ${'4000.45'}     | ${'code'}       | ${'JPY\xa04,000.45'}
        ${'JPY'} | ${'4000.55'}     | ${'code'}       | ${'JPY\xa04,000.55'}
        ${'USD'} | ${'1500'}        | ${'name'}       | ${'1,500.00 US dollars'}
        ${'CAD'} | ${'2500'}        | ${'name'}       | ${'2,500.00 Canadian dollars'}
        ${'USD'} | ${'-1500'}       | ${'name'}       | ${'-1,500.00 US dollars'}
    `(
        'formats $value of $currency currency with a currencyDisplay of $currencyDisplay',
        ({ currency, value, currencyDisplay, expected }) => {
            expect(currencyFormatter(currency, value, currencyDisplay)).toBe(expected);
        }
    );
});
