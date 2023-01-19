import { LightningElement, api, track } from 'lwc';
import { classSet } from 'lightning/utils';
import { cssClassesForMenuItem } from './menuItemClassesGenerator';
import type { MenuItem, UserProfileName } from './types';
import userProfileMenuAltLabelGenerator from './userProfileMenuAltTextGenerator';
import { createStyleString } from 'community_styling/inlineStyles';
import isGuest from '@salesforce/user/isGuest';

const KEY_NAMES = {
    UP: 'Up',
    DOWN: 'Down',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ENTER: 'Enter',
    ESC: 'Esc',
    ESCAPE: 'Escape',
};

/**
 * Display user profile menu
 *
 * @fires UserProfileMenu#userlogin
 * @fires UserProfileMenu#navigatetopage
 * @fires UserProfileMenu#menutoggle
 */
export default class UserProfileMenu extends LightningElement {
    static renderMode = 'light';
    /**
     * An event fired when user clicks login button.This event can bubble up through the DOM
     *
     * @event UserProfileMenu#userlogin
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when user clicks on a menu item. This event can bubble up through the DOM
     *
     * @event UserProfileMenu#navigatetopage
     * @type {CustomEvent}
     *
     * @property {Number} detail.id
     * Id of the menu item
     *
     * @export
     */

    /**
     * An event fired when menu is toggled. This event can bubble up through the DOM
     *
     * @event UserProfileMenu#menutoggle
     * @type {CustomEvent}
     *
     * @property {Boolean} detail.isMenuOpen
     * true if the menu is in open state
     *
     * @export
     */

    /**
     * Label for login button
     * @type {String}
     */
    @api loginButtonText: string | undefined;

    /**
     * displayName of user
     * @type {String}
     */
    @api
    userName: string | undefined;

    /**
     * @description Boolean whether to include company Name or not on User Profile Component
     */
    @api includeCompanyName = false;

    /**
     * companyName of user
     * @type {String}
     */
    @api companyName: string | undefined;

    /**
     * alignment of login text. textAlignment should have a value 'left' or 'right'
     * @type {String}
     */
    @api loginTextAlignment: string | undefined;

    /**
     * alignment of text inside menu trigger. textAlignment should have a value 'left' or 'right'
     * @type {String}
     */
    @api textAlignment: string | undefined;

    /**
     * string denoting user profile photo or company logo
     * @type {String}
     */
    @api iconStyle: string | undefined;

    /**
     * true if user name or company name needs to be displayed in menu trigger
     * @type {Boolean}
     */
    @api showNameInTrigger = false;

    /**
     * {Array.<{id: Number, label: String}>} menuItems
     */
    @api menuItems: MenuItem[] | undefined;

    /**
     * text color for login link
     * @type {String}
     */
    @api loginLinkTextColor: string | undefined;

    /**
     * hover color for login link
     * @type {String}
     */
    @api loginLinkTextHoverColor: string | undefined;

    /**
     * login link text decoration settings.
     * @type {String}
     */
    @api loginLinkTextDecoration: string | undefined;

    get _menuItems(): MenuItem[] {
        return this.menuItems || [];
    }

    get _userDetailsForMobileAndTablet(): UserProfileName[] {
        const userNameObj = {
            id: 'userName',
            label: this.userName || '',
        };
        const companyNameObj = {
            id: 'companyName',
            label: this.companyName || '',
        };
        if (this.includeCompanyName) {
            return [userNameObj, companyNameObj];
        }
        return [userNameObj];
    }

    @track private _state: {
        loginButtonHover: boolean;
        menuTriggerHover: boolean;
        focusedMenuItem: string | null;
        formFactor: string | undefined;
        isMenuExpanded: boolean;
    } = {
        loginButtonHover: false,
        menuTriggerHover: false,
        focusedMenuItem: null,
        formFactor: undefined,
        isMenuExpanded: false,
    };

    _menuTriggerLeftBound = 0;
    _menuTriggerTopBound = 0;

    /**
     * Whether user is logged in or not.
     * @type {Boolean}
     */
    private isLoggedIn = !isGuest;

    /**
     * The ResizeObserver instance
     */
    private _resizeObserver?: ResizeObserver;

    /**
     * returns alt text as userName for the menu button
     * returns empty string when userName is shown along with the image i.e. in desktop view mode.
     */
    get userProfileMenuButtonAltText(): string {
        if (this._state.formFactor !== 'Large' || !this.showNameInTrigger) {
            return userProfileMenuAltLabelGenerator(this.userName ?? '');
        }
        return '';
    }

    get nubbinStyleString(): string {
        return `left: ${this._menuTriggerLeftBound + 10}px`;
    }

    get spaceFromTopStyleString(): string {
        return `top: ${this._menuTriggerTopBound + 40}px`;
    }

    connectedCallback(): void {
        this._resizeObserver = new ResizeObserver((entries) => {
            if (entries && entries[0]) {
                if (entries[0].contentRect.width <= 767) {
                    this._state.formFactor = 'Small';
                } else if (entries[0].contentRect.width > 767 && entries[0].contentRect.width <= 1023) {
                    this._state.formFactor = 'Medium';
                } else {
                    this._state.formFactor = 'Large';
                }
            }
        });
        this._resizeObserver?.observe(document.body);
    }

    disconnectedCallback(): void {
        this._resizeObserver?.disconnect();
    }

    get fetchUserOrCompanyIcon(): string {
        return this.iconStyle === 'userIcon' ? 'utility:user' : 'utility:company';
    }

    /**
     * @return true if menu items are presents
     */
    get hasMenuItems(): boolean {
        return Boolean(this._menuItems.length);
    }

    /**
     * @return menuItems with added CSS classes and style attribute in each menu item
     */
    get styleMappedMenuItems(): MenuItem[] {
        return this._menuItems.map((item) => {
            const id = item.id;
            const hasFocus = this._state.focusedMenuItem === id.toString();
            const newItem = {
                ...item,
                classes: cssClassesForMenuItem(hasFocus, false),
            };
            return newItem;
        });
    }

    get styleUserDetailsForMobileAndTablet(): UserProfileName[] {
        return this._userDetailsForMobileAndTablet.map((item, index) => {
            // Border the last element of userDetailsForMobileAndTablet.
            const hasBorder = index === this._userDetailsForMobileAndTablet.length - 1;
            const newItem = {
                ...item,
                classes: cssClassesForMenuItem(false, hasBorder),
            };
            return newItem;
        });
    }

    /**
     * @return the css classes name for menu trigger container
     */
    get menuTriggerContainerClasses(): string {
        return classSet('slds-media slds-media_center slds-no-space slds-truncate')
            .add({
                'menu-trigger-ctn': 'right' === this.textAlignment,
                'company-name-max-width': Boolean(this.showNameInTrigger) && Boolean(this.includeCompanyName),
            })
            .toString();
    }

    get loginLinkClasses(): string {
        return classSet('slds-media slds-media_center slds-no-space guest-login-max-width slds-truncate')
            .add({
                'menu-trigger-ctn': 'right' === this.loginTextAlignment,
            })
            .toString();
    }

    /**
     * @return the css classes for the user name inside menu trigger
     */
    get menuTriggerUserNameClasses(): string {
        return classSet('menu-trigger-p slds-text-align_right slds-truncate')
            .add({
                'slds-m-vertical_xx-small': !this.companyName,
                'slds-m-top_xx-small': Boolean(this.companyName),
            })
            .toString();
    }

    get loginLinkStyle(): string {
        if (!this.loginLinkTextDecoration) {
            return '';
        }
        const loginTextStyleObject = JSON.parse(this.loginLinkTextDecoration);
        // Adds the css custom variable as object in the properties only if it is set.
        const customStylingProperties = {
            ...(loginTextStyleObject.bold && { '--com-c-my-account-user-profile-login-link-font-weight': 'bold' }),
            ...(loginTextStyleObject.italic && {
                '--com-c-my-account-user-profile-login-link-font-style': 'italic',
            }),
            ...((loginTextStyleObject.underline || loginTextStyleObject.strike) && {
                '--com-c-my-account-user-profile-login-link-text-decoration': loginTextStyleObject.strike
                    ? 'line-through'
                    : 'underline',
            }),
        };
        return createStyleString(customStylingProperties);
    }

    get cssCustomStyleForLoginLink(): string {
        const cssCustomVariables = {
            ...(this.loginLinkTextHoverColor && {
                '--com-c-my-account-user-profile-login-link-hover-color': this.loginLinkTextHoverColor,
            }),
            ...(this.loginLinkTextColor && {
                '--com-c-my-account-user-profile-login-link-color': this.loginLinkTextColor,
            }),
        };
        return createStyleString(cssCustomVariables);
    }

    /**
     * @return the css classes name for the dropdown container
     */
    get menuDropDownContainerClasses(): string {
        return classSet(`dropdown-ctn slds-dropdown slds-dropdown_right`)
            .add({
                'slds-nubbin_top-right': this._state.formFactor === 'Medium' || this._state.formFactor === 'Large',
            })
            .toString();
    }

    /**
     * set the value of focusedMenuItem
     *
     *  @param {Event} event the event object
     */
    handleFocusOrHoverOnMenuItem(event: Event): void {
        const eventTarget = (<HTMLInputElement>event.target).dataset.id;
        if (eventTarget) {
            this._state.focusedMenuItem = eventTarget;
        }
    }

    /**
     * set the value of focusedMenuItem as null
     */
    handleBlurOrOutOnMenuItem(): void {
        this._state.focusedMenuItem = null;
    }

    /**
     * handler for the click event fired from menu item.
     *
     * @param {Object} event the event object
     */
    handleMenuItemClick(event: Event): void {
        const itemId = (<HTMLAnchorElement>event.currentTarget).dataset.id;
        if (itemId) {
            this.dispatchNavigateToPageEvent(itemId);
        }
        this.closeMenu();
    }

    /**
     * Handler for the 'click' event fired from the 'login' button
     *
     */
    handleLoginButtonClick(): void {
        this.dispatchEvent(
            new CustomEvent('userlogin', {
                bubbles: true,
                cancelable: true,
            })
        );
    }

    /**
     * dispatch an event if menu toggles
     * @param {boolean} isMenuOpen if menu is open
     */
    dispatchMenuToggleEvent(isMenuOpen: boolean): void {
        this.dispatchEvent(
            new CustomEvent('menutoggle', {
                bubbles: true,
                cancelable: true,
                detail: {
                    isMenuOpen: isMenuOpen,
                },
            })
        );
    }

    /**
     * @return the css classes name for the Menu container
     */
    get menuContainerClasses(): string {
        return classSet('slds-dropdown-trigger slds-dropdown-trigger_click slds-grid')
            .add({ 'slds-is-open': this._state.isMenuExpanded })
            .toString();
    }
    /**
     * handler for the click event on menu trigger.
     */
    handleMenuTriggerClick(): void {
        this.toggleMenu(!this._state.isMenuExpanded);
    }

    handleFocusOutOnMenu(event: FocusEvent): void {
        const eventRelatedTarget = event.relatedTarget;
        if (!eventRelatedTarget && !this.querySelector('slds-dropdown-trigger')?.contains(eventRelatedTarget)) {
            this.closeMenu();
        }
    }
    /**
     * @param {boolean} isOpen true then expands the menu dropdown, else close the menu dropdown
     */
    toggleMenu(isOpen: boolean): void {
        if (isOpen === this._state.isMenuExpanded) {
            return;
        }
        this._state.isMenuExpanded = isOpen;
        this.dispatchMenuToggleEvent(isOpen);
        if (isOpen) {
            const menuTrigger: HTMLInputElement | null = this.querySelector('.slds-button');
            if (menuTrigger) {
                menuTrigger.focus();
                if (this._state.formFactor === 'Small') {
                    this._menuTriggerLeftBound = menuTrigger.getBoundingClientRect().left;
                    this._menuTriggerTopBound = menuTrigger.getBoundingClientRect().top;
                }
            }
        } else {
            this._state.focusedMenuItem = null;
        }
    }

    /**
     * close the menu dropdown
     */
    closeMenu(): void {
        this.toggleMenu(false);
    }

    /**
     * handler for the keydown event on menu container.
     *
     * if event.key is 'Up' or 'Down' then move focus up or down among the menu items
     * if event.key is 'Enter' and menu is closed then expand the menu
     * if event.key is 'Enter' and menu is Open then click on focusedMenuItem
     * if event.key is 'Esc' or 'Tab' then close the menu
     *
     * @param {Object} event the event object
     */
    handleKeyDownOnMenu(event: KeyboardEvent): void {
        const key = event.key;
        let preventDefault = true;
        switch (key) {
            case KEY_NAMES.UP:
            case KEY_NAMES.ARROW_UP: {
                this.moveFocusOnMenuItem(true);
                break;
            }

            case KEY_NAMES.DOWN:
            case KEY_NAMES.ARROW_DOWN: {
                this.moveFocusOnMenuItem(false);
                break;
            }

            case KEY_NAMES.ENTER: {
                if (this._state.isMenuExpanded) {
                    if (this._state.focusedMenuItem) {
                        this.dispatchNavigateToPageEvent(this._state.focusedMenuItem);
                        this.closeMenu();
                    }
                } else {
                    this.toggleMenu(true);
                    this.moveFocusOnMenuItem(false);
                }
                break;
            }

            case KEY_NAMES.ESC:
            case KEY_NAMES.ESCAPE: {
                this.closeMenu();
                const focusElement: HTMLInputElement | null = this.querySelector('.slds-button');
                if (focusElement) {
                    focusElement.focus();
                }
                break;
            }
            default: {
                preventDefault = false;
            }
        }
        if (preventDefault) {
            event.preventDefault();
        }
    }

    /**
     * handler for the keydown event on menu container.
     *
     * if moveUp is true and focus is on menu trigger or first menu item then next focused element will be the last menu item.
     * if moveUp is true and focus is on any menu item other than first menu item then focus will shift up among menu items.
     * if moveUp is false and focus is on menu trigger or last menu item then next focused element will be the first menu item.
     * if moveUp is false and focus is on any menu item other than last menu item then focus will shift down among menu items
     *
     * @param {boolean} moveUp true the focus will shift Up among the menu items
     */
    moveFocusOnMenuItem(moveUp: boolean): void {
        if (!this._state.isMenuExpanded) {
            this.toggleMenu(true);
        }

        if (this._menuItems.length > 0) {
            const numberOfMenuItems = this._menuItems.length;
            let highlightedIndex = -1;
            if (this._state.focusedMenuItem) {
                highlightedIndex = this._menuItems.findIndex((item) => {
                    return this._state.focusedMenuItem === item.id.toString();
                });
            }
            let nextHighlightedIndex = -1;
            if (moveUp) {
                nextHighlightedIndex = this.getFocusUpMenuItemIndex(highlightedIndex, numberOfMenuItems);
            } else {
                nextHighlightedIndex = this.getFocusDownMenuItemIndex(highlightedIndex, numberOfMenuItems);
            }
            this._state.focusedMenuItem = this._menuItems[nextHighlightedIndex].id.toString();
            const focusMenuItem: HTMLInputElement | null = this.querySelector(
                `[data-id='${this._state.focusedMenuItem}']`
            );
            focusMenuItem?.focus();
        }
    }

    /**
     * @param{number} highlightedIndex
     * @param{number} numberOfMenuItems
     */
    getFocusUpMenuItemIndex(highlightedIndex: number, numberOfMenuItems: number): number {
        if (highlightedIndex === 0 || highlightedIndex === -1) {
            return numberOfMenuItems - 1;
        }
        return highlightedIndex - 1;
    }

    /**
     * @param{number} highlightedIndex
     * @param{number} numberOfMenuItems
     */
    getFocusDownMenuItemIndex(highlightedIndex: number, numberOfMenuItems: number): number {
        if (highlightedIndex === -1 || highlightedIndex === numberOfMenuItems - 1) {
            return 0;
        }
        return highlightedIndex + 1;
    }

    /**
     * dispatch an event to signal a click on a menu item.
     * @param {int} itemId of the menu item
     */
    dispatchNavigateToPageEvent(itemId: string): void {
        this.dispatchEvent(
            new CustomEvent('navigatetopage', {
                bubbles: true,
                cancelable: true,
                detail: {
                    id: itemId,
                },
            })
        );
    }
}
