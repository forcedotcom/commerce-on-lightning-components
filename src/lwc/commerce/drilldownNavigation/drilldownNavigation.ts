import { api, LightningElement } from 'lwc';
import type { MenuItem } from './types';
import { toMenuItems } from './transformation';
import type { MenuItemApi } from '../navigationMenu/types';
import { mobileTrigger } from './labels';

const CLOSE_MOBILE_EVENT = 'closemobile';
const DEFAULT_ALIGNMENT = 'left';
type Alignment = 'left' | 'center' | 'right';
export default class DrilldownNavigation extends LightningElement {
    public static renderMode = 'light';

    private _menuItems = [] as MenuItemApi[];
    private _viewMenuItems = [] as MenuItem[];
    private _orientation = 'horizontal';
    private _alignment: Alignment = DEFAULT_ALIGNMENT;
    private _mobileMenuOpen = false;
    private _showMobileTrigger = true;
    private _resizeListener: (this: Window, ev: UIEvent) => void = (): void => {
        this.computeOrientation();
    };

    renderedCallback(): void {
        this.computeOrientation();
    }

    connectedCallback(): void {
        window.addEventListener('resize', this._resizeListener);
    }

    disconnectedCallback(): void {
        window.removeEventListener('resize', this._resizeListener);
    }

    @api public get alignment(): Alignment {
        return this._alignment;
    }

    public set alignment(value: Alignment) {
        this._alignment = ['left', 'center', 'right'].includes(value) ? value : DEFAULT_ALIGNMENT;
    }

    @api public get menuItems(): MenuItemApi[] {
        return this._menuItems;
    }

    public set menuItems(val: MenuItemApi[]) {
        this.viewMenuItems = toMenuItems(val);
        this._menuItems = val;
    }

    /**
     * Show/hide the app launcher icon in the bar.
     * Only relevant for Aura templates.
     */
    @api public showAppLauncher = false;

    /**
     * Whether the current theme has mobile panel type.
     * If true, then we want to 'force' it to show the
     * list cmp and not the bar.
     */
    @api public showListView = false;

    /**
     * Whether to show "< Back" or "< {parentLabel}" in the submenus.
     */
    @api public showBackLabel = false;

    /**
     * If a theme is applied, we want to override the styles
     * for both the bar and the list cmps.
     */
    @api customThemeStylesBar = undefined;
    @api customThemeStylesList = undefined;

    /**
     * Some Aura templates and Themes have their own trigger
     * so we want to hide our own when necessary.
     */
    @api public get showMobileTrigger(): boolean {
        return this._showMobileTrigger;
    }

    public set showMobileTrigger(value: boolean) {
        this._showMobileTrigger = value;
    }

    /**
     * This is for the aura wrapper to handle the mobile visbility,
     * for both themes and regular aura templates.
     * @param toggleValue
     */
    @api
    toggleMobileView(toggleValue: boolean): void {
        this._mobileMenuOpen = toggleValue;
    }

    private get mobileTriggerLabel(): string {
        return mobileTrigger;
    }

    private get viewMenuItems(): MenuItem[] {
        return this._viewMenuItems;
    }

    private set viewMenuItems(val: MenuItem[]) {
        this._viewMenuItems = val;
    }

    private get showMobileMenu(): boolean {
        return this._orientation === 'vertical' || this.showListView;
    }

    private get mobileMenuOpen(): boolean {
        return this._mobileMenuOpen;
    }

    private computeOrientation(): void {
        const isDesktop = window.matchMedia('(min-width: 48em)').matches;
        this._orientation = isDesktop ? 'horizontal' : 'vertical';
    }

    /**
     * Shows the navigation menu in mobile view.
     */
    private handleNavigationTriggerClicked(): void {
        this._mobileMenuOpen = !this._mobileMenuOpen;
    }

    private focusMobileNavigationTrigger(): void {
        this._mobileMenuOpen = false;

        if (this._showMobileTrigger) {
            const mobileNavTrigger = <HTMLElement>this.querySelector('lightning-button-icon');
            mobileNavTrigger.focus();
        } else {
            // This is handle a11y for the global-navigation-trigger
            // or to handle closing mobile nav for themes
            // see <forceCommunity:drilldownNavigationMenu>
            this.dispatchEvent(
                new CustomEvent(CLOSE_MOBILE_EVENT, {
                    detail: {
                        mobileMenuOpened: false,
                    },
                })
            );
        }
    }
}
