import { createElement } from 'lwc';
import InputForm from '../inputForm';
import { querySelector } from 'kagekiri';
import type applyButton from '../../applyButton/applyButton';
import { registerSa11yMatcher } from '@sa11y/jest';
import { applyCouponToCart } from 'commerce/cartApi';

const COUPON_INPUT_CHAR_LIMIT = 255;

jest.mock(
    'commerce/cartApiInternal',
    () => ({
        applyCouponToCart: jest.fn(),
    }),
    { virtual: true }
);
jest.mock(
    '@salesforce/label/Cart_Error_Messages.defaultErrorMessage',
    () => {
        return {
            default: 'Default Error',
        };
    },
    { virtual: true }
);

describe('commerce_unified_coupons/inputForm: Input Form', () => {
    let element: InputForm & HTMLElement;

    type inputForm = 'revealCouponButtonText' | 'buttonText' | 'placeholderText' | 'showRevealCouponInputButton';

    beforeAll(() => {
        registerSa11yMatcher();
    });

    beforeEach(() => {
        element = createElement('commerce_unified_coupons-input-form', {
            is: InputForm,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.removeChild(element);
    });

    describe.each`
        property                         | defaultValue | changeValue
        ${'revealCouponButtonText'}      | ${undefined} | ${''}
        ${'buttonText'}                  | ${undefined} | ${''}
        ${'placeholderText'}             | ${undefined} | ${''}
        ${'showRevealCouponInputButton'} | ${undefined} | ${true}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<inputForm>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            // Ensure the value isn't already set to the target value.
            expect(element[<inputForm>property]).not.toBe(changeValue);

            // Change the value.
            element[<inputForm>property] = changeValue;

            // Ensure we reflect the changed value.
            expect(element[<inputForm>property]).toBe(changeValue);
        });
    });

    describe('a11y', () => {
        it('should be accessible when the reveal coupon input button is shown', async () => {
            element.revealCouponButtonText = 'Add a coupon';
            element.buttonText = 'Apply';
            element.placeholderText = 'Enter a coupon';
            element.showRevealCouponInputButton = true;
            await Promise.resolve();
            return Promise.resolve().then(() => expect(element).toBeAccessible());
        });
    });

    describe('the input form', () => {
        it('is not displayed when showRevealCouponInputButton is true and the reveal coupon input button has not been clicked', () => {
            element.showRevealCouponInputButton = true;
            return Promise.resolve().then(() => {
                const inputElement = <inputForm & HTMLElement>querySelector('commerce_unified_promotions-summary');
                expect(inputElement).toBeFalsy();
            });
        });

        it('is displayed when showRevealCouponInputButton is false', () => {
            return Promise.resolve().then(() => {
                const inputElement = <inputForm & HTMLElement>querySelector('lightning-input');
                expect(inputElement).toBeTruthy();
            });
        });

        it('is displayed when the reveal coupon input button is clicked', () => {
            element.showRevealCouponInputButton = true;
            return Promise.resolve()
                .then(() => {
                    const addCouponBtnElement = (<applyButton & HTMLButtonElement>(
                        querySelector('button')
                    )) as HTMLButtonElement;

                    addCouponBtnElement.click();
                })
                .then(() => {
                    const inputElement = <inputForm & HTMLElement>querySelector('lightning-input');
                    expect(inputElement).toBeTruthy();
                });
        });
    });

    describe('the input box', () => {
        it(`displays the provided error message when setCustomValidity has been called`, () => {
            const inputElement = (<inputForm & HTMLElement>querySelector('lightning-input')) as inputForm;
            const validitySpy = jest.spyOn(inputElement, 'setCustomValidity');
            const errorMsg = 'An unexpected error occurred. Try again later.';
            // Simulate apply coupon failed
            element.setCustomValidity(errorMsg);

            return Promise.resolve().then(function () {
                expect(validitySpy).toHaveBeenCalledWith(errorMsg);
            });
        });

        [undefined, null, ''].forEach((invalidErrorMsg) => {
            it(`does not display an error message when setCustomValidity has been called with an error message of '${invalidErrorMsg}'`, () => {
                const inputElement = (<inputForm & HTMLElement>querySelector('lightning-input')) as inputForm;
                const validitySpy = jest.spyOn(inputElement, 'setCustomValidity');
                const errorMsg = invalidErrorMsg;
                // simulate apply coupon failed
                element.setCustomValidity(<string>errorMsg);

                return Promise.resolve().then(function () {
                    expect(validitySpy).toHaveBeenCalledWith('');
                });
            });
        });

        it(`displays an error message when the input has 255 characters and the max character limit is ${COUPON_INPUT_CHAR_LIMIT}.`, () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            const validitySpy = jest.spyOn(inputElement, 'setCustomValidity');
            // Sets input element value to 255 characters.
            inputElement.value = 'x'.repeat(255);
            inputElement.dispatchEvent(new CustomEvent('change'));

            return Promise.resolve().then(function () {
                expect(validitySpy).toHaveBeenCalled();
            });
        });

        it(`displays an error message when the input has exceeded the max character limit of ${COUPON_INPUT_CHAR_LIMIT}.`, () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            const validitySpy = jest.spyOn(inputElement, 'setCustomValidity');
            // Sets input element value to 270 characters.
            inputElement.value = 'x'.repeat(270);
            inputElement.dispatchEvent(new CustomEvent('change'));

            return Promise.resolve().then(function () {
                expect(validitySpy).toHaveBeenCalled();
            });
        });

        it('displays an error message on input box blur if there was a prior error message', () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            const validitySpy = jest.spyOn(inputElement, 'setCustomValidity');
            // Simulate apply coupon failed
            const errorMsg = 'An unexpected error occurred. Try again later.';
            element.setCustomValidity(errorMsg);
            inputElement.dispatchEvent(new CustomEvent('blur'));

            return Promise.resolve().then(function () {
                expect(validitySpy).toHaveBeenCalledWith(errorMsg);
            });
        });

        it('has an empty value after a coupon has been successfully applied', () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            inputElement.value = '10OFF';
            // Simulate coupon applied successfully
            element.clear();

            return Promise.resolve().then(function () {
                expect(inputElement.value).toBe('');
            });
        });

        it('does not display an error message after a coupon has been successfully applied', () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            inputElement.value = '10OFF';
            const validitySpy = jest.spyOn(inputElement, 'setCustomValidity');
            // Simulate coupon applied successfully
            element.clear();

            return Promise.resolve().then(function () {
                expect(validitySpy).toHaveBeenCalledWith('');
            });
        });

        it('does not display an error message on input box blur if there was no prior error message', () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            inputElement.value = '10OFF';
            // Simulate coupon applied successfully
            element.clear();
            const validitySpy = jest.spyOn(inputElement, 'setCustomValidity');
            inputElement.dispatchEvent(new CustomEvent('blur'));

            return Promise.resolve().then(function () {
                expect(validitySpy).not.toHaveBeenCalled();
            });
        });

        it(`is focused when 'focusOnInputBox' is called`, () => {
            return Promise.resolve().then(() => {
                const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
                const focusOnSpy = jest.spyOn(inputElement, 'focus');
                element.focusOnInputBox();
                expect(focusOnSpy).toHaveBeenCalled();
            });
        });

        it(`is not present when 'showRevealCouponInputButton' is true and 'focusOnInputBox' is called`, () => {
            element.showRevealCouponInputButton = true;

            return Promise.resolve().then(() => {
                element.focusOnInputBox();
                // @ts-ignore
                expect(element.querySelector('lightning-input')).toBeNull();
            });
        });
    });

    it('the reveal coupon input button is hidden when it has been clicked', () => {
        element.showRevealCouponInputButton = true;
        return Promise.resolve()
            .then(() => {
                const addCouponBtnElement = <applyButton & HTMLElement>querySelector('button.reveal-coupon');
                addCouponBtnElement.click();
            })
            .then(() => {
                const addCouponBtnElement = element.querySelector('button.reveal-coupon');
                expect(addCouponBtnElement).toBeFalsy();
            });
    });

    describe('applyCouponToCart()', () => {
        it(`applies coupons when the button is clicked`, () => {
            // @ts-ignore
            applyCouponToCart.mockReset();
            // @ts-ignore
            applyCouponToCart.mockResolvedValueOnce();

            return Promise.resolve()
                .then(() => {
                    const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
                    inputElement.value = '10OFFCART';
                    const applyCouponBtnElement = <HTMLButtonElement>(
                        element.querySelector('commerce_unified_coupons-apply-button')
                    );

                    applyCouponBtnElement.click();
                })
                .then(() => {
                    expect(applyCouponToCart).toHaveBeenCalled();
                });
        });

        it(`clears the input field after the coupons have been successfully applied`, () => {
            // @ts-ignore
            applyCouponToCart.mockReset();
            // @ts-ignore
            applyCouponToCart.mockResolvedValueOnce();
            // @ts-ignore
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            inputElement.value = '10OFFCART';

            return Promise.resolve()
                .then(() => {
                    const applyCouponBtnElement = <HTMLButtonElement>(
                        element.querySelector('commerce_unified_coupons-apply-button')
                    );

                    applyCouponBtnElement.click();
                })
                .then(() => {
                    expect(inputElement.value).toBe('');
                });
        });

        it(`displays an error message if the coupons are not applied successfully`, () => {
            // @ts-ignore
            applyCouponToCart.mockReset();

            // @ts-ignore
            applyCouponToCart.mockRejectedValueOnce(new Error('webstoreNotFound'));

            let inputElement: HTMLInputElement;

            return Promise.resolve()
                .then(() => {
                    inputElement = <HTMLInputElement>element.querySelector('lightning-input');
                    jest.spyOn(inputElement, 'setCustomValidity');
                    inputElement.value = '10OFFCART';
                    const applyCouponBtnElement = <HTMLButtonElement>(
                        element.querySelector('commerce_unified_coupons-apply-button')
                    );

                    applyCouponBtnElement.click();
                })
                .then(() => {
                    // Verifies that a custom error has been set; we need to wait an extra microtask for rejection to be handled.
                    return (
                        Promise.resolve()
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            .then(() => {})
                            .then(() => {
                                // Verifies that a custom error has been set; we need to wait an extra couple of microtasks for rejection to be handled.
                                expect(inputElement.setCustomValidity).toHaveBeenCalled();
                            })
                    );
                });
        });
    });

    describe('the apply coupon button', () => {
        it('is disabled by default when there have been no changes to the input value', () => {
            return Promise.resolve().then(() => {
                const applyCouponBtnElement = <applyButton & HTMLElement>(
                    querySelector('commerce_unified_coupons-apply-button', element)
                );
                expect(applyCouponBtnElement.disabled).toBeTruthy();
            });
        });

        ['', '  ', '      '].forEach((emptyValue) => {
            it(`is disabled when the input value is changed to '${emptyValue}'`, () => {
                const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
                inputElement.value = emptyValue;
                inputElement.dispatchEvent(new CustomEvent('change'));

                return Promise.resolve().then(() => {
                    const applyCouponBtnElement = <HTMLButtonElement>(
                        element.querySelector('commerce_unified_coupons-apply-button')
                    );
                    expect(applyCouponBtnElement.disabled).toBeTruthy();
                });
            });
        });

        it(`is disabled when the input has 255 characters and the max character limit is ${COUPON_INPUT_CHAR_LIMIT}.`, () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            // Sets input element value to 255 characters.
            inputElement.value = 'x'.repeat(255);
            inputElement.dispatchEvent(new CustomEvent('change'));

            return Promise.resolve().then(() => {
                const applyCouponBtnElement = <HTMLButtonElement>(
                    element.querySelector('commerce_unified_coupons-apply-button')
                );
                expect(applyCouponBtnElement.disabled).toBeTruthy();
            });
        });

        it(`is disabled when the input has exceeded the max character limit of ${COUPON_INPUT_CHAR_LIMIT}.`, () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            // Sets input element value to 270 characters.
            inputElement.value = 'x'.repeat(270);
            inputElement.dispatchEvent(new CustomEvent('change'));

            return Promise.resolve().then(() => {
                // @ts-ignore
                const applyCouponBtnElement = <HTMLButtonElement>(
                    element.querySelector('commerce_unified_coupons-apply-button')
                );
                expect(applyCouponBtnElement.disabled).toBeTruthy();
            });
        });

        it(`is disabled when tne 'disableApplyButton' property is set to true`, () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            inputElement.value = '10OFF';
            inputElement.dispatchEvent(new CustomEvent('change'));
            // Simulate apply coupon is processing
            element.disable = true;

            return Promise.resolve().then(() => {
                const applyCouponBtnElement = <HTMLButtonElement>(
                    element.querySelector('commerce_unified_coupons-apply-button')
                );
                expect(applyCouponBtnElement.disabled).toBeTruthy();
                expect(element.disable).toBeTruthy();
            });
        });

        it(`is not disabled when the 'disableApplyButton' property is set to false`, () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            inputElement.value = '10OFF';
            inputElement.dispatchEvent(new CustomEvent('change'));
            // Simulate apply coupon is done processing
            element.disable = false;

            return Promise.resolve().then(() => {
                const applyCouponBtnElement = <HTMLButtonElement>(
                    element.querySelector('commerce_unified_coupons-apply-button')
                );
                expect(applyCouponBtnElement.disabled).toBeFalsy();
            });
        });

        it('is not disabled when the input value is changed to an non empty string', () => {
            const inputElement = <HTMLInputElement>element.querySelector('lightning-input');
            inputElement.value = '10OFF';
            inputElement.dispatchEvent(new CustomEvent('change'));

            return Promise.resolve().then(() => {
                const applyCouponBtnElement = <HTMLButtonElement>(
                    element.querySelector('commerce_unified_coupons-apply-button')
                );
                expect(applyCouponBtnElement.disabled).toBeFalsy();
            });
        });
    });
});
