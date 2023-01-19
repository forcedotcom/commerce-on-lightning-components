import { createElement } from 'lwc';
import UserProfileMenu, { MENU_ITEMS_TO_SKIP } from 'commerce_builder/userProfileMenu';
import type { TestWireAdapter } from 'types/testing';
import { getNavigationMenu } from 'experience/navigationMenuApi';
import * as DATA from './data/userProfileMenu.data.json';
import * as SessionContextData from './data/sessionContextApater.data.json';
import { getRecord } from 'lightning/uiRecordApi';
import MockResizeObserver from './ResizeObserver';
import { navigate, NavigationContext } from 'lightning/navigation';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { querySelector } from 'kagekiri';
import { effectiveAccount } from 'commerce/effectiveAccountApi';

const navMenuAdapter = <typeof getNavigationMenu & typeof TestWireAdapter>getNavigationMenu;

const URL = '/NewB2CStore1/s/category/products/0ZGxx00000001XB';

jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(() => '/NewB2CStore1/s/category/products/0ZGxx00000001XB'),
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        NavigationContext: require('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        navigate: jest.fn(),
    }),
    { virtual: true }
);

jest.mock('experience/navigationMenuApi', () =>
    Object.assign({}, jest.requireActual('experience/navigationMenuApi'), {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        getNavigationMenu: require('@salesforce/wire-service-jest-util').createTestWireAdapter(),
    })
);

jest.mock('lightning/uiRecordApi', () => ({
    getFieldValue: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    getRecord: require('@salesforce/wire-service-jest-util').createTestWireAdapter(),
}));

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        SessionContextAdapter: require('@salesforce/wire-service-jest-util').createTestWireAdapter(),
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        AppContextAdapter: require('@salesforce/wire-service-jest-util').createTestWireAdapter(),
    })
);

Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation(() => ({})),
});

Object.defineProperty(window, 'location', {
    writable: true,
    value: {
        assign: jest.fn(),
    },
});

describe('commerce_builder/userProfileMenu', () => {
    let element: HTMLElement & UserProfileMenu;
    beforeAll(() => {
        MockResizeObserver.mock([{ contentRect: { width: 767 } }]);
    });

    afterAll(() => {
        MockResizeObserver.restore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_builder-user-profile-menu', {
            is: UserProfileMenu,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });
    [
        {
            property: 'loginLinkText',
            defaultValue: undefined,
            changeValue: 'Sign In',
        },
        {
            property: 'loginLinkTextColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'loginLinkTextHoverColor',
            defaultValue: undefined,
            changeValue: '#454545',
        },
        {
            property: 'loginLinkTextOrientation',
            defaultValue: undefined,
            changeValue: 'leftOfIcon',
        },
        {
            property: 'loginLinkTextDecoration',
            defaultValue: undefined,
            changeValue: "{'underline':true}",
        },
        {
            property: 'menuStyle',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'includeCompanyName',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'iconStyle',
            defaultValue: undefined,
            changeValue: 'UserIcon',
        },
        {
            property: 'userNameTextOrientation',
            defaultValue: undefined,
            changeValue: 'leftOfIcon',
        },
        {
            property: 'userProfileMenuNavigationMenuEditor',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'logOutLabel',
            defaultValue: undefined,
            changeValue: 'Log Out',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof UserProfileMenu]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof UserProfileMenu]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof UserProfileMenu] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof UserProfileMenu]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('navigates to the login page when login button is clicked', async () => {
        const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({});
        userProfileMenuUi.dispatchEvent(
            new CustomEvent('userlogin', {
                composed: false,
                bubbles: false,
            })
        );
        await Promise.resolve();
        expect(navigate).toHaveBeenCalledWith(
            {},
            {
                attributes: {
                    name: 'Login',
                },
                type: 'comm__namedPage',
            }
        );
    });

    describe('onselect event handler of user profile menu Items', () => {
        beforeEach(async () => {
            navMenuAdapter.emit(DATA);
            element.logOutLabel = 'Log Out';
            await Promise.resolve();
        });
        it('navigates to the page associated with menu item if menu item is clicked', async () => {
            const menuItemId = '2';
            const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
            (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({});
            userProfileMenuUi.dispatchEvent(
                new CustomEvent('navigatetopage', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        id: menuItemId,
                    },
                })
            );
            await Promise.resolve();
            expect(navigate).toHaveBeenCalledWith(
                {},
                {
                    attributes: {
                        url: DATA.data.menuItems[menuItemId].actionValue,
                    },
                    type: 'standard__webPage',
                }
            );
        });

        it('navigates to the External url on a new window if menu item with External url is clicked', async () => {
            const windowSpy = jest.spyOn(window, 'open');
            windowSpy.mockImplementation(jest.fn());

            const menuItemId = '1';
            const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
            userProfileMenuUi.dispatchEvent(
                new CustomEvent('navigatetopage', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        id: menuItemId,
                    },
                })
            );
            await Promise.resolve();

            expect(windowSpy).toHaveBeenCalledWith('https://salesforce.com', '_blank', 'nofollow,noopener,noreferrer');
        });

        it('navigates to the External url on the same window if menu item with External url and target as CurrentWindow is clicked', async () => {
            const windowSpy = jest.spyOn(window, 'open');
            windowSpy.mockImplementation(jest.fn());

            const menuItemId = '4';
            const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
            userProfileMenuUi.dispatchEvent(
                new CustomEvent('navigatetopage', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        id: menuItemId,
                    },
                })
            );
            await Promise.resolve();

            expect(windowSpy).toHaveBeenCalledWith('https://salesforce.com', '_self', 'nofollow,noopener,noreferrer');
        });

        it('navigates to the account switcher model if menu item with Modal Type is clicked', async () => {
            const menuItemId = '6';
            const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
            userProfileMenuUi.dispatchEvent(
                new CustomEvent('navigatetopage', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        id: menuItemId,
                    },
                })
            );
            await Promise.resolve();
            await Promise.resolve();
            const accountSwitcherModal = querySelector('lightning-modal');
            expect(accountSwitcherModal).toBeTruthy();
        });

        it('navigates to home & update effective account id in session on account selects in account switcher model', async () => {
            const accountSelectEventData = {
                detail: {
                    accountId: '001RM000004Y1nxYAD',
                },
            };
            const menuItemId = '6';
            const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
            userProfileMenuUi.dispatchEvent(
                new CustomEvent('navigatetopage', {
                    composed: false,
                    bubbles: false,
                    detail: {
                        id: menuItemId,
                    },
                })
            );
            await Promise.resolve();
            await Promise.resolve();
            const accountSwitcherModal = querySelector('lightning-modal');
            expect(accountSwitcherModal).toBeTruthy();
            accountSwitcherModal?.dispatchEvent(new CustomEvent('accountselect', accountSelectEventData));
            await Promise.resolve();
            expect(effectiveAccount.accountId).toBe(accountSelectEventData.detail.accountId);
            expect(window.location.assign).toHaveBeenCalledWith(URL);
        });

        [
            { testRequirement: 'when logOutUrl param was set', logoutUrl: '/testLogoutUrl' },
            { testRequirement: 'when context is empty' },
        ].forEach(({ testRequirement, logoutUrl }) => {
            it(`should navigate to current page when event with logout dispatched - ${testRequirement}`, async () => {
                (<typeof AppContextAdapter & typeof TestWireAdapter>AppContextAdapter).emit({
                    data: logoutUrl ? { logoutUrl } : null,
                });
                const windowSpy = jest.spyOn(window, 'open');
                windowSpy.mockImplementation(jest.fn());

                const menuItemId = '7';
                const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
                userProfileMenuUi.dispatchEvent(
                    new CustomEvent('navigatetopage', {
                        composed: false,
                        bubbles: false,
                        detail: {
                            id: menuItemId,
                        },
                    })
                );
                await Promise.resolve();
                if (!logoutUrl) {
                    expect(windowSpy).toHaveBeenCalledWith('', '_self', 'nofollow,noopener,noreferrer');
                } else {
                    expect(windowSpy).toHaveBeenCalledWith(logoutUrl, '_self', 'nofollow,noopener,noreferrer');
                }
            });
        });

        [null, undefined, ''].forEach((menuItem) => {
            it(`does not navigate to any page if menu item id is ${menuItem}`, async () => {
                const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
                userProfileMenuUi.dispatchEvent(
                    new CustomEvent('navigatetopage', {
                        composed: false,
                        bubbles: false,
                        detail: {
                            id: menuItem,
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
                const userProfileMenuUi = <HTMLElement>querySelector('commerce_my_account-user-profile-menu');
                userProfileMenuUi.dispatchEvent(
                    new CustomEvent('navigatetopage', {
                        composed: false,
                        bubbles: false,
                        detail: {
                            id: '0',
                        },
                    })
                );
                await Promise.resolve();
                expect(navigate).not.toHaveBeenCalled();
            });
        });
    });

    describe('wire', () => {
        describe('getNavigationMenu', () => {
            [null, undefined, {}, '', 'invalid'].forEach((data) => {
                it(`should not fail if the result "data" is ${data}`, () => {
                    expect(() => {
                        navMenuAdapter.emit(data);
                    }).not.toThrow();
                });
            });

            it('should not fail if the result "data.menuItems" are valid', () => {
                expect(() => {
                    navMenuAdapter.emit(DATA);
                }).not.toThrow();
            });

            it('should skip specific menu items', () => {
                const adapterCfg = navMenuAdapter.getLastConfig();
                expect(adapterCfg.menuItemTypesToSkip).toBe(MENU_ITEMS_TO_SKIP);
            });
        });
    });

    const getRecordAdapter = <typeof getRecord & typeof TestWireAdapter>getRecord;

    describe('fetching account id', () => {
        it(`should not fail if getRecord returns valid data`, () => {
            element.includeCompanyName = true;
            expect(() => {
                getRecordAdapter.emit({
                    data: { AccountId: '123456' },
                });
            }).not.toThrow();
        });
    });

    const sessionContextAdapter = <typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter;

    describe('context', () => {
        it(`should set context data`, () => {
            expect(() => {
                sessionContextAdapter.emit(SessionContextData);
            }).not.toThrow();
        });
        it('should set fallback for context data', () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: null,
            });

            expect(<HTMLElement>querySelector('.slds-dropdown-trigger', element)).toBeTruthy();
        });
    });
});
