export interface MenuItem {
    id: string | number;
    label: string;
    subMenu?: MenuItem[];
    active?: boolean | null;
    width?: string;
    hidden?: boolean;
    liClassList?: string;
    href?: string | null | undefined;
    type?: string | null | undefined;
    target?: string | null | undefined;
    ariaLabel?: string | null | undefined;
}
