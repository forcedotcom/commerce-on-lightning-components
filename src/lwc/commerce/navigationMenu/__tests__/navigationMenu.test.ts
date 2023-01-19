import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MatchMediaMock from 'jest-matchmedia-mock';
import { getNavigationMenu } from 'experience/navigationMenuApi';
import { getAppContext, InternalContextAdapter } from 'commerce/context';
import type { TestWireAdapter } from 'types/testing';
import { navigate } from 'lightning/navigation';
import NavigationMenu, { MENU_ITEMS_TO_SKIP } from '../navigationMenu';
import { apiData } from './data/navigationMenu.test.data';
import { registerSa11yMatcher } from '@sa11y/jest';
import { querySelector } from 'kagekiri';

jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(() => ''),
        NavigationContext: jest.fn(),
        navigate: jest.fn(),
    }),
    { virtual: true }
);

jest.mock('commerce/context', () =>
    Object.assign({}, jest.requireActual('commerce/context'), {
        InternalContextAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock('experience/navigationMenuApi', () =>
    Object.assign({}, jest.requireActual('experience/navigationMenuApi'), {
        getNavigationMenu: mockCreateTestWireAdapter(),
    })
);

jest.mock(
    'instrumentation/service',
    () => {
        return {
            interaction: jest.fn(),
        };
    },
    { virtual: true }
);

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

jest.mock('@salesforce/community/Id', () => 'mockCommunityId', { virtual: true });

const internalContextAdapter = <typeof InternalContextAdapter & typeof TestWireAdapter>InternalContextAdapter;
const navMenuAdapter = <typeof getNavigationMenu & typeof TestWireAdapter>getNavigationMenu;

describe('commerce/navigationMenu', () => {
    let element: NavigationMenu & HTMLElement;
    let matchMedia: MatchMediaMock;

    beforeAll(() => {
        registerSa11yMatcher();
        matchMedia = new MatchMediaMock();
    });

    afterAll(() => {
        matchMedia.destroy();
    });

    beforeEach(async () => {
        element = createElement('commerce-navigation-menu', {
            is: NavigationMenu,
        });
        internalContextAdapter.emit({
            data: {
                urlPathPrefix: '/1109Capricorn/s',
            },
        });

        document.body.appendChild(element);
        await getAppContext();
    });

    describe('showHomeLink', () => {
        it('should have a default value', () => {
            expect(element.showHomeLink).toBeTruthy();
        });
        it('should set the visibility of the home link', () => {
            element.showHomeLink = false;
            expect(element.showHomeLink).toBeFalsy();
        });
        ['invalid', 1, 1.5, NaN, {}, []].forEach((val) => {
            it(`should ensure a valid state (truthy) in case of invalid input data '${val}'`, () => {
                element.showHomeLink = <never>val;
                expect(element.showHomeLink).toBeTruthy();
            });
        });
        [null, undefined].forEach((val) => {
            it(`should ensure a valid state (falsy) in case of invalid input data '${val}'`, () => {
                element.showHomeLink = <never>val;
                expect(element.showHomeLink).toBeFalsy();
            });
        });
    });

    describe('showBackLabel', () => {
        it('should have a default value', () => {
            expect(element.showBackLabel).toBeTruthy();
        });
        it('should set the visibility of the back label', () => {
            element.showBackLabel = false;
            expect(element.showBackLabel).toBeFalsy();
        });
        ['invalid', 1, 1.5, NaN, {}, []].forEach((val) => {
            it(`should ensure a valid state (truthy) in case of invalid input data '${val}'`, () => {
                element.showBackLabel = <never>val;
                expect(element.showBackLabel).toBeTruthy();
            });
        });
        [null, undefined].forEach((val) => {
            it(`should ensure a valid state (falsy) in case of invalid input data '${val}'`, () => {
                element.showBackLabel = <never>val;
                expect(element.showBackLabel).toBeFalsy();
            });
        });
    });

    describe('navigationMenuEditor', () => {
        it('should have a default value', () => {
            expect(element.navigationMenuEditor).toBe('');
        });
        it('should set the visibility of the home link', () => {
            const editorData = '{editor: {}}';
            element.navigationMenuEditor = editorData;
            expect(element.navigationMenuEditor).toEqual(editorData);
        });
        [null, undefined, NaN, []].forEach((val) => {
            it(`should ensure a valid state in case of invalid input data '${val}'`, () => {
                element.navigationMenuEditor = <never>val;
                expect(element.navigationMenuEditor).toBe('');
            });
        });
    });

    describe('alignment', () => {
        [null, undefined, 'invalid', 1, 1.5, NaN, {}, []].forEach((val) => {
            it(`should ensure a valid state in case of invalid input data '${val}'`, () => {
                element.alignment = <never>val;
                expect(element.alignment).toBe('left');
            });
        });

        ['left', 'center', 'right'].forEach((val) => {
            it(`should accept valid input data '${val}'`, () => {
                element.alignment = <never>val;
                expect(element.alignment).toBe(val);
            });
        });
    });

    describe('getNavigationMenu', () => {
        it('should not fail if the result "data" is not set', () => {
            expect(async () => {
                navMenuAdapter.emit({});
                await Promise.resolve();
            }).not.toThrow();
        });

        it('should not fail if the result "data" is "null"', () => {
            expect(async () => {
                navMenuAdapter.emit({ data: null });
                await Promise.resolve();
            }).not.toThrow();
        });

        it('should not fail if the result "data" is invalid', () => {
            expect(async () => {
                navMenuAdapter.emit({
                    data: 'invalid',
                });
                await Promise.resolve();
            }).not.toThrow();
        });

        it('should not fail if the result "data.menuItems" are not set', () => {
            expect(async () => {
                navMenuAdapter.emit({ data: {} });
                await Promise.resolve();
            }).not.toThrow();
        });

        it('should not fail if the result "data.menuItems" are "null"', () => {
            expect(async () => {
                navMenuAdapter.emit({
                    data: { menuItems: null },
                });
                await Promise.resolve();
            }).not.toThrow();
        });

        it('should not fail if the result "data.menuItems" are invalid', () => {
            expect(async () => {
                navMenuAdapter.emit({
                    data: { menuItems: 'invalid' },
                });
                await Promise.resolve();
            }).not.toThrow();
        });

        it('should skip specific menu items', () => {
            const adapterCfg = navMenuAdapter.getLastConfig();
            expect(adapterCfg.menuItemTypesToSkip).toBe(MENU_ITEMS_TO_SKIP);
        });

        it('should request home link', () => {
            const adapterCfg = navMenuAdapter.getLastConfig();
            expect(adapterCfg.addHomeMenuItem).toBeTruthy();
        });

        it('should not include image url', () => {
            const adapterCfg = navMenuAdapter.getLastConfig();
            expect(adapterCfg.includeImageUrl).toBeFalsy();
        });
    });

    describe('a11y', () => {
        it('should fulfill accessibility standards', async () => {
            navMenuAdapter.emit({ data: apiData });
            await Promise.resolve();
            await expect(element).toBeAccessible();
        });
    });

    describe('handleNavigateToPage', () => {
        const dispatchNavigateEvent = (href: string | null, type?: string, target?: string): void => {
            querySelector('commerce-drilldown-navigation')?.dispatchEvent(
                new CustomEvent('navigatetopage', {
                    detail: { href, type, target },
                })
            );
        };
        it('should do nothing when menu item does not exist in map', () => {
            dispatchNavigateEvent(null);
            expect(navigate).not.toHaveBeenCalled();
        });
        it('should navigate to page', async () => {
            navMenuAdapter.emit({ data: apiData });
            await Promise.resolve();

            dispatchNavigateEvent('/category/beans/0ZGxx000000003H', 'InternalLink');

            expect(navigate).toHaveBeenCalledWith(undefined, {
                type: 'standard__webPage',
                attributes: {
                    url: '/category/beans/0ZGxx000000003H',
                },
            });
        });
        it('should handle urlPathPrefix and navigate to page', async () => {
            navMenuAdapter.emit({ data: apiData });
            await Promise.resolve();

            dispatchNavigateEvent('/1109Capricorn/s/category/beans/0ZGxx000000003H', 'InternalLink');

            expect(navigate).toHaveBeenCalledWith(undefined, {
                type: 'standard__webPage',
                attributes: {
                    url: '/category/beans/0ZGxx000000003H',
                },
            });
        });
        it('should do nothing with href when urlPathPrefix is empty and navigate to page', async () => {
            navMenuAdapter.emit({ data: apiData });
            internalContextAdapter.emit({
                data: {},
            });
            await Promise.resolve();

            dispatchNavigateEvent('/1109Capricorn/s/category/beans/0ZGxx000000003H', 'InternalLink');

            expect(navigate).toHaveBeenCalledWith(undefined, {
                type: 'standard__webPage',
                attributes: {
                    url: '/1109Capricorn/s/category/beans/0ZGxx000000003H',
                },
            });
        });
        it('should call window.open when type is External', async () => {
            const windowSpy = jest.spyOn(window, 'open');
            windowSpy.mockImplementation(jest.fn());

            navMenuAdapter.emit({ data: apiData });
            await Promise.resolve();

            dispatchNavigateEvent('www.salesforce.com', 'ExternalLink', '_blank');

            expect(windowSpy).toHaveBeenCalledWith('www.salesforce.com', '_blank', 'noopener,noreferrer');
        });
    });
});
