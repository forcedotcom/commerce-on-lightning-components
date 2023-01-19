import { getMenuItemIdOfCurrentPage } from '../navigationMenuItemSelector';
import { menuItems as navMenuItems } from './data/navMenuItems.data.json';

describe('validate the selected menu item id when current page url', () => {
    [
        {
            currentPageUrl: null,
            expectedMenuId: '',
        },
        {
            currentPageUrl: undefined,
            expectedMenuId: '',
        },
        {
            currentPageUrl: '',
            expectedMenuId: '',
        },
        {
            currentPageUrl: '?',
            expectedMenuId: '',
        },
        {
            currentPageUrl: 'invalid',
            expectedMenuId: '',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/',
            expectedMenuId: '0',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/myprofile',
            expectedMenuId: '1',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/account/Account/00Bxx0000029Y6KEAU',
            expectedMenuId: '5',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/custom-page',
            expectedMenuId: '12',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/custom-page-1',
            expectedMenuId: '13',
        },
        {
            currentPageUrl: 'invalid?app=commeditor&view=editor&formFactor=LARGE',
            expectedMenuId: '',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/?app=commeditor&view=editor&formFactor=LARGE',
            expectedMenuId: '0',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/myprofile?app=commeditor&view=editor&formFactor=LARGE',
            expectedMenuId: '1',
        },
        {
            currentPageUrl:
                '/TestB2BLWR3/s/account/Account/00Bxx0000029Y6KEAU?app=commeditor&view=editor&formFactor=LARGE',
            expectedMenuId: '5',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/custom-page?app=commeditor&view=editor&formFactor=SMALL',
            expectedMenuId: '12',
        },
        {
            currentPageUrl: '/TestB2BLWR3/s/custom-page-1?app=commeditor&view=editor&formFactor=SMALL',
            expectedMenuId: '13',
        },
    ].forEach(({ currentPageUrl, expectedMenuId }) => {
        it(` is ${currentPageUrl}`, () => {
            expect(getMenuItemIdOfCurrentPage(navMenuItems, currentPageUrl)).toBe(expectedMenuId);
        });
    });

    describe('validate the selected menu item id when menu items', () => {
        [
            {
                menuItems: null,
                expectedMenuId: '',
            },
            {
                menuItems: undefined,
                expectedMenuId: '',
            },
            {
                menuItems: [],
                expectedMenuId: '',
            },
            {
                menuItems: navMenuItems,
                expectedMenuId: '1',
            },
        ].forEach(({ menuItems, expectedMenuId }) => {
            it(` is ${menuItems}`, () => {
                expect(getMenuItemIdOfCurrentPage(menuItems, '/TestB2BLWR3/s/myprofile')).toBe(expectedMenuId);
            });
        });
    });
});
