/* eslint-disable-next-line @lwc/lwc/no-disallowed-lwc-imports */
import type { WireAdapterConstructor } from 'lwc';
import type { LightningNavigationContext, PageReference } from 'types/common';

export declare const CurrentPageReference: (...args: unknown[]) => void;

export declare const NavigationContext: WireAdapterConstructor;

export declare function navigate(
    context: LightningNavigationContext,
    pageReference: PageReference,
    options?: boolean | Record<string, unknown>
): void;

export declare function generateUrl(context: LightningNavigationContext, route: PageReference): string;
