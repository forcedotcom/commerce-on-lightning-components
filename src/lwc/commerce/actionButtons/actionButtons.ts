import { LightningElement, api } from 'lwc';
import { generateStyleClass, generateSizeClass } from 'dxp_styling/sldsButtonClassGenerator';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | undefined;

type ButtonSize = 'small' | 'large' | undefined;

export default class ActionButtons extends LightningElement {
    /**
     * Enable the component to render as light DOM
     */
    public static renderMode = 'light';

    /**
     *  first action button name
     */
    @api firstActionButtonText: string | undefined;

    /**
     * second action button name
     */
    @api secondActionButtonText: string | undefined;

    /**
     * first button variant e.g. primary
     */
    @api firstButtonVariant: ButtonVariant;

    /**
     * second button variant e.g. secondary
     */
    @api secondButtonVariant: ButtonVariant;

    /**
     * The size of button e.g. large
     */
    @api size: ButtonSize;

    /**
     * The spacing between button e.g. small, medium, large
     */
    @api buttonSpacing: undefined | 'none' | 'small' | 'medium' | 'large';

    /**
     * The alignment of button (left/center/right)
     */
    @api alignment: undefined | 'left' | 'right' | 'center';

    /**
     * Gets text decoration  classes to apply to first button.
     *
     */
    @api firstButtonTextDecorationClass: string | undefined;

    /**
     * Gets text decoration classes to apply to second button.
     *
     */
    @api secondButtonTextDecorationClass: string | undefined;

    /**
     * Gets CSS classes to apply to first button.
     *
     */
    get firstButtonCustomClasses(): string {
        return `slds-button action_truncate ${generateStyleClass(this.firstButtonVariant)} ${generateSizeClass(
            this.size
        )} ${this.firstButtonTextDecorationClass}`;
    }

    /**
     * Gets CSS classes to apply to second button.
     *
     */
    get secondButtonCustomClasses(): string {
        return `slds-button action_truncate ${generateStyleClass(this.secondButtonVariant)} ${generateSizeClass(
            this.size
        )} ${this.secondButtonTextDecorationClass}`;
    }

    /**
     * Gets CSS classes to apply to container of the button group.
     *
     */
    get actionButtonContainerClass(): string {
        return `action-buttons action-buttons_${this.alignment} action-buttons_${this.buttonSpacing}`;
    }

    /**
     * pass the first action button click event to the parent
     */
    handleFirstActionButtonClick(): void {
        this.dispatchEvent(
            new CustomEvent('firstaction', {
                bubbles: true,
                cancelable: true,
                composed: true,
            })
        );
    }

    /**
     * pass the second action button click event to the parent
     */
    handleSecondActionButtonClick(): void {
        this.dispatchEvent(
            new CustomEvent('secondaction', {
                bubbles: true,
                cancelable: true,
                composed: true,
            })
        );
    }
}
