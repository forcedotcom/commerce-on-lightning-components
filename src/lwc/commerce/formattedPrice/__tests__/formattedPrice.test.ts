import { createElement } from 'lwc';
import FormattedPrice from 'commerce/formattedPrice';
import currencyFormatter from 'commerce/currencyFormatter';

jest.mock('commerce/currencyFormatter', () => jest.fn((_currency, value) => value));

type ComponentInputs = 'currencyCode' | 'value' | 'displayCurrencyAs';

describe('commerce/formattedPrice: Formatted Price', () => {
    let element: HTMLElement & FormattedPrice;
    beforeEach(() => {
        element = createElement('commerce-formatted-price', {
            is: FormattedPrice,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should be accessible', async () => {
        element.currencyCode = 'USD';
        element.value = 123;

        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    (
        [
            {
                property: 'currencyCode',
                changeValue: 'USD',
            },
            {
                property: 'value',
                changeValue: 1500,
            },
            {
                property: 'displayCurrencyAs',
                changeValue: 'symbol',
            },
        ] as { property: ComponentInputs; defaultValue?: unknown; changeValue: FormattedPrice[ComponentInputs] }[]
    ).forEach(({ property, defaultValue, changeValue }) => {
        describe(`the ${property} property`, () => {
            it(`defaults to ${defaultValue}`, () => {
                expect(element[property]).toBe(defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[property]).not.toBe(changeValue);

                // Change the value.
                // @ts-ignore Some properties don't have anything in common... since this is dynamic, we can ignore it.
                element[property] = changeValue;

                // Ensure we reflect the changed value.
                expect(element[property]).toBe(changeValue);
            });
        });
    });

    describe('currencyFormatter()', () => {
        afterEach(() => jest.clearAllMocks());

        it('is called when both currencyCode and value is provided', () => {
            element.currencyCode = 'USD';
            element.value = '32';

            return Promise.resolve().then(() => {
                expect(currencyFormatter).toHaveBeenCalledWith('USD', '32', 'symbol');
            });
        });

        it('is called when a currencyCode and value of 0 is provided', () => {
            element.currencyCode = 'USD';
            element.value = 0;

            return Promise.resolve().then(() => {
                expect(currencyFormatter).toHaveBeenCalledWith('USD', 0, 'symbol');
            });
        });

        it(`is called when a currencyCode and value of '0' is provided`, () => {
            element.currencyCode = 'EUR';
            element.value = '0';

            return Promise.resolve().then(() => {
                expect(currencyFormatter).toHaveBeenCalledWith('EUR', '0', 'symbol');
            });
        });

        it('is not called if only currencyCode is provided', () => {
            element.currencyCode = 'USD';

            return Promise.resolve().then(() => {
                expect(currencyFormatter).not.toHaveBeenCalled();
            });
        });

        it('is not called if only value is provided', () => {
            element.value = '32';

            return Promise.resolve().then(() => {
                expect(currencyFormatter).not.toHaveBeenCalled();
            });
        });

        it('is not called when neither currencyCode nor value is provided', () => {
            return Promise.resolve().then(() => {
                expect(currencyFormatter).not.toHaveBeenCalled();
            });
        });
    });
});
