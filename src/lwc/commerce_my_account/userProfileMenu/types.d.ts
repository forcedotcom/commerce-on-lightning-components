import type { NavigationMenuItemData } from 'experience/navigationMenuApi';

export interface MenuItem extends NavigationMenuItemData {
    id: string;
}

export interface UserProfileName {
    id: string;
    label: string;
}
