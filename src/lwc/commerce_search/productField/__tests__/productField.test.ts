import { createElement } from 'lwc';
import ProductField, { generateClassForSize } from 'commerce_search/productField';

const createComponentUnderTest = (): HTMLElement & ProductField => {
    const element: HTMLElement & ProductField = createElement('commerce_search-product-field', {
        is: ProductField,
    });
    document.body.appendChild(element);
    return element;
};

const nextTick = Promise.resolve();

describe('commerce_search/productfield: ProductField', () => {
    let element: HTMLElement & ProductField;

    afterEach(() => {
        document.body.removeChild(element);
    });

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    describe('checking getTabindex', () => {
        [
            {
                tabStoppable: true,
                result: {
                    tabIndex: 0,
                },
            },
            {
                tabStoppable: false,
                result: {
                    tabIndex: -1,
                },
            },
        ].forEach((param) => {
            it(`${param.tabStoppable ? 'is ' : 'is not'} tab stoppable 
                    when tabStoppable is set to ${param.tabStoppable}`, () => {
                element.displayData = {
                    tabStoppable: param.tabStoppable,
                    name: '',
                    label: '',
                    value: '',
                };

                return Promise.resolve().then(() => {
                    const tabStoppableElement = element.querySelector('div');
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    expect(tabStoppableElement!.tabIndex).toBe(param.result.tabIndex);
                });
            });
        });
    });

    describe('component rendering', () => {
        [
            {
                type: 'CURRENCY',
                value: '123',
                renderingComponent: 'lightning-formatted-number',
            },
            {
                type: 'DATE',
                value: '1547250828000',
                renderingComponent: 'lightning-formatted-date-time',
            },
            {
                type: 'DATETIME',
                value: '1547250828000',
                renderingComponent: 'lightning-formatted-date-time',
            },
            {
                type: 'DOUBLE',
                value: '99999.8',
                renderingComponent: 'lightning-formatted-number',
            },
            {
                type: 'EMAIL',
                value: 'name@domain.com',
                renderingComponent: 'lightning-formatted-email',
            },
            {
                type: 'INTEGER',
                value: '456',
                renderingComponent: 'lightning-formatted-number',
            },
            {
                type: 'PERCENT',
                value: '100',
                renderingComponent: 'lightning-formatted-number',
            },
            {
                type: 'PHONE',
                value: '18006676389',
                renderingComponent: 'lightning-formatted-phone',
            },
            {
                type: 'STRING',
                value: 'String value here!',
                renderingComponent: 'lightning-formatted-rich-text',
            },
            {
                type: 'BOLD_STRING',
                value: 'String value here!',
                renderingComponent: 'lightning-formatted-rich-text',
            },
            {
                type: 'TEXTAREA',
                value: 'Textarea value here!',
                renderingComponent: 'lightning-formatted-rich-text',
            },
            {
                type: 'TIME',
                value: '22:12:30.999Z',
                renderingComponent: 'lightning-formatted-time',
            },
            {
                type: 'URL',
                value: 'https://my/path',
                renderingComponent: 'lightning-formatted-url',
            },
            {
                type: 'VARIATION',
                value: 'Color: Blue, Size: Large, Material: Polyester',
                renderingComponent: 'lightning-formatted-rich-text',
            },
        ].forEach((param) => {
            it(`renders the type ${param.type} with the component ${param.renderingComponent}`, () => {
                element.displayData = {
                    value: param.value,
                    type: param.type,
                    name: '',
                    label: '',
                };

                element.configuration = {
                    showLabel: false,
                };

                return Promise.resolve().then(() => {
                    expect(element.querySelector(param.renderingComponent)).toBeTruthy();
                });
            });
        });

        [
            {
                showLabel: false,
                label: '',
                renderLabel: false,
            },
            {
                showLabel: false,
                label: 'Label here!',
                renderLabel: false,
            },
            {
                showLabel: true,
                label: '',
                renderLabel: false,
            },
            {
                showLabel: true,
                label: 'Label here!',
                renderLabel: true,
            },
        ].forEach((param) => {
            it(`${param.renderLabel ? 'shown' : 'is not shown'} the label
                when 
                    the field label ${param.label ? 'is not' : 'is'} empty and 
                    showLabel is ${param.showLabel ? 'true' : 'false'}`, () => {
                element.displayData = {
                    label: param.label,
                    value: '12345',
                    type: 'INTEGER',
                    name: '',
                };

                element.configuration = {
                    showLabel: param.showLabel,
                };

                return Promise.resolve().then(() => {
                    const labelRendered = !!element.querySelector('lightning-formatted-rich-text');
                    expect(labelRendered).toBe(param.renderLabel);
                });
            });
        });

        it('should not add truncate class for the type VARIATION', async () => {
            element.displayData = {
                label: 'Product Description',
                value: 'Color: Blue, Size: Large, Material: Polyester',
                type: 'VARIATION',
                name: '',
            };

            element.configuration = {
                showLabel: true,
            };

            await nextTick;
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            const hasTruncateClass = element.querySelector('div')!.classList.contains('slds-truncate');
            expect(hasTruncateClass).toBe(false);
        });
    });

    it('should decode HTML brackets and quotes for the value of the product field', () => {
        element.displayData = {
            value: '&lt;b&gt;&quot;Bolded text&quot;&lt;/b&gt;',
            type: 'STRING',
            name: '',
            label: '',
        };

        element.configuration = {
            showLabel: true,
        };

        return Promise.resolve().then(() => {
            const fieldValue = <HTMLTextAreaElement>element.querySelector('lightning-formatted-rich-text');
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            expect(fieldValue!.value).toBe('<b>"Bolded text"</b>');
        });
    });
});

describe('commerce_search/productfield: generateClassForSize', () => {
    [
        undefined,
        '',
        'Small', // Case-sensitive matches - we're strict.
        'SMALL',
        "you'll never catch me!",
    ].forEach((unrecognizedSize) => {
        it(`returns undefined when provided an unrecognized size of ${JSON.stringify(unrecognizedSize)}`, () => {
            const cssClass = generateClassForSize(unrecognizedSize);

            expect(cssClass).toBeUndefined();
        });
    });

    [
        {
            size: 'small',
            cssClass: 'slds-text-heading_small',
        },
        {
            size: 'medium',
            cssClass: 'slds-text-heading_medium',
        },
        {
            size: 'large',
            cssClass: 'slds-text-heading_large',
        },
    ].forEach((supportedSize) => {
        it(`returns the SLDS CSS class "${supportedSize.cssClass}" when given a size of "${supportedSize.size}"`, () => {
            const cssClass = generateClassForSize(supportedSize.size);

            expect(cssClass).toBe(supportedSize.cssClass);
        });
    });
});
