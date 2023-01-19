import { createElement } from 'lwc';
import FieldDisplay from 'commerce/fieldDisplay';

const createComponentUnderTest = (): HTMLElement & FieldDisplay => {
    const element: HTMLElement & FieldDisplay = createElement('commerce-field-display', {
        is: FieldDisplay,
    });
    document.body.appendChild(element);
    return element;
};

describe('commerce/fieldDisplay: Field Display', () => {
    let element: HTMLElement & FieldDisplay;

    afterEach(() => {
        document.body.removeChild(element);
    });

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    [
        {
            type: undefined,
            value: 'Unknown type',
            renderingComponent: 'lightning-formatted-rich-text',
        },
        {
            type: null,
            value: 'Null type',
            renderingComponent: 'lightning-formatted-rich-text',
        },
        {
            type: '',
            value: 'Empty type',
            renderingComponent: 'lightning-formatted-rich-text',
        },
        {
            type: 'UNKNOWN',
            value: 'Unknown type',
            renderingComponent: 'lightning-formatted-rich-text',
        },
        {
            type: 'CURRENCY',
            value: '123',
            currencyCode: 'USD',
            renderingComponent: 'commerce-formatted-price',
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
            type: 'DATE/TIME',
            value: '2020-05-06T12:51:58.000Z',
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
            type: 'NUMBER',
            value: '123',
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
            type: 'ADDRESS',
            value: {
                street: 'Sample street',
                city: 'Sample city',
                state: 'Sample state',
                country: 'India',
                postalCode: '500081',
                latitude: 17.4525706,
                longitude0: 78.3797961,
            },
            renderingComponent: 'lightning-formatted-address',
        },
        {
            type: 'GEOLOCATION',
            value: {
                latitude: 17.4525706,
                longitude: 78.3797961,
            },
            renderingComponent: 'lightning-formatted-location',
        },
        {
            type: 'CHECKBOX',
            value: true,
            renderingComponent: 'lightning-icon',
        },
        {
            type: 'BOOLEAN',
            value: true,
            renderingComponent: 'lightning-icon',
        },
    ].forEach((param) => {
        describe(`Field type "${param.type}"`, () => {
            beforeEach(() => {
                element.value = param.value;
                element.type = param.type;
            });

            it(`renders with the component ${param.renderingComponent}`, async () => {
                await Promise.resolve();
                expect((<HTMLElement>element)?.querySelector(param.renderingComponent)).toBeTruthy();
            });

            it(`renders only one base component`, async () => {
                await Promise.resolve();
                expect((<HTMLElement>element)?.children).toHaveLength(1);
            });

            it('should be accessible', async () => {
                await Promise.resolve();
                await expect(element).toBeAccessible();
            });
        });
    });

    ['CHECKBOX', 'BOOLEAN'].forEach((type) => {
        [true, 'true'].forEach((value) => {
            it(`displays a the "view mode checked" icon when a ${type} field type is assigned a "true" value (${JSON.stringify(
                value
            )})`, () => {
                element.value = value;
                element.type = type;

                return Promise.resolve().then(() => {
                    //@ts-ignore
                    expect((<HTMLElement>element)?.querySelector('lightning-icon')?.iconName).toBe('utility:check');
                });
            });
        });

        [false, 'false', null, undefined, ''].forEach((value) => {
            it(`displays a the "view mode unchecked" icon when a ${type} field type is assigned a "false" value (${JSON.stringify(
                value
            )})`, () => {
                element.value = value;
                element.type = type;

                return Promise.resolve().then(() => {
                    //@ts-ignore
                    expect((<HTMLElement>element)?.querySelector('lightning-icon')?.iconName).toBe('utility:steps');
                });
            });
        });
    });
});
