import { createElement } from 'lwc';
import type LightningButton from 'lightning/button';
import type LightningIcon from 'lightning/icon';
import PageLevelErrorMessage from 'commerce/pageLevelErrorMessage';

import { mockedComponentData, propertiesTestData } from './data/data';

describe('Page Level Error Message Component: commerce/pageLevelErrorMessage', () => {
    let element: HTMLElement & PageLevelErrorMessage;
    beforeEach(() => {
        element = createElement('commerce-page-level-error-message', {
            is: PageLevelErrorMessage,
        });
        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('Property values should be Deterministic', () => {
        propertiesTestData.forEach((propertyTest) => {
            describe(`the "${propertyTest.property}" property`, () => {
                it(`defaults to ${propertyTest.defaultValue}`, () => {
                    expect(element[propertyTest.property as keyof PageLevelErrorMessage]).toBe(
                        propertyTest.defaultValue
                    );
                });

                it('reflects a changed value', () => {
                    // Ensure the value isn't already set to the target value.
                    expect(element[propertyTest.property as keyof PageLevelErrorMessage]).not.toBe(
                        propertyTest.changeValue
                    );
                    // Change the value.
                    // @ts-ignore
                    element[propertyTest.property as keyof PageLevelErrorMessage] = propertyTest.changeValue;
                    // Ensure we reflect the changed value.
                    expect(element[propertyTest.property as keyof PageLevelErrorMessage]).toBe(
                        propertyTest.changeValue
                    );
                });
            });
        });
    });

    it('component should not render data', () => {
        const iconElem = element.querySelector('lightning-icon');
        const headingElem = element.querySelector('h3');
        const descElem = element.querySelector('p');
        const actionButtonElem = element.querySelector('lightning-button');
        expect(iconElem).toBeNull();
        expect(headingElem).toBeNull();
        expect(descElem).toBeNull();
        expect(actionButtonElem).toBeNull();
    });

    it('component should render data', async () => {
        element.errorIconName = mockedComponentData.errorIconName;
        element.errorIconSize = mockedComponentData.errorIconSize;
        element.errorHeading = mockedComponentData.errorHeading;
        element.errorDescription = mockedComponentData.errorDescription;
        element.errorActionLabel = mockedComponentData.errorActionLabel;
        element.errorActionVariant = mockedComponentData.errorActionVariant;
        await Promise.resolve();
        const iconElem = <LightningIcon | null>element.querySelector('lightning-icon');
        const headingElem = element.querySelector('h3');
        const descElem = element.querySelector('p');
        const actionButtonElem = <LightningButton | null>element.querySelector('lightning-button');

        expect(iconElem?.iconName).toBe(mockedComponentData.errorIconName);
        expect(iconElem?.size).toBe(mockedComponentData.errorIconSize);
        expect(iconElem?.variant).toBe('');

        expect(headingElem?.textContent).toBe(mockedComponentData.errorHeading);
        expect(descElem?.textContent).toBe(mockedComponentData.errorDescription);

        expect(actionButtonElem?.label).toBe(mockedComponentData.errorActionLabel);
        expect(actionButtonElem?.variant).toBe(mockedComponentData.errorActionVariant);
    });

    it('action click should dispatch erroractionclick event', async () => {
        const handleErrorActionClick = jest.fn();
        element.errorActionLabel = mockedComponentData.errorActionLabel;
        element.errorActionVariant = mockedComponentData.errorActionVariant;
        element.addEventListener('erroractionclick', handleErrorActionClick);
        await Promise.resolve();
        const actionButtonElem = <HTMLButtonElement | null>element.querySelector('lightning-button');
        actionButtonElem?.click();
        expect(handleErrorActionClick).toHaveBeenCalled();
    });

    it('should be accessible', async () => {
        await expect(element).toBeAccessible();
    });
});
