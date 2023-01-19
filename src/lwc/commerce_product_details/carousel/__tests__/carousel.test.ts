import { createElement } from 'lwc';
import type { ThumbnailImage } from 'commerce_product_details/gallery';
import Carousel from 'commerce_product_details/carousel';
import * as resolver from 'experience/resourceResolver';

jest.mock(
    'instrumentation/service',
    () => {
        return {
            interaction: jest.fn(),
        };
    },
    { virtual: true }
);

const SELECTION_CHANGED = 'selectionchanged';
const images: ThumbnailImage[] = [
    {
        id: '1',
        alternativeText: 'Image Alternative Text',
        url: 'https://localhost/smallUrl1',
    },
    {
        id: '2',
        alternativeText: 'Image Alternative Text',
        url: 'https://localhost/smallUrl2',
    },
    {
        id: '3',
        alternativeText: 'Image Alternative Text',
        url: 'https://localhost/smallUrl3',
    },
    {
        id: '4',
        alternativeText: 'Image Alternative Text',
        url: 'https://localhost/smallUrl4',
    },
];

describe('commerce_product_details/carousel', () => {
    let element: HTMLElement & Carousel;
    beforeEach(() => {
        element = createElement('commerce_product_details-carousel', {
            is: Carousel,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    [
        {
            property: 'images',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'pageSize',
            defaultValue: 1,
            changeValue: 2,
        },
        {
            property: 'paginate',
            defaultValue: false,
            changeValue: true,
        },
        {
            propert: 'orientation',
            defaultValue: undefined,
            changeValue: 'horizontal',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<never>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<never>propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                Reflect.set(element, <string>propertyTest.property, propertyTest.changeValue);

                // Ensure we reflect the changed value.
                expect(element[<never>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    [null, undefined, []].forEach((notShownState) => {
        it(`displays no images when no images (${JSON.stringify(notShownState)}) are provided`, () => {
            element.images = <never>notShownState;
            element.pageSize = 1;
            return Promise.resolve().then(() => {
                expect(element.querySelector('img')).toBeNull();
            });
        });
    });

    [
        {
            thumbnailImages: images,
            imagesCount: images.length,
            pageSize: 1,
            expectedImages: 1,
            previousButton: true,
            expectedPreviousButton: 'disabled',
            nextButton: false,
            expectedNextButton: 'enabled',
        },
        {
            thumbnailImages: images,
            imagesCount: images.length,
            pageSize: 2,
            expectedImages: 2,
            previousButton: true,
            expectedPreviousButton: 'disabled',
            nextButton: false,
            expectedNextButton: 'enabled',
        },
        {
            thumbnailImages: images,
            imagesCount: images.length,
            pageSize: 3,
            expectedImages: 3,
            previousButton: true,
            expectedPreviousButton: 'disabled',
            nextButton: false,
            expectedNextButton: 'enabled',
        },
        {
            thumbnailImages: images,
            imagesCount: images.length,
            pageSize: 4,
            expectedImages: 4,
            previousButton: true,
            expectedPreviousButton: 'disabled',
            nextButton: true,
            expectedNextButton: 'disabled',
        },
        {
            thumbnailImages: images.slice(0, 1),
            imagesCount: images.slice(0, 1).length,
            pageSize: 1,
            expectedImages: 1,
            previousButton: true,
            expectedPreviousButton: 'disabled',
            nextButton: true,
            expectedNextButton: 'disabled',
        },
        {
            thumbnailImages: images.slice(0, 1),
            imagesCount: images.slice(0, 1).length,
            pageSize: 1,
            expectedImages: 1,
            previousButton: true,
            expectedPreviousButton: 'disabled',
            nextButton: true,
            expectedNextButton: 'disabled',
        },
        {
            thumbnailImages: images.slice(0, 1),
            imagesCount: images.slice(0, 1).length,
            pageSize: 3,
            expectedImages: 1,
            previousButton: true,
            expectedPreviousButton: 'disabled',
            nextButton: true,
            expectedNextButton: 'disabled',
        },
        {
            thumbnailImages: images.slice(0, 1),
            imagesCount: images.slice(0, 1).length,
            pageSize: 4,
            expectedImages: 1,
            previousButton: true,
            expectedPreviousButton: 'disabled',
            nextButton: true,
            expectedNextButton: 'disabled',
        },
    ].forEach((propertyTest) => {
        describe(`when there are ${propertyTest.imagesCount} images and pageSize is set to ${propertyTest.pageSize}`, () => {
            beforeEach(() => {
                element.images = propertyTest.thumbnailImages;
                element.pageSize = propertyTest.pageSize;
                element.paginate = true;
            });

            it(`should display (${propertyTest.pageSize}) image entries per page`, () => {
                return Promise.resolve().then(() => {
                    const imageCarousel = element.querySelectorAll('button.image-container');
                    expect(imageCarousel).toHaveLength(propertyTest.expectedImages);
                });
            });

            it(`Previous button should be ${propertyTest.expectedPreviousButton}`, () => {
                return Promise.resolve().then(() => {
                    expect(element.querySelectorAll<HTMLButtonElement>('lightning-button-icon')[0].disabled).toBe(
                        propertyTest.previousButton
                    );
                });
            });

            it(`Next button should be ${propertyTest.expectedNextButton}`, () => {
                return Promise.resolve().then(() => {
                    expect(element.querySelectorAll<HTMLButtonElement>('lightning-button-icon')[1].disabled).toBe(
                        propertyTest.nextButton
                    );
                });
            });

            it('is accessible', async () => {
                await Promise.resolve();
                await expect(element).toBeAccessible();
            });
        });
    });

    describe('When the custom height and width property are set', () => {
        const spy = jest.spyOn(resolver, 'resolve');
        beforeEach(() => {
            element.pageSize = 4;
            element.paginate = true;
        });

        it('should call the resolve function with assigned height and width if the values are greater than 100', () => {
            element.style.setProperty('--com-c-carousel-image-container-height', '120px');
            element.style.setProperty('--com-c-carousel-image-container-width', '140px');
            element.images = images;
            return Promise.resolve().then(() => {
                images.forEach((thumbnail, index) => {
                    expect(spy).toHaveBeenNthCalledWith(index + 1, thumbnail.url, false, {
                        height: 120,
                        width: 140,
                    });
                });
            });
        });

        it('should call the resolve function with 100px height and width if the values are less than 100', () => {
            element.style.setProperty('--com-c-carousel-image-container-height', '80px');
            element.style.setProperty('--com-c-carousel-image-container-width', '90px');
            element.images = images;
            return Promise.resolve().then(() => {
                images.forEach((thumbnail, index) => {
                    expect(spy).toHaveBeenNthCalledWith(index + 1, thumbnail.url, false, {
                        height: 100,
                        width: 100,
                    });
                });
            });
        });
    });

    describe('When clicked, the Next button', () => {
        beforeEach(() => {
            element.images = images;
            element.pageSize = 2;
            element.paginate = true;
        });

        it('should display next set of images', () => {
            return Promise.resolve()
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child')?.click();
                })
                .then(() => {
                    const nextPageImage = element.querySelector(`img[src="${images[2].url}"]`);
                    expect(nextPageImage).toBeTruthy();
                });
        });

        it('focus should be placed on the Previous button', () => {
            const previous = element.querySelector<HTMLButtonElement>('lightning-button-icon:first-child');
            const focusOnSpy = jest.spyOn(<HTMLButtonElement>previous, 'focus');
            return Promise.resolve()
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child')?.click();
                })
                .then(() => {
                    expect(focusOnSpy).toHaveBeenCalled();
                });
        });

        it('should be disabled when on the last page of the images', () => {
            return Promise.resolve()
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child')?.click();
                })
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child')?.click();
                })
                .then(() => {
                    expect(
                        element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child')?.disabled
                    ).toBeTruthy();
                });
        });
    });

    describe('When clicked, the Previous button', () => {
        beforeEach(() => {
            element.images = images;
            element.pageSize = 2;
            element.paginate = true;
        });

        it('should display previous set of images', () => {
            return Promise.resolve()
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child')?.click();
                })
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:first-child')?.click();
                })
                .then(() => {
                    const prevPageImage = element.querySelector(`img[src="${images[0].url}"]`);
                    expect(prevPageImage).toBeTruthy();
                });
        });

        it('focus should be on next images button', () => {
            const previous = element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child');
            const focusOnSpy = jest.spyOn(<HTMLButtonElement>previous, 'focus');
            return Promise.resolve()
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child')?.click();
                })
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:first-child')?.click();
                })
                .then(() => {
                    expect(focusOnSpy).toHaveBeenCalled();
                });
        });

        it('should be disabled when on the first page of the images', () => {
            expect(
                element.querySelector<HTMLButtonElement>('lightning-button-icon:first-child')?.disabled
            ).toBeTruthy();
        });

        it('should be enabled when on the secound page of the images', () => {
            return Promise.resolve()
                .then(() => {
                    element.querySelector<HTMLButtonElement>('lightning-button-icon:last-child')?.click();
                })
                .then(() => {
                    expect(
                        element.querySelector<HTMLButtonElement>('lightning-button-icon:first-child')?.disabled
                    ).toBeFalsy();
                });
        });
    });

    describe("the 'carouseldisplayed' event", () => {
        it('is fired with the correct params on initial display', () => {
            const displayHandler = jest.fn();
            element.images = images;
            element.selectedIndex = 0;
            element.addEventListener('carouseldisplayed', displayHandler);
            return Promise.resolve().then(() => {
                expect(displayHandler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: expect.objectContaining({
                            selectedImageId: expect.stringContaining('0'),
                        }),
                    })
                );
            });
        });

        it('is fired with correct params when a thumbnail is clicked', () => {
            const displayHandler = jest.fn();
            element.images = images;
            element.selectedIndex = 0;
            element.addEventListener('carouseldisplayed', displayHandler);
            return Promise.resolve()
                .then(() => {
                    const image = element.querySelectorAll('button')[3];
                    image.click();
                })
                .then(() => {
                    expect(displayHandler).toHaveBeenCalledWith(
                        expect.objectContaining({
                            detail: expect.objectContaining({
                                selectedImageId: expect.stringContaining('3'),
                            }),
                        })
                    );
                });
        });
    });

    describe("the 'selectionchanged' event", () => {
        it('is fired when the user clicks a previously-unselected image', () => {
            element.images = images;

            const selectionHandler = jest.fn();
            element.addEventListener(SELECTION_CHANGED, selectionHandler);

            return Promise.resolve()
                .then(() => {
                    element.querySelector<HTMLButtonElement>('button')?.click();
                })
                .then(() => {
                    expect(selectionHandler).toHaveBeenCalledWith(
                        expect.objectContaining({
                            bubbles: false,
                            cancelable: false,
                            composed: false,
                        })
                    );
                });
        });

        it('is not fired when the user selects the currently-selected image', () => {
            element.images = images;

            const selectionHandler = jest.fn();

            return Promise.resolve()
                .then(() => {
                    element.querySelector<HTMLButtonElement>('button')?.click();
                })
                .then(() => {
                    element.addEventListener(SELECTION_CHANGED, selectionHandler);
                    element.querySelector<HTMLButtonElement>('button')?.click();
                })
                .then(() => {
                    expect(selectionHandler).not.toHaveBeenCalled();
                });
        });
    });

    describe("the image 'aria-selected' attribute", () => {
        beforeEach(() => {
            element.images = images;
            element.pageSize = 3;
        });

        it('is "true" on the selected image', () => {
            const clickedImage = element.querySelector<HTMLButtonElement>('button');
            clickedImage?.click();
            return Promise.resolve().then(() => {
                const selectedImage = element.querySelector("button[aria-selected='true']");
                expect(selectedImage).toBe(clickedImage);
            });
        });

        it('is "false" on non-selected images', () => {
            const clickedImage = element.querySelector<HTMLButtonElement>('button');
            clickedImage?.click();
            const unselectedImages = Array.from(element.querySelectorAll("button[aria-selected='false']"));

            // All images are initially not selected.
            expect(unselectedImages).toHaveLength(4);
        });
    });

    [null, undefined, false].forEach((noPaginationSetting) => {
        it(`does not display pagination controls when the "paginate" property is set to ${JSON.stringify(
            noPaginationSetting
        )}`, () => {
            element.paginate = <never>noPaginationSetting;

            return Promise.resolve().then(() => {
                const pageControl = element.querySelector('lightning-button-icon');
                expect(pageControl).toBeNull();
            });
        });
    });

    it('displays pagination controls when the "paginate" property is set to true', () => {
        element.paginate = true;

        return Promise.resolve().then(() => {
            const pageControls = Array.from(element.querySelectorAll('lightning-button-icon'));
            expect(pageControls).toHaveLength(2);
        });
    });

    it('displays all provided images when pagination is disabled', () => {
        element.images = images;
        element.paginate = false;
        return Promise.resolve().then(() => {
            expect(Array.from(element.querySelectorAll('li'))).toHaveLength(4);
        });
    });

    [null, undefined, '', 'unrecognized', 'horizontal'].forEach((horizontalSetting) => {
        it(`reflects a horizontal layout when the orientation property is set to ${JSON.stringify(
            horizontalSetting
        )}`, () => {
            element.paginate = true; // Easiest to notice with pagination buttons
            element.orientation = <never>horizontalSetting;
            return Promise.resolve().then(() => {
                const previousButton = element.querySelector<HTMLElement & { iconName: string }>(
                    'lightning-button-icon'
                );
                expect(previousButton?.iconName).toBe('utility:chevronleft');
            });
        });
    });

    it("reflects a vertical layout when the orientation property is set to 'vertical'", () => {
        element.paginate = true; // Easiest to notice with pagination buttons
        element.orientation = 'vertical';
        return Promise.resolve().then(() => {
            const previousButton = element.querySelector<HTMLElement & { iconName: string }>('lightning-button-icon');
            expect(previousButton?.iconName).toBe('utility:chevronup');
        });
    });
});
