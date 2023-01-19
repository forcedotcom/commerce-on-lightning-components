import { api } from 'lwc';
import { LightningElement } from 'lwc';
import { getIconPath } from 'lightning/iconUtils';

/**
 * The string constant to load the file icon
 */
const iconName = 'utility:file';

/**
 * This component renders all the attachments associated to a product
 */
export default class ProductAttachments extends LightningElement {
    static renderMode = 'light';

    /**
     * The list of files for the product
     */
    @api
    files?: File[];

    /**
     * The icon color for each file
     */
    @api
    fileIconColor?: string;

    /**
     * Whether a file should open in a new tab
     */
    @api
    openFilesInNewTab?: boolean;

    private get normalizedFiles(): File[] {
        return this.files ?? [];
    }

    private get normalizedFileIconColor(): string {
        return this.fileIconColor ?? '';
    }

    private get normalizedTarget(): string {
        return this.openFilesInNewTab ? '_blank' : '_self';
    }

    /**
     * Returns true if there are any attachments for the product
     *
     * @type {Boolean}
     * @private
     */
    private get hasAttachments(): boolean {
        return Boolean(this.files?.length);
    }

    /**
     * Returns the desired relationship of the current page with the newly opened
     * attachment based on whether files are being opened in new tab or not.
     *
     * @type {String}
     * @private
     */
    private get documentRelationship(): string {
        return this.openFilesInNewTab ? 'nofollow noopener noreferrer' : '';
    }

    /**
     * Returns true if a valid iconURL was generated based on the iconName
     * It only checks if a iconUrl is truthy.
     *
     * @type {Boolean}
     * @private
     */
    private get hasIcon(): boolean {
        return !!this.iconUrl;
    }

    /**
     * Get the Url to render the file icon.
     * iconUtils.getIconPath() returns an empty string,
     * if the iconName is not a valid SLDS icon name.
     *
     * @type {string}
     * @private
     */
    private get iconUrl(): string {
        return getIconPath(iconName);
    }

    public renderedCallback(): void {
        this.classList.toggle('slds-hide', !this.hasAttachments);
    }
}

export interface File {
    name: string | null;
    url: string;
}
