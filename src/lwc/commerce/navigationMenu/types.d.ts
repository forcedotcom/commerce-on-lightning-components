export declare interface MenuItemApi {
    actionType: string;
    actionValue: string | null;
    imageUrl: string | null;
    label: string;
    subMenu?: MenuItemApi[] | null;
    target: string | null;
    active?: boolean | null;
    href?: string | null;
}
