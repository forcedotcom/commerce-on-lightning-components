import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import NavigationMenuItemList, { MENU_ITEMS_TO_SKIP } from 'commerce_my_account/navigationMenuItemList';
import type { TestWireAdapter } from 'types/testing';
import { getNavigationMenu } from 'experience/navigationMenuApi';
import { CurrentPageReference, navigate } from 'lightning/navigation';
import * as DATA from './data/navMenuItemList.data.json';
import { querySelector, querySelectorAll } from 'kagekiri';
import type { PageReference } from 'types/common';

let exposedNavigationParams: PageReference | undefined;
jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(() => '/NewB2CStore1/s/category/products/0ZGxx00000001XB'),
        NavigationContext: jest.fn(),
        CurrentPageReference: mockCreateTestWireAdapter(),
        navigate: jest.fn((_, params) => {
            exposedNavigationParams = params;
        }),
    }),
    { virtual: true }
);

jest.mock('experience/navigationMenuApi', () =>
    Object.assign({}, jest.requireActual('experience/navigationMenuApi'), {
        getNavigationMenu: mockCreateTestWireAdapter(),
    })
);

jest.mock('../navigationMenuItemListClassGenerator.ts', () => {
    return Object.assign({}, jest.requireActual('../navigationMenuItemListClassGenerator.ts'), {
        generateVerticalPaddingClass: jest.fn(() => 'slds-p-vertical_none'),
    });
});

jest.mock('../navigationMenuItemSelector.ts', () => {
    return Object.assign({}, jest.requireActual('../navigationMenuItemSelector.ts'), {
        getMenuItemIdOfCurrentPage: jest.fn(() => '0'),
    });
});

jest.mock(
    'transport',
    () => {
        return {
            fetch: jest.fn(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () =>
                        Promise.resolve({
                            returnValue: {},
                        }),
                });
            }),
        };
    },
    { virtual: true }
);

const navMenuAdapter = <typeof getNavigationMenu & typeof TestWireAdapter>getNavigationMenu;
const currentPageRefAdapter = <typeof CurrentPageReference & typeof TestWireAdapter>CurrentPageReference;
class VerticalNavigationElement extends Element {
    public selectedItem = '';
}
class VerticalNavigationItemElement extends Element {
    public label = '';
}
describe('commerce_my_account/navigationMenuItemList', () => {
    let element: HTMLElement & NavigationMenuItemList;
    type navMenuItemListProp = 'navigationLinkSetDevName' | 'navItemSpacing';
    const { ResizeObserver } = window;

    beforeAll(() => {
        window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    });

    afterAll(() => {
        window.ResizeObserver = ResizeObserver;
    });

    beforeEach(() => {
        element = createElement('commerce_my_account-navigation-menu-item-list', {
            is: NavigationMenuItemList,
        });
        currentPageRefAdapter.emit({ state: { app: 'live' } });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'navigationLinkSetDevName',
            defaultValue: '',
            changeValue: 'valid',
        },
        {
            property: 'navItemSpacing',
            defaultValue: 'small',
            changeValue: 'none',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<navMenuItemListProp>propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<navMenuItemListProp>propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                element[<navMenuItemListProp>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<navMenuItemListProp>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    describe('wire', () => {
        describe('getNavigationMenu', () => {
            [null, undefined, {}, '', 'invalid'].forEach((menuItems) => {
                it(`should not fail if the result "data" is ${menuItems}`, () => {
                    expect(async () => {
                        navMenuAdapter.emit({ data: menuItems });
                        await Promise.resolve();
                    }).not.toThrow();
                });
            });

            [{}, null, 'invalid'].forEach((menuItems) => {
                it(`should not fail if the result "data.menuItems" is ${menuItems}`, () => {
                    expect(async () => {
                        navMenuAdapter.emit({
                            data: { menuItems: menuItems },
                        });
                        await Promise.resolve();
                    }).not.toThrow();
                });
            });

            it('should not fail if the result "data.menuItems" are valid', () => {
                expect(async () => {
                    navMenuAdapter.emit(DATA);
                    await Promise.resolve();
                }).not.toThrow();
            });

            it('should skip specific menu items', () => {
                const adapterCfg = navMenuAdapter.getLastConfig();
                expect(adapterCfg.menuItemTypesToSkip).toBe(MENU_ITEMS_TO_SKIP);
            });
        });
    });

    describe('validate vertical padding class', () => {
        it('when navItemSpacing property is set', async () => {
            navMenuAdapter.emit(DATA);
            await Promise.resolve();
            const verticalNavItemElement = querySelector('lightning-vertical-navigation-item');
            expect(verticalNavItemElement).not.toBeNull();
            expect((<HTMLElement>verticalNavItemElement).classList).toContain('slds-p-vertical_none');
        });
    });

    describe('lightning-vertical-navigation', () => {
        it('displays menu items with non empty actionValue only', async () => {
            navMenuAdapter.emit(DATA);
            await Promise.resolve();
            const expectedNoOfMenuItems = 5;

            const menuItems = querySelectorAll('lightning-vertical-navigation-item', element);
            expect(menuItems).toHaveLength(expectedNoOfMenuItems);

            const expectedLabels = [
                'Products',
                'External URL New Window',
                'All Accounts',
                'Login Site Page',
                'External URL Current Window',
            ];
            const verifyMenuItemLabel = (menuItem: Element, index: number): void => {
                expect((<VerticalNavigationItemElement>menuItem).label).toBe(expectedLabels[index]);
            };
            menuItems.forEach(verifyMenuItemLabel);
        });

        [null, ''].forEach((invalidActionValue) => {
            it(`doesn't display the menu item if actionValue for the menu items is ${invalidActionValue}`, async () => {
                const menuItems = [
                    {
                        actionType: 'InternalLink',
                        actionValue: invalidActionValue,
                        imageUrl: null,
                        label: 'Menu item with no actionable URL',
                        subMenu: [],
                        target: 'CurrentWindow',
                    },
                ];

                navMenuAdapter.emit({ data: { menuItems: menuItems } });
                await Promise.resolve();

                const verticalNavElement = querySelector('lightning-vertical-navigation');
                expect(verticalNavElement).toBeNull();
            });
        });
    });

    describe('resize', () => {
        beforeEach(async () => {
            navMenuAdapter.emit(DATA);
            await Promise.resolve();
        });

        it('should render lightning vertical navigation for desktop', () => {
            const verticalNavElement = querySelector('lightning-vertical-navigation');
            expect(verticalNavElement).not.toBeNull();
        });

        it('should have a menu item selected in lightning vertical navigation for desktop', () => {
            const verticalNavElement = <VerticalNavigationElement>querySelector('lightning-vertical-navigation');
            expect(verticalNavElement?.selectedItem).toBe('0');
        });

        it('should not render lightning combobox for desktop', () => {
            const comboboxElement = querySelector('lightning-combobox');
            expect(comboboxElement).toBeNull();
        });

        it('should render lightning combobox for mobile', async () => {
            window.matchMedia = jest.fn().mockImplementation(() => ({ matches: false }));
            window.dispatchEvent(new CustomEvent('resize'));

            await Promise.resolve();
            expect(window.matchMedia).toHaveBeenCalled();

            const comboboxElement = querySelector('lightning-combobox');
            expect(comboboxElement).not.toBeNull();
        });

        it('should not render lightning vertical navigation for mobile', async () => {
            window.matchMedia = jest.fn().mockImplementation(() => ({ matches: false }));
            window.dispatchEvent(new CustomEvent('resize'));

            await Promise.resolve();
            expect(window.matchMedia).toHaveBeenCalled();

            const verticalNavElement = querySelector('lightning-vertical-navigation');
            expect(verticalNavElement).toBeNull();
        });
    });

    describe('onselect event handler of vertical navigation', () => {
        beforeEach(async () => {
            window.matchMedia = jest.fn().mockImplementation(() => ({ matches: true }));
            navMenuAdapter.emit(DATA);
            await Promise.resolve();
        });
        it('navigates to the page associated with menu item if menu item is clicked', async () => {
            const menuItemId = '2';
            const verticalNavElement = querySelector('lightning-vertical-navigation');
            verticalNavElement?.dispatchEvent(
                new CustomEvent('select', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        name: menuItemId,
                    },
                })
            );
            await Promise.resolve();
            expect(exposedNavigationParams).toEqual({
                attributes: {
                    url: DATA.data.menuItems[menuItemId].actionValue,
                },
                type: 'standard__webPage',
            });
        });

        it('navigates to the External url on a new window if menu item with External url is clicked', async () => {
            const windowSpy = jest.spyOn(window, 'open');
            windowSpy.mockImplementation(jest.fn());

            const menuItemId = '1';
            const verticalNavElement = querySelector('lightning-vertical-navigation');
            verticalNavElement?.dispatchEvent(
                new CustomEvent('select', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        name: menuItemId,
                    },
                })
            );
            await Promise.resolve();

            expect(windowSpy).toHaveBeenCalledWith('https://salesforce.com', '_blank', 'noopener,noreferrer');
        });

        it('navigates to the External url on the same window if menu item with External url and target as CurrentWindow is clicked', async () => {
            const windowSpy = jest.spyOn(window, 'open');
            windowSpy.mockImplementation(jest.fn());

            const menuItemId = '4';
            const verticalNavElement = querySelector('lightning-vertical-navigation');
            verticalNavElement?.dispatchEvent(
                new CustomEvent('select', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        name: menuItemId,
                    },
                })
            );
            await Promise.resolve();

            expect(windowSpy).toHaveBeenCalledWith('https://salesforce.com', '_self', 'noopener,noreferrer');
        });

        [null, undefined, ''].forEach((menuItem) => {
            it(`does not navigate to any page if menu item id is ${menuItem}`, async () => {
                const verticalNavElement = querySelector('lightning-vertical-navigation');
                verticalNavElement?.dispatchEvent(
                    new CustomEvent('select', {
                        composed: false,
                        bubbles: false,
                        detail: {
                            name: menuItem,
                        },
                    })
                );
                await Promise.resolve();
                expect(navigate).not.toHaveBeenCalled();
            });
        });
        [null, undefined, []].forEach((menuItems) => {
            it(`does not navigate to any page if menu items are ${menuItems}`, async () => {
                navMenuAdapter.emit({
                    data: { menuItems: menuItems },
                });
                await Promise.resolve();
                const verticalNavElement = querySelector('lightning-vertical-navigation');
                verticalNavElement?.dispatchEvent(
                    new CustomEvent('select', {
                        composed: false,
                        bubbles: false,
                        detail: {
                            name: '0',
                        },
                    })
                );
                await Promise.resolve();
                expect(navigate).not.toHaveBeenCalled();
            });
        });
    });

    describe('onchange event handler of combobox', () => {
        beforeEach(async () => {
            window.matchMedia = jest.fn().mockImplementation(() => ({ matches: false }));
            navMenuAdapter.emit(DATA);
            await Promise.resolve();
        });
        it('navigates to the page associated with menu item if menu item is clicked', async () => {
            const menuItemId = '2';
            const combobox = querySelector('lightning-combobox');
            combobox?.dispatchEvent(
                new CustomEvent('change', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        value: menuItemId,
                    },
                })
            );
            await Promise.resolve();
            expect(exposedNavigationParams).toEqual({
                attributes: {
                    url: DATA.data.menuItems[menuItemId].actionValue,
                },
                type: 'standard__webPage',
            });
        });
        it('navigates to the External url on a new window if menu item with External url is clicked', async () => {
            const windowSpy = jest.spyOn(window, 'open');
            windowSpy.mockImplementation(jest.fn());

            const menuItemId = '1';
            const combobox = querySelector('lightning-combobox');
            combobox?.dispatchEvent(
                new CustomEvent('change', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        value: menuItemId,
                    },
                })
            );
            await Promise.resolve();

            expect(windowSpy).toHaveBeenCalledWith('https://salesforce.com', '_blank', 'noopener,noreferrer');
        });

        it('navigates to the External url on the same window if menu item with External url and target as CurrentWindow is clicked', async () => {
            const windowSpy = jest.spyOn(window, 'open');
            windowSpy.mockImplementation(jest.fn());

            const menuItemId = '4';
            const combobox = querySelector('lightning-combobox');
            combobox?.dispatchEvent(
                new CustomEvent('change', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        value: menuItemId,
                    },
                })
            );
            await Promise.resolve();

            expect(windowSpy).toHaveBeenCalledWith('https://salesforce.com', '_self', 'noopener,noreferrer');
        });

        [null, undefined, ''].forEach((menuItem) => {
            it(`does not navigate to any page if menu item id is ${menuItem}`, async () => {
                const combobox = querySelector('lightning-combobox');
                combobox?.dispatchEvent(
                    new CustomEvent('change', {
                        composed: false,
                        bubbles: false,
                        detail: {
                            value: menuItem,
                        },
                    })
                );
                await Promise.resolve();
                expect(navigate).not.toHaveBeenCalled();
            });
        });
        [null, undefined, []].forEach((menuItems) => {
            it(`does not navigate to any page if menu items are ${menuItems}`, async () => {
                navMenuAdapter.emit({
                    data: { menuItems: menuItems },
                });
                await Promise.resolve();
                const combobox = querySelector('lightning-combobox');
                combobox?.dispatchEvent(
                    new CustomEvent('change', {
                        composed: false,
                        bubbles: false,
                        detail: {
                            value: '0',
                        },
                    })
                );
                await Promise.resolve();
                expect(navigate).not.toHaveBeenCalled();
            });
        });
    });
});
