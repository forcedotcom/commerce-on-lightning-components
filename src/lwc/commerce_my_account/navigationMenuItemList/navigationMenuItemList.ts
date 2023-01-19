import { api, LightningElement, wire } from 'lwc';
import { coerceStringProperty } from 'experience/coercion';
import type { NavigationMenuItemData } from 'experience/navigationMenuApi';
import { getNavigationMenu } from 'experience/navigationMenuApi';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { CurrentPageReference, generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import type { ExperienceContextPageReference, LightningNavigationContext, PageReference } from 'types/common';
import { menuSelectorPlaceholderText, menuSelectorLabel } from './labels';
import { generateVerticalPaddingClass } from './navigationMenuItemListClassGenerator';
import { getMenuItemIdOfCurrentPage } from './navigationMenuItemSelector';

export const MENU_ITEMS_TO_SKIP = ['Event', 'GlobalAction', 'MenuLabel', 'NavigationalTopic', 'SystemLink', 'Modal'];

export interface MenuItem extends NavigationMenuItemData {
    id: string;
}

/**
 * This component is used to render navigation menu items either using Lightning Vertical Navigation or Combobox
 */
export default class NavigationMenuItemList extends LightningElement {
    private _navigationLinkSetDevName = '';
    private _navItemSpacing = 'small';
    private _menuItems: MenuItem[] = [];
    private _isDesktop = true;
    private currentPageUrl = '';
    private _resizeListener: (this: Window, ev: UIEvent) => void = (): void => {
        this.setDeviceType();
    };

    public renderedCallback(): void {
        this.setDeviceType();
    }

    connectedCallback(): void {
        window.addEventListener('resize', this._resizeListener);
    }

    disconnectedCallback(): void {
        window.removeEventListener('resize', this._resizeListener);
    }

    private setDeviceType(): void {
        this._isDesktop = window.matchMedia('(min-width: 48em)').matches;
    }

    /**
     * Gets or Sets the navigationLinkSetDevName property
     */
    @api
    public get navigationLinkSetDevName(): string {
        return this._navigationLinkSetDevName;
    }

    public set navigationLinkSetDevName(value: string) {
        this._navigationLinkSetDevName = value;
    }

    /**
     * Specifies the spacing between menu items(x-large,large,medium,small,xx-small,none)
     */
    @api
    get navItemSpacing(): string {
        return this._navItemSpacing;
    }
    set navItemSpacing(value: string) {
        this._navItemSpacing = coerceStringProperty(value, 'small');
    }

    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    /**
     * Using the CurrentPageReference, check if the app is 'commeditor'.
     *
     * If the app is 'commeditor', then the page will use 'Draft' NavigationMenuItems.
     * Otherwise, it will use the 'Live' schema.
     */
    @wire(CurrentPageReference)
    private updateCurrentPageReference(pageRef: ExperienceContextPageReference & PageReference): void {
        this.currentPageUrl = generateUrl(this.navContext, pageRef);
    }

    @wire(getNavigationMenu, {
        navigationLinkSetDeveloperName: '$navigationLinkSetDevName',
        menuItemTypesToSkip: MENU_ITEMS_TO_SKIP,
        includeImageUrl: false,
        addHomeMenuItem: false,
    })
    private getNavigationMenuData(result: StoreAdapterCallbackEntry<{ menuItems?: NavigationMenuItemData[] }>): void {
        const { data = {} } = result;
        if (data && data.menuItems && Array.isArray(data.menuItems)) {
            // Create a copy of the data to modify it
            this._menuItems = data.menuItems.reduce(
                (menuItems: MenuItem[], menuItem: NavigationMenuItemData, index: number): MenuItem[] => {
                    if (menuItem.actionValue) {
                        const item = <MenuItem>{
                            ...menuItem,
                            id: index.toString(),
                        };
                        // push item to the menuItems
                        menuItems.push(item);
                    }
                    return menuItems;
                },
                []
            );
        } else {
            this._menuItems = [];
        }
    }

    /**
     * whether or not display menu items in Desktop.
     */
    get showMenuItemsInDesktop(): boolean {
        return this._menuItems.length > 0 && this._isDesktop;
    }

    /**
     * whether or not display menu items in Mobile.
     */
    get showMenuItemsInMobile(): boolean {
        return this._menuItems.length > 0 && !this._isDesktop;
    }

    /**
     * Gets the menu item id whose actionValue matches the currentPageUrl
     */
    get _selectedMenuItem(): string {
        return getMenuItemIdOfCurrentPage(this._menuItems, this.currentPageUrl);
    }

    /**
     * customClasses for Lightning Vertical Navigation comp
     */
    get customClassesForVerticalNavigation(): string {
        return generateVerticalPaddingClass(this._navItemSpacing);
    }

    /**
     * Gets menuItems mapped to label and value for dropdown options
     *
     * @returns {Array} An array menuItem label and value mapping
     */
    get menuItemOptions(): Record<string, string | undefined>[] {
        return this._menuItems.map((menuItem) => ({
            label: menuItem.label,
            value: menuItem.id,
        }));
    }

    /**
     *  Gets the placeholder label for the combobox
     */
    get menuSelectorPlaceholderLabel(): string {
        return menuSelectorPlaceholderText;
    }

    /**
     *  Gets the label for the combobox
     */
    get menuSelectorLabel(): string {
        return menuSelectorLabel;
    }

    /**
     * onSelect event handler for Lightning Vertical Navigation comp
     * @param event
     * @private
     */
    private handleMenuItemClicked(event: CustomEvent): void {
        this.handleMenuItemNavigation(event?.detail?.name);
    }

    /**
     * onChange event handler for Lightning Combobox comp
     * @param event
     * @private
     */
    private handleMenuItemChange(event: CustomEvent): void {
        this.handleMenuItemNavigation(event?.detail?.value);
    }

    /**
     * navigate to the selected Menu Item
     * @param selectedMenuItem
     */
    private handleMenuItemNavigation(selectedMenuItem: string): void {
        if (selectedMenuItem && this._selectedMenuItem !== selectedMenuItem) {
            const menuItem = this._menuItems.find((menu) => menu.id === selectedMenuItem);
            if (menuItem && menuItem.actionValue) {
                if (menuItem.actionType === 'InternalLink') {
                    navigate(this.navContext, {
                        type: 'standard__webPage',
                        attributes: {
                            url: menuItem.actionValue,
                        },
                    });
                } else if (menuItem.actionType === 'ExternalLink') {
                    window.open(
                        menuItem.actionValue,
                        menuItem.target === 'NewWindow' ? '_blank' : '_self',
                        'noopener,noreferrer'
                    );
                }
            }
        }
    }
}
