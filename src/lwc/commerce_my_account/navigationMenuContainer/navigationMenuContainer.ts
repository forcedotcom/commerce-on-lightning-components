import { LightningElement, api } from 'lwc';
/**
 *
 * @slot welcomeMessage
 * @slot navigationMenuItemList
 */
export default class NavigationMenuContainer extends LightningElement {
    public static renderMode = 'light';

    /**
     * backgroundColor of the component. It should be a valid CSS color representation.
     */
    @api backgroundColor?: string | null;

    private get computeStyle(): string {
        return `--com-c-navigation-menu-container-background-color_wide:${this.backgroundColor}`;
    }
}
