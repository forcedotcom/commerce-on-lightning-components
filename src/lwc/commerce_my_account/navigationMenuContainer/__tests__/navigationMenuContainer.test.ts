import { createElement } from 'lwc';
import NavigationMenuContainer from '../navigationMenuContainer';

describe('commerce_my_account/navigationMenuContainer', () => {
    let element: HTMLElement & NavigationMenuContainer;
    type navigationMenuContainerProp = 'backgroundColor';

    beforeEach(() => {
        element = createElement('commerce_my_account-navigation-menu-container', {
            is: NavigationMenuContainer,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'backgroundColor',
            defaultValue: undefined,
            changeValue: null,
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<navigationMenuContainerProp>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<navigationMenuContainerProp>propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                element[<navigationMenuContainerProp>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<navigationMenuContainerProp>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });
});
