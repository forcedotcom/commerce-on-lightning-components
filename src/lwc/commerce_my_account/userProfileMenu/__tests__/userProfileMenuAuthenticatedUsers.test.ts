import { createElement } from 'lwc';
import UserProfileMenu from 'commerce_my_account/userProfileMenu';
import { querySelector, querySelectorAll } from 'kagekiri';
import { menuItems } from './data/menuItems.json';
import MockResizeObserver from './ResizeObserver';

import * as menuItemClassesGenerator from '../menuItemClassesGenerator';

const cssClassesForMenuItemSpy = jest.spyOn(menuItemClassesGenerator, 'cssClassesForMenuItem');
const mockMenuItems = menuItems;
async function timeout(ms = 0): Promise<void> {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve, ms));
}

//Mock the labels with known values.
jest.mock('../labels.ts', () => ({
    UserProfileMenuAltLabel: 'User Profile {userName}',
}));

describe('commerce_my_account-user-profile-menu for authenticated users', () => {
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

    it('should be accessible in mobile view mode', async () => {
        await expect(element).toBeAccessible();
    });

    it('Verify for userProfileMenu button AltText', async () => {
        const menuButton = querySelectorAll('.slds-button');
        await Promise.resolve();
        expect(menuButton[0].getAttribute('aria-label')).toBeTruthy();
    });

    it('shows the user image when one is specified', async () => {
        element.iconStyle = 'userIcon';
        element.showNameInTrigger = true;
        await Promise.resolve();
        const imgElement = <HTMLImageElement | null>querySelector('.slds-hide_medium');
        expect(imgElement).toBeNull();
    });

    it('Hide the text container when value of showNameInTrigger is false', async () => {
        element.showNameInTrigger = false;
        await Promise.resolve();
        const menuTriggerText = <HTMLElement | null>querySelector('.menu-trigger');
        expect(menuTriggerText).toBeNull();
    });

    it('verify Alt text in the image should match userName when value of showNameInTrigger is false', async () => {
        element.iconStyle = 'userIcon';
        element.showNameInTrigger = false;
        element.userName = 'Test1332';
        await Promise.resolve();
        const assistiveTextSpan = <HTMLElement | null>querySelector('.slds-assistive-text');
        expect(assistiveTextSpan?.textContent).toBe('User Profile Test1332');
    });

    it('verify if textAlignment is right, correct set of css classes are being applied on menu trigger container', async () => {
        element.textAlignment = 'right';
        element.showNameInTrigger = true;
        await Promise.resolve();
        const menuTriggerCtn = <HTMLElement | null>querySelector('.menu-trigger-ctn');
        expect(menuTriggerCtn).not.toBeNull();
    });

    it(`verify if textAlignment is left, correct set of css classes are being applied on menu trigger container`, async () => {
        element.textAlignment = 'left';
        element.showNameInTrigger = true;
        await Promise.resolve();
        const menuTriggerCtn = <HTMLElement | null>querySelector('.menu-trigger-ctn');
        expect(menuTriggerCtn).toBeNull();
    });

    it('verify drop down is fixed at right side', async () => {
        element.menuItems = mockMenuItems;
        element.includeCompanyName = true;
        await Promise.resolve();
        const dropDownCtn = <HTMLElement | null>querySelector('.slds-dropdown_right');
        expect(dropDownCtn).toBeTruthy();
    });

    it('verify if custom event navigatetopage is being triggered on click of Menu Item', async () => {
        element.menuItems = mockMenuItems;
        const toastEventhandler = jest.fn();
        element.addEventListener('navigatetopage', toastEventhandler);
        await Promise.resolve();
        const menuItem = <HTMLElement | null>querySelectorAll('.slds-dropdown__item a')[0];
        menuItem?.click();
        expect(toastEventhandler).toHaveBeenCalledTimes(1);
    });

    ['mouseenter', 'mouseleave'].forEach((eventName) => {
        it(`verify that hover styling are being applied whenever event ${eventName} over the menu item`, async () => {
            element.menuItems = mockMenuItems;
            await Promise.resolve();
            const menuItem = <HTMLElement | null>querySelectorAll('.slds-dropdown__item a')[1];
            menuItem?.dispatchEvent(new CustomEvent(`${eventName}`));
            const isHovering = `${eventName}` === 'mouseenter';
            // We know we're in a hovering state if we call the StyleStringGenerator with the isHovering state set to false.
            expect(cssClassesForMenuItemSpy).toHaveBeenCalledWith(expect.anything(), isHovering);
        });
    });

    it('verify menutoggle event is being called whenever user press Enter on menu trigger', async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        element.querySelector('.slds-dropdown-trigger')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(1);
    });

    it('verify menutoggle event is being called whenever user click on menu trigger', async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(1);
    });

    it("verify menuToggle event isn't being called whenever user press enter on a trigger of an expanded menu", async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        // this will expand the menu drop down
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        element.querySelector('.slds-dropdown-trigger')?.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Enter',
            })
        );
        // menu is toggle only once because of click event
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(1);
    });

    it('verify menu gets collapsed if user clicks on a trigger of an expanded menu', async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        // this will expand the menu drop down
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        menuTriggerButton?.click();
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(2);
    });

    ['Up', 'Down'].forEach((eventName) => {
        it(`verify behaviour keyboard event ${eventName} if focus is on menu trigger`, async () => {
            element.menuItems = mockMenuItems;
            await Promise.resolve();
            const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
            menuTriggerButton?.click();
            const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
            menuCtn?.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: `${eventName}`,
                })
            );
            const dataId = `${eventName}` === 'Up' ? (element.menuItems ? element.menuItems.length - 1 : 0) : 0;
            expect(<HTMLElement | null>menuCtn?.querySelector(`ul > li > a[data-id="${dataId}"]`)).toBeTruthy();
        });
    });

    ['Up', 'Down'].forEach((eventName) => {
        it(`verify behaviour keyboard event ${eventName} if focus is on first menu item`, async () => {
            element.menuItems = mockMenuItems;
            await Promise.resolve();
            // this will expand the menu drop down
            const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
            menuTriggerButton?.click();
            const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
            // this will set focus on the first menu item
            menuCtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Down' }));
            menuCtn?.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: `${eventName}`,
                })
            );
            const dataId = `${eventName}` === 'Up' ? (element.menuItems ? element.menuItems.length - 1 : 0) : 1;
            expect(<HTMLElement | null>querySelector(`ul > li > a[data-id="${dataId}"]`)).toBeTruthy();
        });
    });

    ['Up', 'Down'].forEach((eventName) => {
        it(`verify behaviour keyboard event ${eventName} if focus is on last menu item`, async () => {
            element.menuItems = mockMenuItems;
            await Promise.resolve();
            // this will expand the menu drop down
            const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
            menuTriggerButton?.click();
            const menuCtn: HTMLElement | null = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
            //this will set focus on the last menu item
            menuCtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Up' }));
            menuCtn?.dispatchEvent(new KeyboardEvent('keydown', { key: `${eventName}` }));
            const dataId = `${eventName}` === 'Up' ? (element.menuItems ? element.menuItems.length - 2 : 0) : 0;
            expect(<HTMLElement | null>querySelector(`ul > li > a[data-id="${dataId}"]`)).toBeTruthy();
        });
    });

    it('sets the focus on the first menu item when the down key is pressed to open the menu', async () => {
        element.menuItems = mockMenuItems;
        await Promise.resolve();
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        // This will set focus on the first menu item
        menuCtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Down' }));
        const dataId = 0;
        expect(<HTMLElement | null>querySelector(`ul > li > a[data-id="${dataId}"]`)).toBeTruthy();
    });

    it('sets the focus on the first menu item when the enter key is pressed to open the menu', async () => {
        element.menuItems = mockMenuItems;
        await Promise.resolve();
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        // This will set focus on the first menu item
        menuCtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(<HTMLElement | null>querySelector(`ul > li > a[data-id='0']`)).toBeTruthy();
    });

    it('sets the focus on the last menu item when the up key is pressed to open the menu', async () => {
        element.menuItems = mockMenuItems;
        await Promise.resolve();
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        // This will set focus on the last menu item
        menuCtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Up' }));
        const dataId = element.menuItems ? element.menuItems.length - 1 : 0;
        expect(<HTMLElement | null>querySelector(`ul > li > a[data-id="${dataId}"]`)).toBeTruthy();
    });

    it('verify navigateToPage event is being called whenever user press enter on a menu item', async () => {
        element.menuItems = mockMenuItems;
        const navigateToPageEventhandler = jest.fn();
        element.addEventListener('navigatetopage', navigateToPageEventhandler);
        await Promise.resolve();
        // this will expand the menu drop down
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        // this will set focus on the first menu item
        menuCtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Down' }));
        menuCtn?.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Enter',
            })
        );
        expect(navigateToPageEventhandler).toHaveBeenCalledTimes(1);
    });

    it('closes the menu when the user presses enter on a menu item', async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        // this will expand the menu drop down
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        // this will set focus on the first menu item
        menuCtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Down' }));
        menuCtn?.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Enter',
            })
        );
        // menu is toggle twice once because of click event and then because of menu item click
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(2);
    });

    it('closes the menu when the user clicks a menu item', async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        // this will expand the menu drop down
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        // this will click onn first menu item
        const firstMenuItem = <HTMLButtonElement | null>querySelector('li:nth-child(1) > a');
        firstMenuItem?.click();
        // menu is toggle twice once because of click event and then because of menu item click
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(2);
    });

    it('verify behaviour keyboard event Esc on menu', async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        menuCtn?.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Esc',
            })
        );
        //  menutoggle should be called twice. One from click and one from key
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(2);
    });

    it('verify event.preventDefault() is being triggered when key up is being pressed on menu with no menu items', async () => {
        const radomKeyDownEvent = new KeyboardEvent('keydown', {
            key: 'Down',
            //@ts-ignore
            preventDefault: (): void => undefined,
        });
        jest.spyOn(radomKeyDownEvent, 'preventDefault');
        await Promise.resolve();
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        menuCtn?.dispatchEvent(radomKeyDownEvent);
        expect(radomKeyDownEvent.preventDefault).toHaveBeenCalled();
    });

    it('verify event.preventDefault() is not being triggered when any key other than up, down, esc, tab, Enter is being pressed on menu', async () => {
        element.menuItems = mockMenuItems;
        const radomKeyDownEvent = new KeyboardEvent('keydown', {
            key: 's',
            //@ts-ignore
            preventDefault: (): void => undefined,
        });
        jest.spyOn(radomKeyDownEvent, 'preventDefault');
        await Promise.resolve();
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        menuCtn?.dispatchEvent(radomKeyDownEvent);
        expect(radomKeyDownEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('verify menutoggle event is being called whenever menu losses focus', async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        const menuTriggerButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuTriggerButton?.click();
        const menuCtn = <HTMLElement>querySelector('.slds-dropdown-trigger');
        menuCtn?.dispatchEvent(new CustomEvent('focusout'));
        //menuToggleEventhandler is called once because of click event and other because of focus out
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(2);
    });

    it("verify menutoggle event isn't being called whenever menu focus stays within component", async () => {
        element.menuItems = mockMenuItems;
        const menuToggleEventhandler = jest.fn();
        element.addEventListener('menutoggle', menuToggleEventhandler);
        await Promise.resolve();
        const menuButton = <HTMLButtonElement | null>querySelector('.slds-button');
        menuButton?.click();
        const event = new FocusEvent('focusout', {
            relatedTarget: menuButton,
        });
        const menuCtn = <HTMLElement | null>querySelector('.slds-dropdown-trigger');
        menuCtn?.dispatchEvent(event);
        //menuToggleEventhandler is called only once because of click event
        expect(menuToggleEventhandler).toHaveBeenCalledTimes(1);
    });

    it(`verify nubbin does not appears top-right when formfactor is small`, async () => {
        element.menuItems = mockMenuItems;
        await Promise.resolve();
        const dropDownCtn = <HTMLElement | null>querySelector('.slds-nubbin_top-right');
        expect(dropDownCtn).toBeFalsy();
        MockResizeObserver.mock([{ contentRect: { width: 1000 } }]);
        await timeout();
        window.dispatchEvent(new CustomEvent('resize'));
    });

    it('should be accessible in tablet view mode', async () => {
        await expect(element).toBeAccessible();
    });

    it(`verify nubbin appears always top-right when formfactor is medium`, async () => {
        element.menuItems = mockMenuItems;
        await Promise.resolve();
        const dropDownCtn = <HTMLElement | null>querySelector('.slds-nubbin_top-right');
        expect(dropDownCtn).toBeTruthy();
        MockResizeObserver.mock([{ contentRect: { width: 1500 } }]);
        await timeout();
        window.dispatchEvent(new CustomEvent('resize'));
    });

    it('should be accessible in desktop view mode', async () => {
        await expect(element).toBeAccessible();
    });

    it(`verify nubbin appears always top-right when formfactor is large`, async () => {
        element.menuItems = mockMenuItems;
        await Promise.resolve();
        const dropDownCtn = <HTMLElement | null>querySelector('.slds-nubbin_top-right');
        expect(dropDownCtn).toBeTruthy();
    });

    it('verify Alt text span should not exist when value of showNameInTrigger is true with form factor Large', async () => {
        element.iconStyle = 'companyIcon';
        element.showNameInTrigger = true;
        element.userName = 'Test1332';
        await Promise.resolve();
        const assistiveTextSpan = <HTMLElement | null>querySelector('.slds-assistive-text');
        expect(assistiveTextSpan).toBeFalsy();
    });
});
