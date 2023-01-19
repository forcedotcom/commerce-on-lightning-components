export declare interface Style {
    name: string;
    suffix?: string;
    value?: string | number;
}

export declare function createStyleString (
    styles: Style[] | object.<string, string | number>,
): string;

export default function selectStyles(
    styleCollection: object.<string, string | number> | undefined,
    matchingPrefix?: string | undefined
): object.<string, string | number>;

export class SimpleStyleMap {
    public styleMaps: object.<string, string>;
    
    constructor(styleMaps);
    
    public createForStyles:(styles) => object.<string, string>;
}

export class StyleStringGenerator {
    public styleMaps: object.<string, string>;
    
    constructor(styleMaps);
    
    public createForStyles:(styles:any, state?:any) => object.<string, string>;
}

export class DynamicStyleMap {
    public styleMaps: object.<string, string>;
    constructor(styleMaps);
    public static createStatefulStyleSelector:(normalStyleName: string,
        conditionalStyleName: string,
        conditionPredicate: string) => string;
}
