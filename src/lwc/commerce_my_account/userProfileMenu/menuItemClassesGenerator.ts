import { classSet } from 'lightning/utils';

/**
 * @param hasFocus, true if menu item is in focus
 * @param hasBorder, true if menu item should have a border
 *
 * @return the CSS classes for menu item
 */
export function cssClassesForMenuItem(hasFocus: boolean, hasBorder: boolean): string {
    return classSet('slds-text-color_default slds-truncate')
        .add({
            'slds-border_bottom': hasBorder,
            'menu-item': !hasFocus,
            'menu-item_hover': hasFocus,
            'menu-item-bg-hover-color': hasFocus,
            'profile-menu-item': !hasFocus,
            'profile-menu-item_hover': hasFocus,
        })
        .toString();
}
