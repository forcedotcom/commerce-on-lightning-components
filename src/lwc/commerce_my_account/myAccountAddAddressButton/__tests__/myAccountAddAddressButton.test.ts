import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import type { TestWireAdapter } from 'types/testing';
import { navigate } from 'lightning/navigation';
import { NavigationContext } from 'lightning/navigation';
import MyAccountAddAddressButton from 'commerce_my_account/myAccountAddAddressButton';
import { SessionContextAdapter } from 'commerce/contextApi';
jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => 'Address_Form'),
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
}));

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        SessionContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock(
    'lightning/navigation',
    () => ({
        navigate: jest.fn(),
        NavigationContext: mockCreateTestWireAdapter(),
        CurrentPageReference: mockCreateTestWireAdapter(),
    }),
    { virtual: true }
);

const sessionContextAdapter = <typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter;

describe('My Account Add Address Button', () => {
    let element: HTMLButtonElement & MyAccountAddAddressButton;

    beforeEach(() => {
        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({});

        element = createElement('commerce_my_account-my-account-add-address-button', {
            is: MyAccountAddAddressButton,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });
    it('displays the correct button text when the text property is set', () => {
        const text = 'Test Button Text';
        element.text = text;

        return Promise.resolve().then(() => {
            const myAccountAddAddressButton = <HTMLButtonElement>element.querySelector('button');
            expect(myAccountAddAddressButton.textContent).toBe(text);
        });
    });

    it('triggers navigation on click', () => {
        const myAccountAddAddressButton = <HTMLButtonElement>element.querySelector('button');
        myAccountAddAddressButton.click();

        expect(navigate).toHaveBeenCalledWith(undefined, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Address_Form',
            },
        });
    });

    it('disabled should be false when accountAddressManger user perm is true', () => {
        jest.mock('@salesforce/userPermission/AccountAddressManager', () => ({ __esModule: true, default: true }), {
            virtual: true,
        });
        sessionContextAdapter.emit({ data: { isPreview: false } });
        return Promise.resolve().then(() => {
            const myAccountAddAddressButton = <HTMLButtonElement>element.querySelector('button');
            expect(myAccountAddAddressButton.disabled).toBe(false);
        });
    });

    it('should be accessible', async () => {
        element.text = 'Test button';
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
