import { LightningElement, api } from 'lwc';
import { generateAlignmentClass } from './buttonStyleUtils';
import { generateStyleClass, generateSizeClass, generateStretchClass } from 'dxp_styling/sldsButtonClassGenerator';
import type { ButtonVariant, ButtonSize, ButtonWidth, ButtonAlignment } from './types';
export type { ButtonVariant, ButtonSize, ButtonWidth, ButtonAlignment } from './types';

/**
 * @fires ReorderButton#reorder
 */

export default class ReorderButton extends LightningElement {
    static renderMode = 'light';

    /**
     * @description Button variant
     * @type {ButtonVariant}
     */
    @api public variant: ButtonVariant;

    /**
     * @description Button size
     * @type {ButtonSize}
     */
    @api public size: ButtonSize;

    /**
     * @description Button width
     * @type {ButtonWidth}
     */
    @api public width: ButtonWidth;

    /**
     * @description Button alignment on the page
     * @type {ButtonAlignment | undefined}
     */
    @api public alignment: ButtonAlignment;

    /**
     * @description Button text
     * @type {string | undefined}
     */
    @api public buttonText: string | undefined;

    /**
     * @description Handle the click of the Reorder button
     */
    handleReorderClick(): void {
        const reorderEvent = new CustomEvent('reorder');
        this.dispatchEvent(reorderEvent);
    }

    /**
     * @description generates classes for reorder button styling
     * @type {string}
     */
    get customButtonClasses(): string {
        const classes = [
            'slds-button',
            generateStyleClass(this.variant),
            generateSizeClass(this.size),
            generateStretchClass(this.width),
        ];
        return classes.join(' ');
    }

    get alignmentClasses(): string {
        return ['slds-grid', generateAlignmentClass(this.alignment)].join(' ');
    }
}
