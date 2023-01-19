import { LightningElement, api } from 'lwc';
import type { PageReference } from 'types/common';
import type { Breadcrumb } from './types';
import { createStyleString } from 'community_styling/inlineStyles';
import componentNameLabel from '@salesforce/label/LwcComponent:commerce_builder:breadcrumbs.component_name';
import { generateSldsClassForSize } from 'dxp_styling/textHeadingClassGenerator';

export type { Breadcrumb };

/**
 * Displays breadcrumbs
 *
 * @fires Breadcrumbs#breadcrumbsclick
 */
export default class Breadcrumbs extends LightningElement {
    /**
     * An event fired when the user clicks a breadcrumb
     *
     * @event Breadcrumbs#breadcrumbsclick
     * @type {CustomEvent}
     * @property {PageReference} detail
     */

    public static renderMode = 'light';

    /**
     * The array of breadcrumbs to display.
     */
    @api public breadcrumbs?: Breadcrumb[];

    /**
     * Whether to display an anchor around the last breadcrumb.
     */
    @api public showLastItemAsLink = false;

    /**
     * Whether to hide the breadcrumbs on mobile devices.
     */
    @api public hideOnMobile = false;

    /**
     * A breadcrumb's text size.
     */
    @api public textSize?: string;

    /**
     * A breadcrumb's text color.
     */
    @api public textColor?: string;

    /**
     * A breadcrumb's link/anchor color.
     */
    @api public linkColor?: string;

    /**
     * A breadcrumb's link/anchor color on hover.
     */
    @api public linkHoverColor?: string;

    /**
     * The character to use as divider/separator between breadcrumbs.
     */
    @api public divider?: string;

    /**
     * A breadcrumb divider's text color.
     */
    @api public dividerColor?: string;

    get hasBreadcrumbs(): boolean {
        return Boolean(this.breadcrumbs?.length);
    }

    get componentNameLabel(): string {
        return componentNameLabel;
    }

    get computedTextSizeClass(): string {
        return generateSldsClassForSize(this.textSize);
    }

    get customStyles(): string {
        return createStyleString({
            '--com-c-breadcrumb-link-color': this.linkColor || 'initial',
            '--com-c-breadcrumb-link-hover-color': this.linkHoverColor || 'initial',
            '--com-c-breadcrumb-text-color': this.textColor || 'initial',
            '--com-c-breadcrumb-divider-color': this.dividerColor || 'initial',
            '--com-c-breadcrumb-divider': `'${this.divider || ''}'`,
            '--com-c-breadcrumb-hide-on-mobile': this.hideOnMobile ? 'none' : 'block',
        });
    }

    handleNavigation(event: Event & { target: HTMLAnchorElement }): void {
        const index = event.target.dataset.index;
        const pageReference = (<Breadcrumb[]>this.breadcrumbs)[Number(index)].pageReference;
        this.dispatchEvent(new CustomEvent<PageReference>('breadcrumbsclick', { detail: pageReference }));
    }
}
