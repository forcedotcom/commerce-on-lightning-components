import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { getNavigationMenu } from 'experience/navigationMenuApi';
import { getAppContext, InternalContextAdapter } from 'commerce/context';
import type { TestWireAdapter } from 'types/testing';
import DrilldownNavigation from '../drilldownNavigation';
import { apiData } from './data/transformation.test.data';
import { querySelector } from 'kagekiri';

jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(() => ''),
        NavigationContext: jest.fn(),
        navigate: jest.fn(),
        CurrentPageReference: mockCreateTestWireAdapter(),
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

describe('commerce/drilldownNavigation', () => {
    let element: DrilldownNavigation & HTMLElement;

    const { ResizeObserver } = window;

    beforeAll(() => {
        window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    });

    afterAll(() => {
        window.ResizeObserver = ResizeObserver;
    });

    beforeEach(async () => {
        element = createElement('commerce-drilldown-navigation', {
            is: DrilldownNavigation,
        });
        internalContextAdapter.emit({
            data: {
                urlPathPrefix: '/1109Capricorn/s',
            },
        });

        document.body.appendChild(element);
        await getAppContext();
    });

    afterEach(() => {
        document.body.removeChild(element);
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

    describe('showAppLauncher', () => {
        it('should set a boolean value', () => {
            element.showAppLauncher = true;
            expect(element.showAppLauncher).toBeTruthy();
            element.showAppLauncher = false;
            expect(element.showAppLauncher).toBeFalsy();
        });
    });

    describe('menuItems', () => {
        it('should set menuItems data', () => {
            element.menuItems = apiData.menuItems;
            expect(element.menuItems).toEqual(apiData.menuItems);
        });
    });

    describe('a11y', () => {
        describe('when in mobile', () => {
            beforeEach(() => {
                element.showListView = true;
                element.showMobileTrigger = true;
                element.toggleMobileView(true);
            });

            it('should fulfill accessibility standards', async () => {
                navMenuAdapter.emit({ data: apiData });

                await Promise.resolve();
                await expect(element).toBeAccessible();
            });
        });

        describe('when not in mobile', () => {
            it('should fulfill accessibility standards', async () => {
                navMenuAdapter.emit({ data: apiData });

                await Promise.resolve();
                await expect(element).toBeAccessible();
            });
        });
    });

    describe('resize', () => {
        it('should compute orientation based on window size', async () => {
            let mobileTrigger = querySelector('lightning-button-icon');

            expect(mobileTrigger).toBeNull();
            window.matchMedia = jest.fn().mockImplementation(() => ({ matches: false }));
            window.dispatchEvent(new CustomEvent('resize'));

            await Promise.resolve();

            expect(window.matchMedia).toHaveBeenCalled();
            mobileTrigger = querySelector('lightning-button-icon');
            expect(mobileTrigger).not.toBeNull();
        });
    });

    describe('handleNavigationTriggerClicked', () => {
        beforeAll(() => {
            window.matchMedia = jest.fn().mockImplementation(() => ({ matches: false }));
            window.dispatchEvent(new CustomEvent('resize'));
        });
        it('should trigger mobile menu state', async () => {
            const mobileTrigger = <HTMLElement>querySelector('lightning-button-icon');
            expect(mobileTrigger).not.toBeNull();

            mobileTrigger.click();

            await Promise.resolve();

            expect(querySelector('community_navigation-drilldown-navigation-list')).not.toBeNull();
        });
    });

    describe('focusMobileNavigationTrigger', () => {
        it('should focus mobile trigger when submenu is closed', async () => {
            const mobileButton = <HTMLElement>querySelector('lightning-button-icon');
            const spy = jest.spyOn(mobileButton, 'focus');

            mobileButton.click();

            await Promise.resolve();
            const navList = <HTMLElement>querySelector('community_navigation-drilldown-navigation-list');

            const event = new CustomEvent('closesubmenus');
            navList.dispatchEvent(event);

            expect(spy).toHaveBeenCalled();
        });

        it('dispatch event for aura', async () => {
            element.showMobileTrigger = false;
            element.showListView = true;

            const mobileButton = <HTMLElement>querySelector('lightning-button-icon');
            mobileButton.click();
            await Promise.resolve();

            const closeListener = jest.fn();
            element.addEventListener('closemobile', closeListener);

            await Promise.resolve();
            const navList = <HTMLElement>querySelector('community_navigation-drilldown-navigation-list');

            const event = new CustomEvent('closesubmenus');
            navList.dispatchEvent(event);

            expect(closeListener).toHaveBeenCalled();
        });
    });

    describe('theme mobile', () => {
        it('hide the trigger icon if theme is set', async () => {
            element.showMobileTrigger = false;
            element.showListView = true;

            await Promise.resolve();
            const mobileButton = <HTMLElement>querySelector('lightning-button-icon');

            expect(mobileButton).toBeNull();
        });
    });

    describe('aura mobile', () => {
        it('shows the mobile menu', async () => {
            element.showMobileTrigger = false;
            element.showListView = false;

            element.toggleMobileView(true);

            await Promise.resolve();
            const navList = <HTMLElement>querySelector('community_navigation-drilldown-navigation-list');

            expect(navList).not.toBeNull();
        });

        it('hides the mobile menu', async () => {
            const mobileButton = <HTMLElement>querySelector('lightning-button-icon');
            mobileButton.click();
            await Promise.resolve();

            element.toggleMobileView(false);
            await Promise.resolve();

            const navList = <HTMLElement>querySelector('community_navigation-drilldown-navigation-list');
            expect(navList).toBeNull();
        });
    });
});
