/* eslint-disable no-undef */
declare namespace NodeJS {
    interface Global {
        __B2C_SSR__?: boolean;
        __B2C_SSRCONTEXT__?: SsrContext;
    }
}

/* Allow importing of HTML modules */
declare module '*.html' {
    const value: any;
    export default value;
}