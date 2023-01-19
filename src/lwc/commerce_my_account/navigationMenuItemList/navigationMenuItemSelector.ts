import type { MenuItem } from 'commerce_my_account/navigationMenuItemList';

/**
 * Gets the menu item id whose actionValue matches the currentPageUrl
 * @param menuItems
 * @param currentPageUrl
 */
export function getMenuItemIdOfCurrentPage(
    menuItems: MenuItem[] | undefined | null,
    currentPageUrl: string | undefined | null
): string {
    const menuItem =
        currentPageUrl &&
        menuItems &&
        menuItems.find(
            (menu) =>
                menu.actionValue &&
                (currentPageUrl === menu.actionValue ||
                    (currentPageUrl.indexOf('?') > -1 &&
                        currentPageUrl.substring(0, currentPageUrl.indexOf('?')) === menu.actionValue))
        );
    return menuItem ? menuItem.id : '';
}
