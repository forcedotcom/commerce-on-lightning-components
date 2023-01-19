import { createElement } from 'lwc';
import VariantSelector from '../variantSelector';
import { VARIANT_SELECTED_EVT } from '../constants';
import productVariantSelectorPlaceholderText from '@salesforce/label/Commerce_Product_Details_Variant_Selector.productVariantSelectorPlaceholderText';

const PLACEHOLDER_TEXT = 'Select...';
const ITEMS_WITH_SELECTED_OPTION = [
    {
        id: 'color',
        label: 'Color',
        options: [
            { label: 'Red', value: 'Red' },
            { label: 'Green', value: 'Green' },
            { label: 'Blue', value: 'Blue', selected: true },
            { label: 'Yellow_Orange', value: 'Yellow_Orange' },
            { label: 'Red‎‎', value: 'Red‎‎' }, // with empty character at the end
            { label: 'أحمر', value: 'أحمر' }, // Red in Arabic
        ],
        sequence: 0,
    },
    {
        id: 'size',
        label: 'Size',
        options: [
            { label: 'Small', value: 'Small' },
            { label: 'Medium', value: 'Medium', selected: true },
            { label: 'Large', value: 'Large' },
        ],
        sequence: 1,
    },
    {
        id: 'material',
        label: 'Material',
        options: [
            { label: 'Cotton', value: 'Cotton', selected: true },
            { label: 'Polyester', value: 'Polyester' },
            {
                label: '70% Polyamide, 30% Spandex',
                value: '70% Polyamide, 30% Spandex',
            },
        ],
        sequence: 2,
    },
];

const ITEMS_WITHOUT_SELECTED_OPTION = [
    {
        id: 'color',
        label: 'Color',
        options: [
            { label: 'Red', value: 'Red' },
            { label: 'Green', value: 'Green' },
            { label: 'Blue', value: 'Blue' },
            { label: 'Yellow_Orange', value: 'Yellow_Orange' },
            { label: 'Red‎‎', value: 'Red‎‎' }, // with empty character at the end
            { label: 'أحمر', value: 'أحمر' }, // Red in Arabic
        ],
        sequence: 0,
    },
    {
        id: 'size',
        label: 'Size',
        options: [
            { label: 'Small', value: 'Small' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Large', value: 'Large' },
        ],
        sequence: 1,
    },
    {
        id: 'material',
        label: 'Material',
        options: [
            { label: 'Cotton', value: 'Cotton' },
            { label: 'Polyester', value: 'Polyester' },
            {
                label: '70% Polyamide, 30% Spandex',
                value: '70% Polyamide, 30% Spandex',
            },
        ],
        sequence: 2,
    },
];

const validVariantsList = [
    // Example of a chair
    ['Red', 'Small', 'Polyester'],
    ['Red', 'Small', 'Cotton'],
    ['Red‎‎', 'Small', 'Cotton'], // Red w/ empty char
    ['أحمر', 'Small', 'Cotton'], // Red in Arabic
    ['Green', 'Small', 'Cotton'],
    ['Yellow_Orange', 'Small', '70% Polyamide, 30% Spandex'],
    ['Blue', 'Medium', 'Cotton'],
];

const variantSelectionToProductIdMap = new Map([
    [
        'Blue_Medium_Cotton',
        {
            productId: '01tR0000000maX0IAI',
            attributes: ['Blue', 'Medium', 'Cotton'],
        },
    ],
]);

/**
 * Given a select Element, returns all the disabled options
 *
 * @param {HTMLElement} selectElement
 *  The select element for which we want to get the disabled options
 * @returns {HTMLElement[]}
 *  List of <option> elements which are disabled
 */
const getDisabledSelectOptions = (selectElement: HTMLSelectElement): Element[] => {
    // @ts-ignore
    return Array.from(selectElement.querySelectorAll('option:disabled')).filter((option) => option.value);
};

describe('commerce_product_details/variantSelector: The Variant Selector Component', () => {
    let element: HTMLElement & VariantSelector;

    beforeEach(() => {
        element = createElement('commerce_product_details-variant-selector', {
            is: VariantSelector,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'headingText',
            defaultValue: undefined,
            changeValue: 'Select  options',
        },
        {
            property: 'placeholder',
            defaultValue: productVariantSelectorPlaceholderText,
            changeValue: 'Please select',
        },
        {
            property: 'variants',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'avaliableOptions',
            defaultValue: undefined,
            changeValue: null,
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

    describe('the variant selector section', () => {
        it('is accessible', async () => {
            element.variants = ITEMS_WITHOUT_SELECTED_OPTION;
            element.placeholder = PLACEHOLDER_TEXT;

            await Promise.resolve();
            await expect(element).toBeAccessible();
        });

        ['Variation', 'VariationParent'].forEach((productClass) => {
            it('displays a dropdown for each variant option', () => {
                const variants = ITEMS_WITHOUT_SELECTED_OPTION.slice(0, 2);
                element.productClass = productClass;
                element.variants = variants;
                element.selectedOptions = ['', '', ''];

                return Promise.resolve().then(() => {
                    // @ts-ignore
                    const selectElements = Array.from(element.querySelectorAll('select'));

                    expect(selectElements).toHaveLength(2);
                });
            });

            it('displays the correct options for the dropdown', () => {
                element.variants = ITEMS_WITH_SELECTED_OPTION;
                element.productClass = productClass;
                element.selectedOptions = ['Blue', 'Medium', 'Cotton'];

                return Promise.resolve().then(() => {
                    const selectElement = <HTMLSelectElement>element.querySelector('select');
                    const options = Array.from(selectElement.querySelectorAll('option'));

                    expect(options).toHaveLength(7);
                });
            });

            it('checkValidity should return false if it has missing selection', () => {
                element.variants = ITEMS_WITH_SELECTED_OPTION;
                element.validVariantsList = validVariantsList;
                element.productClass = productClass;
                element.selectedOptions = ['', '', ''];

                return Promise.resolve().then(() => {
                    expect(element.checkValidity()).toBe(false);
                });
            });

            it('checkValidity should return false if it has bad input', () => {
                element.variants = ITEMS_WITH_SELECTED_OPTION;
                element.validVariantsList = validVariantsList;
                element.productClass = productClass;
                element.selectedOptions = ['Blue', 'Small', 'Cotton'];

                return Promise.resolve().then(() => {
                    expect(element.checkValidity()).toBe(false);
                });
            });

            it('has a selected value when the options list has a selected option', () => {
                element.variants = ITEMS_WITH_SELECTED_OPTION;
                element.productClass = productClass;
                element.selectedOptions = ['Blue', '', ''];

                return Promise.resolve().then(() => {
                    // @ts-ignore
                    const selectedOption = element.querySelector("option:checked[value='Blue']");
                    expect(selectedOption).toBeTruthy();
                });
            });

            it('shows an enabled placeholder option when the options list has no selected option', () => {
                element.variants = ITEMS_WITHOUT_SELECTED_OPTION;
                element.productClass = productClass;
                element.selectedOptions = ['Blue', '', ''];
                element.placeholder = PLACEHOLDER_TEXT;

                return Promise.resolve().then(() => {
                    // @ts-ignore
                    const selectedOption = element.querySelector('option[value=""]');
                    expect(selectedOption).toBeTruthy();
                });
            });
        });
    });

    describe(` ${VARIANT_SELECTED_EVT} custom event`, () => {
        const variantOptionChangeHandler = jest.fn();

        beforeEach(() => {
            element.addEventListener(VARIANT_SELECTED_EVT, variantOptionChangeHandler);
            element.variants = ITEMS_WITH_SELECTED_OPTION;
            element.productClass = 'Variation';
            element.selectedOptions = ['Blue', 'Medium', 'Cotton'];
            element.validVariantsList = validVariantsList;
            element.variantSelectionToProductIdMap = variantSelectionToProductIdMap;
        });

        it('is fired when an option in a dropdown is changed with product name set', () => {
            const selectElement = <HTMLSelectElement>element.querySelector('select');
            return Promise.resolve()
                .then(() => {
                    selectElement.dispatchEvent(new CustomEvent('change'));
                })
                .then(() => {
                    expect(variantOptionChangeHandler).toHaveBeenCalledWith(
                        expect.objectContaining({
                            bubbles: false,
                            cancelable: false,
                            composed: false,
                            detail: {
                                productId: '01tR0000000maX0IAI',
                                isValid: true,
                                options: ['Blue', 'Medium', 'Cotton'],
                            },
                        })
                    );
                });
        });

        it('should dispatch action with valid being false if the selection is invalid', () => {
            element.selectedOptions = ['', '', ''];
            const selectElement = <HTMLSelectElement>element.querySelector('select');
            return Promise.resolve()
                .then(() => {
                    selectElement.dispatchEvent(new CustomEvent('change'));
                })
                .then(() => {
                    expect(variantOptionChangeHandler).toHaveBeenCalledWith(
                        expect.objectContaining({
                            bubbles: false,
                            cancelable: false,
                            composed: false,
                            detail: {
                                productId: undefined,
                                isValid: false,
                                options: ['', '', ''],
                            },
                        })
                    );
                });
        });
    });

    describe('disables invalid variant attribute options for parent products', () => {
        beforeEach(() => {
            element.variants = ITEMS_WITHOUT_SELECTED_OPTION;
            element.validVariantsList = validVariantsList;
            element.productClass = 'VariationParent';
            element.selectedOptions = ['', '', ''];
        });

        it('has all the options available when they exist in the valid variant list and no attribute options have been set', () => {
            const selectElement = <HTMLSelectElement>element.querySelector('select');
            return Promise.resolve()
                .then(() => {
                    selectElement.dispatchEvent(new CustomEvent('focus'));
                })
                .then(() => {
                    expect(getDisabledSelectOptions(selectElement)).toHaveLength(0);
                });
        });

        it('has those options disabled which are not available in the valid variant list and when attribute options have been partially set', () => {
            // @ts-ignore
            const selectElements = element.querySelectorAll('select');
            const colorSelectElement = selectElements[0];
            const sizeSelectElement = selectElements[1];
            const materialSelectElement = selectElements[2];
            return Promise.resolve()
                .then(() => {
                    // Set material value (i.e. sets currently selected options to ['Yellow_Orange', '', ''])
                    colorSelectElement.value = 'Yellow_Orange';
                    sizeSelectElement.value = '';
                    materialSelectElement.value = '';
                })
                .then(() => {
                    // Focus on size select element
                    sizeSelectElement.dispatchEvent(new CustomEvent('focus'));
                })
                .then(() => {
                    // Options Medium and Large should be disabled since there are no Yellow_Orange
                    // products with those sizes in the list of valid variants.
                    expect(getDisabledSelectOptions(sizeSelectElement)).toHaveLength(2);
                });
        });
    });

    describe('disables invalid variant attribute options for child products', () => {
        beforeEach(() => {
            element.variants = ITEMS_WITHOUT_SELECTED_OPTION;
            element.validVariantsList = validVariantsList;
            element.productClass = 'Variation';
            element.selectedOptions = ['Red', 'Small', 'Cotton'];
        });

        it('has those options disabled which are not available in the valid variant list', () => {
            // @ts-ignore
            const selectElements = element.querySelectorAll('select');
            const colorSelectElement = selectElements[0];
            return Promise.resolve()
                .then(() => {
                    // Focus on color select element
                    colorSelectElement.dispatchEvent(new CustomEvent('focus'));
                })
                .then(() => {
                    // Options Blue and Yellow_Orange should be disabled since ['Blue', 'Small', 'Cotton']
                    // and ['Yellow_Orange', 'Small', 'Cotton'] are not in the list of valid variants.
                    expect(getDisabledSelectOptions(colorSelectElement)).toHaveLength(2);
                });
        });

        it('has options disabled which are not available in the valid variant list after unsetting an attribute option', () => {
            // @ts-ignore
            const selectElements = element.querySelectorAll('select');
            const colorSelectElement = selectElements[0];
            const sizeSelectElement = selectElements[1];
            return Promise.resolve()
                .then(() => {
                    // Unset color selection (i.e. sets currently selected options to ['', 'Small', 'Cotton'])
                    colorSelectElement.value = '';
                })
                .then(() => {
                    // Focus on size select element again
                    sizeSelectElement.dispatchEvent(new CustomEvent('focus'));
                })
                .then(() => {
                    // Only option Large should be disabled since the color selection has
                    // been unset and there are no Cotton products with size Large.
                    expect(getDisabledSelectOptions(sizeSelectElement)).toHaveLength(1);
                });
        });
    });
});
