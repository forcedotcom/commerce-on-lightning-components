declare module 'dxp_styling/sldsButtonClassGenerator' {
    export declare function generateStyleClass(style: string | undefined): string;
    export declare function generateSizeClass(size: string | undefined): string;
    export declare function generateStretchClass(width: string | undefined): string;
    export declare function generateAlignmentClass(alignment: string | undefined): string;
}

declare module 'dxp_styling/textHeadingClassGenerator' {
    export declare function generateSldsClassForSize(size: string | undefined): string;
    export declare function generateDxpClassForSize(size: string | undefined): string;
}
