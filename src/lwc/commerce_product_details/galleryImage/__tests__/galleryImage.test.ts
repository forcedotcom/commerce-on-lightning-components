import { createElement } from 'lwc';
import GalleryImage from '../galleryImage';

describe('commerce_product_details/galleryImage : Gallery Image', () => {
    let element: HTMLElement & GalleryImage;

    beforeEach(() => {
        element = createElement('commerce_product_details-gallery-image', {
            is: GalleryImage,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'alternativeText',
            defaultValue: undefined,
            changeValue: 'image alt text',
        },
        {
            property: 'selectable',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'url',
            defaultValue: undefined,
            changeValue: '/img.svg',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                // @ts-ignore
                expect(element[propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    [null, undefined, false].forEach((nonSelectableSetting) => {
        it(`displays a non-selectable image when the selected property is set to ${JSON.stringify(
            nonSelectableSetting
        )}`, () => {
            // @ts-ignore
            element.selectable = nonSelectableSetting;

            return Promise.resolve().then(() => {
                // @ts-ignore
                const buttonElement = element.querySelector('button');
                expect(buttonElement).toBeNull();
            });
        });
    });

    it('is accessible', () => {
        element.selectable = true;
        element.alternativeText = 'cool product';
        element.url = 'product.svg';

        return Promise.resolve().then(async () => {
            await expect(element).toBeAccessible();
        });
    });

    it('displays a selectable image when the selected property is set to true', () => {
        element.selectable = true;

        return Promise.resolve().then(() => {
            // @ts-ignore
            const buttonElement = element.querySelector('button');
            expect(buttonElement).toBeTruthy();
        });
    });

    it('emits the "selected" event when the user selects the image', () => {
        element.selectable = true;
        const selectedHandler = jest.fn();
        element.addEventListener('selected', selectedHandler);

        return Promise.resolve()
            .then(() => {
                const buttonElement = <HTMLButtonElement>element.querySelector('button');
                buttonElement.click();
            })
            .then(() => {
                expect(selectedHandler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        bubbles: false,
                        cancelable: false,
                        composed: false,
                    })
                );
            });
    });
});
