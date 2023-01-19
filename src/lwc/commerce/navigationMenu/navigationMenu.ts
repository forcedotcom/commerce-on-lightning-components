import { api, LightningElement, track, wire } from 'lwc';
import { getNavigationMenu } from 'experience/navigationMenuApi';
import { coerceBooleanProperty, coerceStringProperty } from 'experience/coercion';
import type { MenuItemApi } from './types';
import { navigate, NavigationContext } from 'lightning/navigation';
import type { LightningNavigationContext } from 'types/common';
import type { InternalContext } from 'commerce/context';
import { InternalContextAdapter } from 'commerce/context';
import type { StoreAdapterCallbackEntry } from 'experience/store';

export const MENU_ITEMS_TO_SKIP = ['NavigationalTopic', 'SystemLink', 'Event', 'GlobalAction', 'Modal'];
const DEFAULT_ALIGNMENT = 'left';
type Alignment = 'left' | 'center' | 'right';

export default class NavigationMenu extends LightningElement {
    public static renderMode = 'light';

    private _internalContext?: InternalContext;
    private _showHomeLink = true;
    private _showBackLabel = true;
    private _navigationLinkSetDevName: string | null = '';
    private _alignment: Alignment = DEFAULT_ALIGNMENT;

    @track private menuItems: MenuItemApi[] = [];

    /**
     * Show/hide the Home menu item.
     * @type boolean
     */
    @api
    public get showHomeLink(): boolean {
        return this._showHomeLink;
    }

    public set showHomeLink(val: boolean) {
        this._showHomeLink = coerceBooleanProperty(val);
    }

    /**
     * Use "Back" label or the "{parentLabel}" in the submenus.
     */
    @api
    public get showBackLabel(): boolean {
        return this._showBackLabel;
    }

    public set showBackLabel(val: boolean) {
        this._showBackLabel = coerceBooleanProperty(val);
    }

    /**
     * Position the menu bar either left, center or right.
     */
    @api public get alignment(): Alignment {
        return this._alignment;
    }

    public set alignment(value: Alignment) {
        this._alignment = ['left', 'center', 'right'].includes(value) ? value : DEFAULT_ALIGNMENT;
    }

    @api
    public get navigationMenuEditor(): string | null {
        return this._navigationLinkSetDevName;
    }

    public set navigationMenuEditor(value: string | null) {
        this._navigationLinkSetDevName = coerceStringProperty(value, '');
        // this is needed to force trigger the wire adapter call; the setter is called when a change in the menu editor
        // was saved but the value doesn't change, it's the same string as before and that's why the wire adapter doesn't
        // notice a change
        this.triggerNavigationWire();
    }

    @wire(InternalContextAdapter)
    private updateInternalContext(entry: StoreAdapterCallbackEntry<InternalContext>): void {
        this._internalContext = entry.data;
    }

    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    @wire(getNavigationMenu, {
        navigationLinkSetDeveloperName: '$navigationMenuEditor',
        menuItemTypesToSkip: MENU_ITEMS_TO_SKIP,
        addHomeMenuItem: '$showHomeLink',
        includeImageUrl: false,
    })
    private getNavigationMenuData(result: { data: { menuItems: MenuItemApi[] } }): void {
        this.menuItems = result?.data?.menuItems;
    }

    /**
     * TODO: replace with simple reload when W-10538960 is done
     * @private
     */
    private triggerNavigationWire(): void {
        const tmp = this._navigationLinkSetDevName;
        this._navigationLinkSetDevName = null;
        this._navigationLinkSetDevName = tmp;
    }

    handleNavigateToPage(event: CustomEvent): void {
        const { type, href, target } = event.detail;
        let navUrl = href;

        if (!href) {
            return;
        }

        event.stopPropagation();

        // TODO(seckardt,priand): W-9678712
        //  This code here is a dirty workaround to make the navigation work in off-core mode.
        //  We need to target a better solution/removal.
        if (type === 'InternalLink' && href) {
            const { urlPathPrefix = '' } = <InternalContext>this._internalContext;
            if (urlPathPrefix && href.startsWith(urlPathPrefix)) {
                navUrl = href.substr(urlPathPrefix.length);
            }

            navigate(this.navContext, {
                type: 'standard__webPage',
                attributes: {
                    url: navUrl,
                },
            });
        } else if (type === 'ExternalLink') {
            window.open(href, target, 'noopener,noreferrer');
        }
    }
}
