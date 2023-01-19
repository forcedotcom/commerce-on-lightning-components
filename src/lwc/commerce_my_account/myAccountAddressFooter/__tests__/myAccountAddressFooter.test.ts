import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MyAccountAddressFooter from 'commerce_my_account/myAccountAddressFooter';
import { querySelector } from 'kagekiri';
import type { PageReference } from 'types/common';
import { deleteMyAccountAddress } from 'commerce/myAccountApi';

let exposedNavigationParams: PageReference | undefined;
function mockedMyAccountAddress404Response(): object {
    return {
        error: [
            {
                errorCode: 'ITEM_NOT_FOUND',
                message: "You can't perform this operation.",
            },
        ],
    };
}
jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);
jest.mock(
    'lightning/navigation',
    () => ({
        navigate: jest.fn((_, params) => {
            exposedNavigationParams = params;
        }),
        NavigationContext: mockCreateTestWireAdapter(),
        CurrentPageReference: mockCreateTestWireAdapter(),
    }),
    { virtual: true }
);
jest.mock('commerce/myAccountApi', () => {
    return Object.assign({}, jest.requireActual('commerce/myAccountApi'), {
        deleteMyAccountAddress: jest.fn(),
        MyAccountAddressDetailAdapter: mockCreateTestWireAdapter(),
    });
});

describe('commerce_my_account/MyAccountAddressCard: MyAccountAddressCard', () => {
    let element: MyAccountAddressFooter & HTMLElement;
    type addressFooter = 'editLabel' | 'deleteLabel';

    beforeEach(() => {
        element = createElement('commerce_my_account-my-account-address-footer', {
            is: MyAccountAddressFooter,
        });
        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'editLabel',
            defaultValue: undefined,
            changeValue: 'Edit',
        },
        {
            property: 'deleteLabel',
            defaultValue: undefined,
            changeValue: 'Delete',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<addressFooter>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<addressFooter>propertyTest.property]).not.toBe(propertyTest.changeValue);
                // Change the value.
                element[<addressFooter>propertyTest.property] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[<addressFooter>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });
    describe('handle address navigation', () => {
        it('triggers navigation on edit', () => {
            const editLink = <HTMLButtonElement>querySelector('[data-edit-address]');
            editLink.click();

            expect(exposedNavigationParams).toEqual({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Address_Form',
                },
                state: {
                    addressId: element.addressId,
                },
            });
        });
        it('triggers modal on delete', async () => {
            (deleteMyAccountAddress as jest.Mock).mockImplementation(() => {
                return Promise.reject(mockedMyAccountAddress404Response());
            });
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

            const modalElement = <HTMLDialogElement>element.querySelector('lightning-dialog');
            // eslint-disable-next-line
            const modalOpenedSpy = jest.spyOn(modalElement as any, 'showModal');
            // eslint-disable-next-line
            const modalClosedSpy = jest.spyOn(modalElement as any, 'close');

            const deleteLink = <HTMLButtonElement>querySelector('[data-delete-address]');
            deleteLink.click();
            await Promise.resolve();
            expect(modalOpenedSpy).toHaveBeenCalled();

            const cancelButton = <HTMLButtonElement>querySelector('lightning-dialog .slds-button_neutral');
            cancelButton.click();
            await Promise.resolve();
            expect(modalClosedSpy).toHaveBeenCalled();

            deleteLink.click();
            await Promise.resolve();
            const deleteButton = <HTMLButtonElement>querySelector('lightning-dialog .slds-button_brand');
            deleteButton.click();
            await Promise.resolve();
            expect(deleteMyAccountAddress).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalled();
            expect(modalClosedSpy).toHaveBeenCalled();
        });
        it('triggers modal on delete and successful delete happens', async () => {
            (deleteMyAccountAddress as jest.Mock).mockImplementation(() => {
                return Promise.resolve({});
            });
            const deleteLink = <HTMLButtonElement>querySelector('[data-delete-address]');
            deleteLink.click();
            await Promise.resolve();
            const deleteButton = <HTMLButtonElement>querySelector('lightning-dialog .slds-button_brand');
            deleteButton.click();
            await Promise.resolve();
            expect(deleteMyAccountAddress).toHaveBeenCalled();
        });
    });
});
