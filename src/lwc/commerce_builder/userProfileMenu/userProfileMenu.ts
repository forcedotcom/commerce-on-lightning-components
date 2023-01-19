import { LightningElement, api, wire, track } from 'lwc';
import type { NavigationMenuItemData } from 'experience/navigationMenuApi';
import { getNavigationMenu } from 'experience/navigationMenuApi';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import type { LightningNavigationContext, NamedPageReference } from 'types/common';
import { effectiveAccount } from 'commerce/effectiveAccountApi';
import Id from '@salesforce/user/Id';
import type { AppContext, SessionContext } from 'commerce/contextApi';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';

export interface MenuItem extends NavigationMenuItemData {
    id: string;
}

export const MENU_ITEMS_TO_SKIP = ['DataSourceDriven', 'Event', 'GlobalAction', 'MenuLabel', 'NavigationalTopic'];

const TEXT_ORIENTATION = {
    leftOfIcon: 'left',
    rightOfIcon: 'right',
};

const LOGOUT_MENU_ITEM: MenuItem = {
    actionType: 'LogOut',
    label: '',
    imageUrl: null,
    subMenu: [],
    actionValue: 'LogOut',
    target: 'CurrentWindow',
    id: '',
};

const ACTION_TPYES = {
    internalLink: 'InternalLink',
    externalLink: 'ExternalLink',
    logOut: 'LogOut',
    modal: 'Modal',
};

const HOME_PAGE_REF: NamedPageReference = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Home',
    },
};

export default class UserProfileMenu extends LightningElement {
    private _menuItems: MenuItem[] = [];
    private userId = Id;
    private userName: string | undefined;
    private accountId: string | null = effectiveAccount.accountId;

    private accountName: string | undefined;
    private defaultAccountName: string | undefined;

    @track private _state: {
        isLoggedIn: boolean;
        logoutUrl: string;
    } = {
        isLoggedIn: false,
        logoutUrl: '',
    };

    static renderMode = 'light';
    /**
     * @description Login Link Text of User Profile Component
     */
    @api loginLinkText: string | undefined;
    /**
     * @description Login Link Text Color of User Profile Component
     */
    @api loginLinkTextColor: string | undefined;
    /**
     * @description Login Link Text Hover Color of User Profile Component
     */
    @api loginLinkTextHoverColor: string | undefined;

    /**
     * @description Login Link Text Orientation of User Profile Component
     */
    @api loginLinkTextOrientation: string | undefined;

    /**
     * @description Login Link Text Decoration of User Profile Component
     */
    @api loginLinkTextDecoration: string | undefined;

    /**
     * @description Menu Style For Authentication Users of User Profile Component
     * Can have the value either of  'Icon' or 'Icon And Name'
     */
    @api menuStyle: string | undefined;

    /**
     * @description Boolean whether to include company Name or not on User Profile Component
     */
    @api includeCompanyName = false;

    /**
     * @description Profile Icon Styling of User Profile Component
     * Can have the value either of  'User Icon' or 'Company Logo'
     */
    @api iconStyle: string | undefined;

    /**
     * @description UserName Orientation of User Profile Component
     */
    @api userNameTextOrientation: string | undefined;

    /**
     * @description NavigationMenuEditor of User Profile Component
     */
    @api userProfileMenuNavigationMenuEditor: string | undefined;

    /**
     * @description logOut label of User Profile Component
     */
    @api logOutLabel: string | undefined;

    get showNameInTrigger(): boolean {
        return this.menuStyle === 'iconAndName';
    }

    get menuNameTextOrientation(): string {
        return TEXT_ORIENTATION[this.userNameTextOrientation as keyof typeof TEXT_ORIENTATION];
    }

    get loginTextTextOrientation(): string {
        return TEXT_ORIENTATION[this.loginLinkTextOrientation as keyof typeof TEXT_ORIENTATION];
    }

    get _accountName(): string | undefined {
        return this.accountName || this.defaultAccountName;
    }

    @wire(SessionContextAdapter)
    private updateSessionContext({ data }: StoreAdapterCallbackEntry<SessionContext>): void {
        this.userName = data?.userName;
        this.accountId = data?.effectiveAccountId ?? null;
        this.accountName = data?.effectiveAccountName;
        this._state = {
            ...this._state,
            isLoggedIn: data?.isLoggedIn || false,
        };
    }

    @wire(AppContextAdapter)
    private updateAppContext({ data }: StoreAdapterCallbackEntry<AppContext>): void {
        this._state = {
            ...this._state,
            logoutUrl: data?.logoutUrl ?? '',
        };
    }

    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    @wire(getNavigationMenu, {
        navigationLinkSetDeveloperName: '$userProfileMenuNavigationMenuEditor',
        menuItemTypesToSkip: MENU_ITEMS_TO_SKIP,
        includeImageUrl: false,
        addHomeMenuItem: false,
    })
    private getNavigationMenuData(result: StoreAdapterCallbackEntry<{ menuItems?: NavigationMenuItemData[] }>): void {
        LOGOUT_MENU_ITEM.label = this.logOutLabel ?? '';
        // Create a copy and append index number for each menu item.
        this._menuItems = (result?.data?.menuItems || [])
            .concat(LOGOUT_MENU_ITEM)
            .reduce((menuItems: MenuItem[], menuItem: NavigationMenuItemData, index: number): MenuItem[] => {
                if (menuItem.actionValue) {
                    const item = <MenuItem>{
                        ...menuItem,
                        id: index.toString(),
                    };
                    // push item to the menuItems
                    menuItems.push(item);
                }
                return menuItems;
            }, []);
    }

    private handleNavigateToPage(event: CustomEvent): void {
        const selectedMenuItem = event.detail.id;
        if (selectedMenuItem) {
            const menuItem = this._menuItems.find((menu) => menu.id === selectedMenuItem);
            if (menuItem && menuItem.actionValue) {
                if (menuItem.actionType === ACTION_TPYES.internalLink) {
                    navigate(this.navContext, {
                        type: 'standard__webPage',
                        attributes: {
                            url: menuItem.actionValue,
                        },
                    });
                } else if (menuItem.actionType === ACTION_TPYES.logOut) {
                    // clearing of sessionStorage EffectiveAccountId value by setting it to null
                    effectiveAccount.update(null, null);
                    window.open(this._state.logoutUrl, '_self', 'nofollow,noopener,noreferrer');
                } else if (menuItem.actionType === ACTION_TPYES.externalLink) {
                    window.open(
                        menuItem.actionValue,
                        menuItem.target === 'NewWindow' ? '_blank' : '_self',
                        'nofollow,noopener,noreferrer'
                    );
                } else if (menuItem.actionType === ACTION_TPYES.modal) {
                    this.openModal(menuItem.actionValue.replace(':', '/'));
                }
            }
        }
    }

    private async openModal(componentFqn: string): Promise<void> {
        const modal = await import(componentFqn);
        modal.default.open({
            onaccountselect: (e: CustomEvent): void => {
                e.stopPropagation();
                //  Updating Effective account id when User selects account in account switcher modal
                effectiveAccount.update(e.detail.accountId, e.detail.accountName);
                const url = generateUrl(this.navContext, HOME_PAGE_REF);
                window.location.assign(url);
            },
        });
    }

    private handleUserLogin(): void {
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Login',
            },
        });
    }
}
