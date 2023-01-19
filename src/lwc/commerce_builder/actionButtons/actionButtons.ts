import { LightningElement, api } from 'lwc';

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
     * first button text decoration e.g. bold, italic
     */
    @api firstActionButtonTextDecoration: string | undefined;

    /**
     * second button text decoration e.g. bold, italic
     */
    @api secondActionButtonTextDecoration: string | undefined;

    /**
     * The size of button e.g large
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
     * Gets SLDS classes to apply to first button.
     *
     */
    get parsedFirstButtonTextDecoration(): string {
        return `${this.generateTextDecorationClass(JSON.parse(this.firstActionButtonTextDecoration ?? '{}'))}`;
    }

    /**
     * Gets SLDS classes to apply to second button.
     *
     */
    get parsedSecondButtonTextDecoration(): string {
        return `${this.generateTextDecorationClass(JSON.parse(this.secondActionButtonTextDecoration ?? '{}'))} `;
    }

    private isText(parsedTextDecoration: object, property: string): boolean {
        return parsedTextDecoration[property as keyof object];
    }

    generateTextDecorationClass(parsedTextDecoration: object): string {
        const textDecorationClass = '';
        return textDecorationClass
            .concat(this.isText(parsedTextDecoration, 'bold') ? 'label-bold ' : '')
            .concat(this.isText(parsedTextDecoration, 'italic') ? 'label-italic ' : '')
            .concat(this.isText(parsedTextDecoration, 'underline') ? 'label-underline' : '');
    }
}
