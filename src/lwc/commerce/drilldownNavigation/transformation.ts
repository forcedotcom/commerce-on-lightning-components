import { uuidv4 } from 'experience/util';
import type { MenuItem } from './types';
import type { MenuItemApi } from '../navigationMenu/types';
import { newTabLabel } from './labels';

/**
 * MAX_DEPTH is 5 because the first level is the parent menu and we are only allowing up to 4 submenu levels.
 */
const MAX_DEPTH = 5;
enum WINDOW_TARGET {
    BLANK = '_blank',
    SELF = '_self',
}

export const toMenuItems = (items: MenuItemApi[], level = 1): MenuItem[] => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items.map(({ actionType, actionValue, active, label, subMenu, target }) => {
        const result: MenuItem = {
            id: uuidv4(),
            label,
            active,
            target,
            href: actionValue,
            type: actionType,
        };

        if (target === 'NewWindow') {
            result.ariaLabel = newTabLabel.replace('{0}', label);
            result.target = WINDOW_TARGET.BLANK;
        } else {
            result.target = WINDOW_TARGET.SELF;
        }

        // Only 5 levels of submenus are allowed.
        if (Array.isArray(subMenu) && subMenu.length && level < MAX_DEPTH) {
            result.subMenu = toMenuItems(subMenu, level + 1);
        }

        return result;
    });
};
