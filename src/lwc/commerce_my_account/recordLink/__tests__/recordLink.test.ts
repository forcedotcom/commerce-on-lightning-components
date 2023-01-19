import type { TestWireAdapter } from 'types/testing';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { NavigationContext } from 'lightning/navigation';
import { createElement } from 'lwc';
import RecordLink from 'commerce_my_account/recordLink';
import { navigate } from 'lightning/navigation';

const mockGeneratedUrl = '/b2c/s/detail/01txx0000006i45AAA';

jest.mock('lightning/navigation', () => ({
    navigate: jest.fn(),
    generateUrl: jest.fn(() => mockGeneratedUrl),
    NavigationContext: mockCreateTestWireAdapter(),
}));

describe('commerce_my_account-record-link: Redirects to record detail page when a field is clicked', () => {
    let element: HTMLElement & RecordLink;

    beforeEach(async () => {
        element = createElement('commerce_my_account-record-link', {
            is: RecordLink,
        });
        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
            test: 'test',
        });

        await document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'label',
            defaultValue: undefined,
            changeValue: 'View Details',
        },
        {
            property: 'recordId',
            defaultValue: '',
            changeValue: '01txx0000006i45AAA',
        },
        {
            property: 'objectApiName',
            defaultValue: undefined,
            changeValue: null,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect.assertions(1);
                expect(element[propertyTest.property as keyof RecordLink]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof RecordLink]).not.toBe(propertyTest.changeValue);

                // Change the value.
                //@ts-ignore
                element[propertyTest.property as keyof RecordLink] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof RecordLink]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', async () => {
        element.recordId = '01txx0000006i45AAA';
        element.label = 'Account';
        element.objectApiName = 'Account';
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    it('navigates to the detail page when user clicks on the label', async () => {
        element.recordId = '01txx0000006i45AAA';
        element.label = 'Account';
        element.objectApiName = 'Account';
        expect.assertions(3);
        return Promise.resolve().then(() => {
            expect(navigate).not.toHaveBeenCalled();
            (<HTMLAnchorElement>element.querySelector('a')).click();
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(
                { test: 'test' },
                {
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: '01txx0000006i45AAA',
                        objectApiName: 'Account',
                        actionName: 'view',
                    },
                }
            );
        });
    });

    ['', undefined].forEach((recordId) => {
        it(`displays a spinner if no record ID (${recordId}) is provided`, async () => {
            element.recordId = recordId;
            await Promise.resolve();
            const spinner = (<HTMLElement>element).querySelector('lightning-spinner');
            expect(spinner).toBeTruthy();
        });
    });

    it('has a link to the detail page', async () => {
        element.recordId = '01txx0000006i45AAA';
        element.label = 'Account';
        element.objectApiName = 'Account';
        const settled = new Promise((resolve) => {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(resolve, 0);
        });
        await settled;
        const resolvedAnchor = element.querySelector('a[href="/b2c/s/detail/01txx0000006i45AAA"]');
        expect(resolvedAnchor).not.toBeNull();
    });
});
