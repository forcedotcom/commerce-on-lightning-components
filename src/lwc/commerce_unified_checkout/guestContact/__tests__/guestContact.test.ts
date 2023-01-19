import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
// @ts-ignore
import GuestContact from 'commerce_unified_checkout/guestContact';
import { SessionContextAdapter } from 'commerce/contextApi';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import { CheckoutInformationAdapter, updateGuestEmail } from 'commerce/checkoutApi';
// @ts-ignore
import GuestContactDesignSubstitute from 'commerce_unified_checkout/guestContactDesignSubstitute';
import type Input from 'lightning/input';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        SessionContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('commerce/effectiveAccountApi', () => ({
    effectiveAccount: Object.defineProperty({}, 'accountId', {
        get: () => '1234566',
    }),
}));

jest.mock('commerce/checkoutApi', () => {
    return Object.assign({}, jest.requireActual('commerce/checkoutApi'), {
        updateGuestEmail: jest.fn(),
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
    });
});

const GUEST_EMAIL = 'some@user.com';

describe('commerce_unified_checkout/guestContact', () => {
    let element: HTMLElement & GuestContact;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-guest-contact', {
            is: GuestContact,
        });

        element.builderMode = false;

        // avoid assertion <lightning-input> The required label attribute value "undefined" is invalid.
        element.emailLabel = 'Email';

        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: { isLoggedIn: false },
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                contactInfo: {
                    email: GUEST_EMAIL,
                },
            },
            loaded: true,
        });

        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    describe('Checkout Guest Email Address', () => {
        it('email input is focused', () => {
            element.email = GUEST_EMAIL;
            const emailInput = <HTMLElement & Input>element.querySelector('[data-guest-email]');
            jest.spyOn(emailInput, 'focus');
            element.focus();
            expect(emailInput.focus).toHaveBeenCalled();
        });

        it('should not proceed when email is invalid', async () => {
            const emailInput = <HTMLElement & Input>element.querySelector('[data-guest-email]');
            emailInput.value = 'some&AT&user+DOT+com';
            expect.assertions(1);
            await expect(element.checkoutSave()).rejects.toBe('email not valid');
        });

        it('should pass validation for uncommon email domains', () => {
            const emailInput = <HTMLElement & Input>element.querySelector('[data-guest-email]');
            emailInput.value = 'test@osf.digital';
            expect(emailInput.checkValidity()).toBe(true);
        });
    });

    describe('checkoutSave', () => {
        it('should save guest email changes', async () => {
            const emailInput = <HTMLElement & Input>element.querySelector('[data-guest-email]');
            emailInput.value = GUEST_EMAIL;
            emailInput.checkValidity = (): boolean => true;
            emailInput.reportValidity = (): boolean => true;
            emailInput.dispatchEvent(new CustomEvent('commit'));
            await element.checkoutSave();
            expect(updateGuestEmail).toHaveBeenCalledTimes(1);
        });
    });

    describe('Readonly mode', () => {
        it('should display the default template under default conditions', async () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });
            await Promise.resolve();
            const templateEdit = <HTMLSelectElement>element.querySelector('[data-guest-contact-edit]');
            expect(templateEdit).toBeTruthy();
        });

        it('should display the readonly template under readonly conditions', async () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });
            element.readOnly = true;
            await Promise.resolve();
            const templateReadonly = <HTMLSelectElement>element.querySelector('[data-guest-contact-readonly]');
            expect(templateReadonly).toBeTruthy();
        });
    });

    it('email input commit event is handled', () => {
        const emailInput = <HTMLElement & Input>element.querySelector('[data-guest-email]');
        emailInput.value = GUEST_EMAIL;
        emailInput.dispatchEvent(new CustomEvent('commit'));
        expect(element.email).toEqual(GUEST_EMAIL);
    });
    it('should dispatch "dataready" event when email changes and valid', async () => {
        let dispatched = false;
        element.addEventListener('dataready', () => {
            dispatched = true;
        });

        await Promise.resolve();
        const emailInput = <HTMLElement & Input>element.querySelector('[data-guest-email]');
        emailInput.checkValidity = (): boolean => true;
        emailInput.value = GUEST_EMAIL;
        emailInput.dispatchEvent(new CustomEvent('commit'));
        expect(dispatched).toBe(true);
    });

    it('should show the component when showComponent is true', () => {
        // @ts-ignore
        const component = element.querySelector('[data-guest-email]');
        expect(element.showComponent).toBe(true);
        expect(component).toBeTruthy();
    });

    it('should hide the component when showComponent is false', async () => {
        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: { isLoggedIn: true },
        });
        await Promise.resolve();
        // @ts-ignore
        const component = element.querySelector('[data-guest-email]');
        expect(element.showComponent).toBe(false);
        expect(component).toBeFalsy();
    });

    it('should set all checkout modes correctly', () => {
        [CheckoutMode.FUTURE, CheckoutMode.EDIT, CheckoutMode.SUMMARY, CheckoutMode.DISABLED].forEach((mode) => {
            element.checkoutMode = mode;
            expect(element.checkoutMode).toEqual(mode);
        });
    });
    it('should set readonly when checkout mode is readonly to true', () => {
        element.checkoutMode = CheckoutMode.SUMMARY;
        expect(element.checkoutMode).toEqual(CheckoutMode.SUMMARY);
        expect(element.readOnly).toBe(true);
    });
    it('should set readonly when checkout mode isnt readonly to false', () => {
        element.checkoutMode = CheckoutMode.EDIT;
        expect(element.checkoutMode).toEqual(CheckoutMode.EDIT);
        expect(element.readOnly).toBe(false);
    });
});

describe('Guest Contact Design Substitute component', () => {
    it('should test design substitute', async () => {
        const designElement: HTMLElement & GuestContactDesignSubstitute = createElement(
            'commerce_unified_checkout-guest-contact-design-substitute',
            {
                is: GuestContactDesignSubstitute,
            }
        );
        designElement.emailLabel = 'Email';
        document.body.appendChild(designElement);
        await Promise.resolve();
        const guestContactComponent = designElement.querySelector('commerce_unified_checkout-guest-contact');
        expect(guestContactComponent.email).not.toBeNull();
        document.body.removeChild(designElement);
    });
});

describe('Set Guest Email Address From Store', () => {
    let element: HTMLElement & GuestContact;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-guest-contact', {
            is: GuestContact,
        });

        element.builderMode = false;

        // avoid assertion <lightning-input> The required label attribute value "undefined" is invalid.
        element.emailLabel = 'Email';

        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: { isLoggedIn: false },
        });

        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    it('should load email from CheckoutInformationAdapter', async () => {
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                contactInfo: {
                    email: GUEST_EMAIL,
                },
                loaded: true,
            },
        });
        await Promise.resolve();
        expect(element.email).toEqual(GUEST_EMAIL);
    });
    it('should set email to empty string if there is no email data from CheckoutInformationAdapter', async () => {
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {},
            loaded: true,
        });
        await Promise.resolve();
        expect(element.email).toBe('');
    });
});

describe('Stencil mode', () => {
    let element: HTMLElement & GuestContact;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-guest-contact', {
            is: GuestContact,
        });

        element.builderMode = false;

        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: { isLoggedIn: false },
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            loaded: false,
        });

        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    it('should display the loading stencil template while component is loading', () => {
        // @ts-ignore
        const templateStencil = element.querySelector('[data-guest-contact-stencil]');
        expect(templateStencil).toBeTruthy();
    });
});
