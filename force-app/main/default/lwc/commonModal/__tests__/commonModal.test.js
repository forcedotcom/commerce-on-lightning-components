/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { createElement } from 'lwc';
import CommonModal from 'c/commonModal';

jest.mock(
    'experience/styling',
    () => ({
        generateButtonSizeClass: jest.fn(() => 'mock-size'),
        generateButtonStretchClass: jest.fn(() => 'mock-stretch'),
        generateButtonStyleClass: jest.fn(() => 'mock-style'),
        generateElementAlignmentClass: jest.fn(() => 'mock-alignment'),
    }),
    { virtual: true }
);

describe('c-common-modal', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('should create the component', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        document.body.appendChild(element);
        expect(element).toBeTruthy();
    });

    it('should render modal with all required properties', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.message = 'Test Message';
        element.primaryActionLabel = 'Submit';
        element.secondaryActionLabel = 'Cancel';

        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const header = element.shadowRoot.querySelector('lightning-modal-header');
            const footerButtons = element.modalFooter$$('c-common-button');
            const secondaryButton = footerButtons[0];
            const primaryButton = footerButtons[1];

            expect(header.label).toBe('Test Modal');
            expect(element.modalBody$().textContent).toBe('Test Message');
            expect(primaryButton.textContent).toBe('Submit');
            expect(secondaryButton.textContent).toBe('Cancel');
        });
    });

    it('should contain a primary action when button in the body when message is empty', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.primaryActionLabel = 'Submit';
        element.message = '';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const primaryButton = element.modalBody$('c-common-button');

            expect(primaryButton.textContent).toBe('Submit');
        });
    });

    it('should not show primary action when primaryActionLabel is not provided', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.secondaryActionLabel = 'Cancel';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const primaryButton = element.querySelector('c-common-button[variant="primary"]');
            expect(primaryButton).toBeNull();
        });
    });

    it('should not show secondary action when secondaryActionLabel is not provided', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.primaryActionLabel = 'Submit';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const secondaryButton = element.querySelector('c-common-button[variant="secondary"]');
            expect(secondaryButton).toBeNull();
        });
    });

    it('should close modal on primary action click when event is not prevented', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.primaryActionLabel = 'Submit';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const primaryButton = element.modalBody$('c-common-button');
            primaryButton.click();
            expect(element.closeValue).toBe('primary');
        });
    });

    it('should close modal on secondary action click when event is not prevented', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.secondaryActionLabel = 'Cancel';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const secondaryButton = element.modalBody$('c-common-button');
            secondaryButton.click();
            expect(element.closeValue).toBe('secondary');
        });
    });

    it('should not close modal on primary action click when event is prevented', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.primaryActionLabel = 'Submit';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const primaryButton = element.modalBody$('c-common-button');

            // Add event listener to prevent default
            element.addEventListener('primaryactionclick', (event) => {
                event.preventDefault();
            });
            primaryButton.click();
            expect(element.closeValue).toBeUndefined();
        });
    });

    it('should not close modal on secondary action click when event is prevented', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.secondaryActionLabel = 'Cancel';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const secondaryButton = element.modalBody$('c-common-button');
            // Add event listener to prevent default
            element.addEventListener('secondaryactionclick', (event) => {
                event.preventDefault();
            });
            secondaryButton.click();
            expect(element.closeValue).toBeUndefined();
        });
    });

    it('should close modal with custom result when provided', () => {
        const element = createElement('c-common-modal', {
            is: CommonModal,
        });
        element.label = 'Test Modal';
        element.primaryActionLabel = 'Submit';
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const primaryButton = element.modalBody$('c-common-button');

            //Add event listener to provide custom result
            element.addEventListener('primaryactionclick', (event) => {
                event.detail.close('custom-result');
                expect(element.closeValue).toBe('custom-result');
            });

            primaryButton.click();
        });
    });
});
