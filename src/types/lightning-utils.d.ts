declare module 'lightning/utils' {
    type ClassSetConfig = null | string | Record<string, boolean>;
    type ClassSetInstance = {
        add(config?: ClassSetConfig): ClassSetInstance;
        invert(): ClassSetInstance;
        toString(): string;
    }
    export declare function classSet(config?: ClassSetConfig): ClassSetInstance;
}
