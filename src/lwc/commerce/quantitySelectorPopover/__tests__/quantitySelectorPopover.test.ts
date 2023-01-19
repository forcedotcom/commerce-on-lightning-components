/*
 * Copyright 2021 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 */

import { createElement } from 'lwc';
import quantitySelectorPopover from '../quantitySelectorPopover';
import type QuantitySelectorPopover from '../quantitySelectorPopover';
import type PopupSource from 'lightning/popupSource';
import type ButtonIcon from 'lightning/buttonIcon';

type QuantityPopover = HTMLElement & QuantitySelectorPopover;

const createComponentUnderTest = (): QuantityPopover => {
    const element = <QuantityPopover>createElement('commerce-quantity-selector-popover', {
        is: quantitySelectorPopover,
    });
    document.body.appendChild(element);
    return element;
};

describe('commerce/quantitySelectorPopover: Quantity Popover', () => {
    let element: QuantityPopover;

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    type QuantityPopoverProperties = 'maximumText' | 'incrementText' | 'minimumText';

    [
        {
            property: 'maximumText',
            defaultValue: undefined,
            changeValue: 'Minimum quantity is {0}',
        },
        {
            property: 'incrementText',
            defaultValue: undefined,
            changeValue: 'Increment quantity is {0}',
        },
        {
            property: 'minimumText',
            defaultValue: undefined,
            changeValue: 'Minimum quantity is {0}',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<QuantityPopoverProperties>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<QuantityPopoverProperties>propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                element[<QuantityPopoverProperties>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<QuantityPopoverProperties>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('popover opens on click of utility icon button', () => {
        const buttonIcon = <HTMLElement & ButtonIcon>element.querySelector('lightning-button-icon[slot="source"]');
        const popupSource = <HTMLElement & PopupSource>element.querySelector('lightning-popup-source');
        const spyOpen = jest.spyOn(popupSource, 'open');
        buttonIcon.click();
        return Promise.resolve().then(() => {
            expect(spyOpen).toHaveBeenCalled();
        });
    });

    it('popover displays no text on utility button click, when text is null', () => {
        const buttonIcon = <HTMLElement & ButtonIcon>element.querySelector('lightning-button-icon[slot="source"]');
        buttonIcon.click();
        return Promise.resolve().then(() => {
            const list = element.querySelectorAll('ul li');
            expect(list).toHaveLength(0);
        });
    });

    it('popover displays text on utility button click', () => {
        element.minimumText = 'Minimum quantity is {0}';
        element.maximumText = 'Max quantity is {0}';
        element.incrementText = 'Increment quantity is {0}';

        const buttonIcon = <HTMLElement & ButtonIcon>element.querySelector('lightning-button-icon[slot="source"]');
        buttonIcon.click();
        return Promise.resolve().then(() => {
            const list = element.querySelectorAll('ul li');
            expect(list).toHaveLength(3);
        });
    });

    it('popover closes on click on close button', () => {
        const buttonIcon = <HTMLElement & ButtonIcon>element.querySelector('lightning-button-icon[slot="source"]');
        buttonIcon.click();
        const popupSource = <HTMLElement & PopupSource>element.querySelector('lightning-popup-source');
        const spyClose = jest.spyOn(popupSource, 'close');
        return Promise.resolve()
            .then(() => {
                const closeBtn = <HTMLElement & ButtonIcon>element.querySelector('.close-btn');
                closeBtn.click();
            })
            .then(() => {
                expect(spyClose).toHaveBeenCalled();
            });
    });
});
