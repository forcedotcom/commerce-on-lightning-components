import { createElement } from 'lwc';
import VariantAttributesDisplay from 'commerce_product_information/variantAttributesDisplay';
import type { Attribute } from 'commerce_product_information/variantAttributesDisplay';

const attribute: Attribute[] = [{ name: 'Size', value: 'XL' }];

describe('commerce_product_information/variantAttributesDisplay: Variant Attributes Display', () => {
    let element: HTMLElement & VariantAttributesDisplay;
    beforeEach(() => {
        element = createElement('commerce_product_information-variant-attributes-display', {
            is: VariantAttributesDisplay,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'attributes',
            defaultValue: undefined,
            changeValue: attribute,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof VariantAttributesDisplay]).toBe(
                    propertyTest.defaultValue
                );
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof VariantAttributesDisplay]).not.toBe(
                    propertyTest.changeValue
                );
                // Change the value.
                //@ts-ignore
                element[propertyTest.property as keyof VariantAttributesDisplay] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof VariantAttributesDisplay]).toStrictEqual(
                    propertyTest.changeValue
                );
            });
        });
    });

    it(`displays the list of attributes when they are provided`, () => {
        (<Attribute[]>element.attributes) = attribute;
        return Promise.resolve().then(() => {
            expect((<HTMLElement>element).querySelectorAll('ul')).toHaveLength(1);
        });
    });

    [undefined, []].forEach((notShownState) => {
        it(`displays nothing when no attribute is provided (${notShownState})`, () => {
            (<Attribute[] | undefined>element.attributes) = notShownState;
            return Promise.resolve().then(() => {
                expect((<HTMLElement>element).querySelectorAll('ul')).toHaveLength(0);
            });
        });
    });
});
