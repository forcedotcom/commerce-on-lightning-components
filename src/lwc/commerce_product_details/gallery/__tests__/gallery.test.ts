import { createElement } from 'lwc';
import type LightningDialog from 'types/lightning-dialog';
import type Carousel from 'commerce_product_details/carousel';
import type GalleryImage from 'commerce_product_details/galleryImage';
import type HorizontalScroller from 'commerce_product_details/horizontalScroller';
import type { ProductImage } from '../types';
import Gallery from '../gallery';

// Mock the labels with known values.
jest.mock('../labels', () => ({
    lightBoxImageAssistiveText: '{0}. Click to expand image',
    lightBoxImageNoAssistiveText: 'Click to expand image',
}));

const productImages: ProductImage[] = [
    {
        id: '1',
        alternativeText: 'Image1 Alternative Text',
        fullUrl: './image1/fullUrl',
        smallUrl: './image1/smallUrl',
    },
    {
        id: '2',
        alternativeText: 'Image2 Alternative Text',
        fullUrl: './image2/fullUrl',
        smallUrl: './image2/smallUrl',
    },
    {
        id: '3',
        alternativeText: null,
        fullUrl: './image2/fullUrl',
        smallUrl: './image2/smallUrl',
    },
    {
        id: '4',
        alternativeText: null,
        fullUrl: './image2/fullUrl',
        smallUrl: './image2/smallUrl',
    },
];

describe('commerce_product_details/gallery', () => {
    let element: HTMLElement & Gallery;

    beforeEach(() => {
        element = createElement('commerce-gallery', {
            is: Gallery,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'carouselPageSize',
            defaultValue: 1,
            changeValue: 5,
        },
        {
            property: 'carouselPosition',
            defaultValue: undefined,
            changeValue: 'bottom',
        },
        {
            property: 'images',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'showCarousel',
            defaultValue: false,
            changeValue: true,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
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

    describe('the image carousel', () => {
        [undefined, false, null].forEach((notShownState) => {
            it(`is not displayed when the 'showCarousel' property is set to ${notShownState}`, () => {
                element.showCarousel = <never>notShownState;
                return Promise.resolve().then(() => {
                    const carouselSelector = element.querySelector('commerce_product_details-carousel');
                    expect(carouselSelector).toBeFalsy();
                });
            });
        });

        it("is displayed when the 'showCarousel' property is set to 'true'", () => {
            element.showCarousel = true;
            element.images = productImages;
            return Promise.resolve().then(() => {
                const carouselSelector = element.querySelector('commerce_product_details-carousel');
                expect(carouselSelector).toBeTruthy();
            });
        });

        it('is accessible', async () => {
            element.showCarousel = true;
            element.images = productImages;

            await Promise.resolve();
            await expect(element).toBeAccessible();
        });
    });

    describe('the showcased image', () => {
        it('is initially the first image provided', () => {
            element.images = productImages;

            return Promise.resolve().then(() => {
                const mainImage = element.querySelector<HTMLElement & GalleryImage>(
                    'commerce_product_details-gallery-image'
                );
                expect(mainImage?.url).toBe(`${productImages[0].fullUrl}`);
            });
        });

        it('has alternative text incorporating the image alternative text and an interactive description when the gallery is expandable and the image has alternative text', () => {
            element.images = productImages;
            element.expandable = true;

            // We pick the first image as a representative case.
            return Promise.resolve().then(() => {
                const galleryImage = element.querySelector<HTMLElement & GalleryImage>(
                    'commerce_product_details-gallery-image'
                );
                expect(galleryImage?.alternativeText).toBe('Image1 Alternative Text. Click to expand image');
            });
        });

        it('is accessible', () => {
            element.images = productImages;
            element.expandable = true;

            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });

        [null, undefined, ''].forEach((emptyAlternativeText) => {
            it(`has alternative text indicating the image is interactive when no image alternative text (${JSON.stringify(
                emptyAlternativeText
            )}) is provided and the gallery is expandable`, () => {
                const imagesWithEmptyAltText = productImages.map((productImage) =>
                    Object.assign({}, productImage, {
                        alternativeText: emptyAlternativeText,
                    })
                );
                element.images = imagesWithEmptyAltText;
                element.expandable = true;

                return Promise.resolve().then(() => {
                    const galleryImage = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-gallery-image'
                    );
                    expect(galleryImage?.alternativeText).toBe('Click to expand image');
                });
            });
        });

        it('has the alternative text of the image when the image has alternative text and the gallery is not expandable', () => {
            element.images = productImages;
            element.expandable = false;

            // We pick the first image as a representative case.
            return Promise.resolve().then(() => {
                const galleryImage = element.querySelector<HTMLElement & GalleryImage>(
                    'commerce_product_details-gallery-image'
                );
                expect(galleryImage?.alternativeText).toBe('Image1 Alternative Text');
            });
        });

        [null, undefined, ''].forEach((emptyAlternativeText) => {
            it(`has an empty alternative text description when the image has no alternative text (${JSON.stringify(
                emptyAlternativeText
            )}) and the gallery is not expandable`, () => {
                const imagesWithEmptyAltText = productImages.map((productImage) =>
                    Object.assign({}, productImage, {
                        alternativeText: emptyAlternativeText,
                    })
                );
                element.images = imagesWithEmptyAltText;
                element.expandable = false;

                return Promise.resolve().then(() => {
                    const galleryImage = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-gallery-image'
                    );
                    expect(galleryImage?.alternativeText).toBe('');
                });
            });
        });

        it('is updated to match the image selected in the (desktop) image carousel', () => {
            element.showCarousel = true;
            element.images = productImages;

            return Promise.resolve()
                .then(() => {
                    // Select an image.
                    const carouselSelector = <HTMLElement & Carousel>(
                        element.querySelector('commerce_product_details-carousel')
                    );
                    carouselSelector.selectedIndex = 1;
                    carouselSelector.dispatchEvent(
                        new CustomEvent('selectionchanged', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                })
                .then(() => {
                    // The selected image should be displayed.
                    const galleryImage = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-gallery-image'
                    );
                    expect(galleryImage?.url).toBe(`${productImages[1].fullUrl}`);
                });
        });

        it('is updated to match the image selected in the (desktop) lightbox', () => {
            element.showCarousel = true;
            element.images = productImages;
            element.expandable = true;

            return Promise.resolve()
                .then(() => {
                    // Open the lightbox / display our components.
                    const imageSliderDesktop = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-gallery-image'
                    );
                    imageSliderDesktop?.dispatchEvent(
                        new CustomEvent('selected', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                })
                .then(() => {
                    // Select an image from the lightbox.
                    const carouselSelector = <HTMLElement & Carousel>(
                        element.querySelector('.image-lightbox commerce_product_details-carousel')
                    );
                    carouselSelector.selectedIndex = 1;
                    carouselSelector?.dispatchEvent(
                        new CustomEvent('selectionchanged', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                })
                .then(() => {
                    // The selected image should be displayed.
                    const galleryImage = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-gallery-image'
                    );
                    expect(galleryImage?.url).toBe(`${productImages[1].fullUrl}`);
                });
        });

        it('is updated to match the next image in the (mobile) image slider when next button is clicked', () => {
            element.showCarousel = true;
            element.images = productImages;

            return Promise.resolve()
                .then(() => {
                    // Select an image.
                    const imageSliderSelector = element.querySelector<HTMLElement & HorizontalScroller>(
                        'commerce_product_details-horizontal-scroller'
                    );
                    imageSliderSelector?.dispatchEvent(
                        new CustomEvent('shownext', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                })
                .then(() => {
                    // The selected image should be displayed.
                    const mainImage = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-horizontal-scroller commerce_product_details-gallery-image'
                    );
                    expect(mainImage?.url).toBe(`${productImages[1].fullUrl}`);
                });
        });

        it('is updated to match the initial image in the image slider when the next button is clicked, followed by the previous button', () => {
            element.showCarousel = true;
            element.images = productImages;

            return Promise.resolve()
                .then(() => {
                    // Select an image.
                    const imageSliderSelector = element.querySelector<HTMLElement & HorizontalScroller>(
                        'commerce_product_details-horizontal-scroller'
                    );
                    imageSliderSelector?.dispatchEvent(
                        new CustomEvent('shownext', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                    imageSliderSelector?.dispatchEvent(
                        new CustomEvent('showprevious', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                })
                .then(() => {
                    // The selected image should be displayed.
                    const mainImage = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-horizontal-scroller commerce_product_details-gallery-image'
                    );
                    expect(mainImage?.url).toBe(`${productImages[0].fullUrl}`);
                });
        });

        it('is updated to match the previous image in the (mobile) image slider when previous button is clicked', () => {
            element.showCarousel = true;
            element.images = productImages;

            return Promise.resolve()
                .then(() => {
                    // Select an image.
                    const imageSliderSelector = element.querySelector<HTMLElement & HorizontalScroller>(
                        'commerce_product_details-horizontal-scroller'
                    );
                    imageSliderSelector?.dispatchEvent(
                        new CustomEvent('showprevious', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                })
                .then(() => {
                    // The selected image should be displayed.
                    const mainImage = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-horizontal-scroller commerce_product_details-gallery-image'
                    );
                    expect(mainImage?.url).toBe(`${productImages[3].fullUrl}`);
                });
        });

        it('opens the lightbox when the gallery is expandable and the (desktop) image is selected', () => {
            const modalElement = <HTMLElement & LightningDialog>element.querySelector('lightning-dialog');
            const modalOpenedSpy = jest.spyOn(modalElement, 'showModal');

            // Show the image so that we can click it.
            element.images = productImages;
            element.showCarousel = true;
            element.expandable = true;

            return Promise.resolve()
                .then(() => {
                    // Select an image.
                    const imageSliderDesktop = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-gallery-image'
                    );
                    imageSliderDesktop?.dispatchEvent(
                        new CustomEvent('selected', {
                            bubbles: false,
                            composed: false,
                            detail: {
                                imageItemId: productImages[1].id,
                            },
                        })
                    );
                })
                .then(() => {
                    // We should hve seen the 'opened' event, indicating the modal opened.
                    expect(modalOpenedSpy).toHaveBeenCalled();
                });
        });

        it('opens the lightbox when the gallery is expandable and the (mobile) image is selected', () => {
            const modalElement = <HTMLElement & LightningDialog>element.querySelector('lightning-dialog');
            const modalOpenedSpy = jest.spyOn(modalElement, 'showModal');

            // Show the image so that we can click it.
            element.images = productImages;
            element.showCarousel = true;
            element.expandable = true;

            return Promise.resolve()
                .then(() => {
                    // Select an image.
                    const imageSliderMobile = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-horizontal-scroller commerce_product_details-gallery-image'
                    );
                    imageSliderMobile?.dispatchEvent(
                        new CustomEvent('selected', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                })
                .then(() => {
                    // We should hve seen the 'opened' event, indicating the modal opened.
                    expect(modalOpenedSpy).toHaveBeenCalled();
                });
        });

        it('does not open the lightbox when the gallery is not expandable and the (desktop) image is selected', () => {
            const modalElement = <HTMLElement & LightningDialog>element.querySelector('lightning-dialog');
            const modalOpenedSpy = jest.spyOn(modalElement, 'showModal');

            // Show the image so that we can click it.
            element.images = productImages;
            element.showCarousel = true;
            element.expandable = false;

            return Promise.resolve()
                .then(() => {
                    // Select an image.
                    const imageSliderDesktop = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-gallery-image'
                    );
                    imageSliderDesktop?.dispatchEvent(
                        new CustomEvent('selected', {
                            bubbles: false,
                            composed: false,
                            detail: {
                                imageItemId: productImages[1].id,
                            },
                        })
                    );
                })
                .then(() => {
                    // We should hve seen the 'opened' event, indicating the modal opened.
                    expect(modalOpenedSpy).not.toHaveBeenCalled();
                });
        });

        it('does not open the lightbox when the gallery is not expandable and the (mobile) image is selected', () => {
            const modalElement = <HTMLElement & LightningDialog>element.querySelector('lightning-dialog');
            const modalOpenedSpy = jest.spyOn(modalElement, 'showModal');

            // Show the image so that we can click it.
            element.images = productImages;
            element.showCarousel = true;
            element.expandable = false;

            return Promise.resolve()
                .then(() => {
                    // Select an image.
                    const imageSliderMobile = element.querySelector<HTMLElement & GalleryImage>(
                        'commerce_product_details-horizontal-scroller commerce_product_details-gallery-image'
                    );
                    imageSliderMobile?.dispatchEvent(
                        new CustomEvent('selected', {
                            bubbles: false,
                            composed: false,
                        })
                    );
                })
                .then(() => {
                    // We should hve seen the 'opened' event, indicating the modal opened.
                    expect(modalOpenedSpy).not.toHaveBeenCalled();
                });
        });
    });

    describe("the 'carouselPosition' property", () => {
        [null, undefined, 'below', '', 'invalid gibberish'].forEach((belowSetting) => {
            it(`places the desktop carousel below the showcased image when carouselPosition is set to '${JSON.stringify(
                belowSetting
            )}'`, () => {
                element.showCarousel = true;
                element.carouselPosition = <never>belowSetting;
                element.images = productImages;
                return Promise.resolve().then(() => {
                    const carouselSelector = element.querySelector('.carousel-below');
                    expect(carouselSelector).toBeTruthy();
                });
            });
        });

        it("places the desktop carousel above the showcased image when carouselPosition is set to 'above'", () => {
            element.showCarousel = true;
            element.carouselPosition = 'above';
            element.images = productImages;
            return Promise.resolve().then(() => {
                const carouselSelector = element.querySelector('.carousel-above');
                expect(carouselSelector).toBeTruthy();
            });
        });

        it("places the desktop carousel before the showcased image when carouselPosition is set to 'before'", () => {
            element.showCarousel = true;
            element.carouselPosition = 'before';
            element.images = productImages;
            return Promise.resolve().then(() => {
                const carouselSelector = element.querySelector('.carousel-before');
                expect(carouselSelector).toBeTruthy();
            });
        });

        it("places the desktop carousel after the showcased image when carouselPosition is set to 'after'", () => {
            element.showCarousel = true;
            element.carouselPosition = 'after';
            element.images = productImages;
            return Promise.resolve().then(() => {
                const carouselSelector = element.querySelector('.carousel-after');
                expect(carouselSelector).toBeTruthy();
            });
        });

        [null, undefined, 'above', 'below', '', 'invalid gibberish'].forEach((horizontalSetting) => {
            it(`orients the desktop carousel horizontally when carouselPosition is set to '${JSON.stringify(
                horizontalSetting
            )}'`, () => {
                element.showCarousel = true;
                element.carouselPosition = <never>horizontalSetting;
                element.images = productImages;
                return Promise.resolve().then(() => {
                    const carouselSelector = element.querySelector<HTMLElement & Carousel>(
                        '.desktop-featured-image-carousel'
                    );
                    expect(carouselSelector?.orientation).toBe('horizontal');
                });
            });
        });

        ['after', 'before'].forEach((verticalSetting: string) => {
            it(`orients the desktop carousel vertically when carouselPosition is set to '${JSON.stringify(
                verticalSetting
            )}'`, () => {
                element.showCarousel = true;
                element.carouselPosition = <'after' | 'before'>verticalSetting;
                element.images = productImages;
                return Promise.resolve().then(() => {
                    const carouselSelector = element.querySelector<HTMLElement & Carousel>(
                        '.desktop-featured-image-carousel'
                    );
                    expect(carouselSelector?.orientation).toBe('vertical');
                });
            });
        });
    });
});
