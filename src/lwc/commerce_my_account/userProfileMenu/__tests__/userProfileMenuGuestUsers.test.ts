import { createElement } from 'lwc';
import UserProfileMenu from 'commerce_my_account/userProfileMenu';
import { querySelector } from 'kagekiri';
import { menuItems } from './data/menuItems.json';
import MockResizeObserver from './ResizeObserver';

const mockMenuItems = menuItems;

//Mock the labels with known values.
jest.mock('../labels.ts', () => ({
    UserProfileMenuAltLabel: 'User Profile {userName}',
}));

jest.mock(
    '@salesforce/user/isGuest',
    (): Record<string, unknown> => {
        return { default: () => true };
    },
    { virtual: true }
);

describe('commerce_my_account-user-profile-menu for guest users', () => {
    let element: HTMLElement & UserProfileMenu;
    beforeAll(() => {
        MockResizeObserver.mock([{ contentRect: { width: 767 } }]);
    });

    afterAll(() => {
        MockResizeObserver.restore();
    });
    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_my_account-user-profile-menu', {
            is: UserProfileMenu,
        });
        document.body.appendChild(element);
    });
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });
    it('verify if custom event userlogin is being triggered on click of login button', async () => {
        element.menuItems = mockMenuItems;
        element.loginLinkTextColor = 'red';
        element.loginLinkTextHoverColor = 'blue';
        const toastEventhandler = jest.fn();
        element.addEventListener('userlogin', toastEventhandler);
        await Promise.resolve();
        const loginLink = <HTMLButtonElement | null>querySelector('.login-link');
        loginLink?.click();
        expect(toastEventhandler).toHaveBeenCalledTimes(1);
    });
    it('verify the case where some style properties of login text are false', async () => {
        element.menuItems = mockMenuItems;
        element.loginLinkTextDecoration = '{"bold":true,"italic":false,"underline":true,"strike":false}';
        const toastEventhandler = jest.fn();
        element.addEventListener('userlogin', toastEventhandler);
        await Promise.resolve();
        const logintext = <HTMLParagraphElement | null>querySelector('.login-text');
        expect(logintext).toBeTruthy();
        if (logintext) {
            expect(
                getComputedStyle(logintext).getPropertyValue('--com-c-my-account-user-profile-login-link-font-style')
            ).toBeFalsy();
        }
    });
    it('verify the case where only strike is set', async () => {
        element.menuItems = mockMenuItems;
        element.loginLinkTextDecoration = '{"bold":false,"italic":false,"underline":false,"strike":true}';
        const toastEventhandler = jest.fn();
        element.addEventListener('userlogin', toastEventhandler);
        await Promise.resolve();
        const logintext = <HTMLParagraphElement | null>querySelector('.login-text');
        expect(logintext).toBeTruthy();
        if (logintext) {
            expect(
                getComputedStyle(logintext).getPropertyValue('--com-c-my-account-user-profile-login-link-font-weight')
            ).toBeFalsy();
            expect(
                getComputedStyle(logintext).getPropertyValue('--com-c-my-account-user-profile-login-link-font-style')
            ).toBeFalsy();
            expect(
                getComputedStyle(logintext).getPropertyValue(
                    '--com-c-my-account-user-profile-login-link-text-decoration'
                )
            ).toBeTruthy();
        }
    });
    it('verify the case where all style properties of login text are true', async () => {
        element.menuItems = mockMenuItems;
        element.loginLinkTextDecoration = '{"bold":true,"italic":true,"underline":true,"strike":true}';
        const toastEventhandler = jest.fn();
        element.addEventListener('userlogin', toastEventhandler);
        await Promise.resolve();
        const logintext = <HTMLParagraphElement | null>querySelector('.login-text');
        expect(logintext).toBeTruthy();
        if (logintext) {
            expect(
                getComputedStyle(logintext).getPropertyValue('--com-c-my-account-user-profile-login-link-font-weight')
            ).toBeTruthy();
            expect(
                getComputedStyle(logintext).getPropertyValue('--com-c-my-account-user-profile-login-link-font-style')
            ).toBeTruthy();
            expect(
                getComputedStyle(logintext).getPropertyValue(
                    '--com-c-my-account-user-profile-login-link-text-decoration'
                )
            ).toBeTruthy();
        }
    });
});
