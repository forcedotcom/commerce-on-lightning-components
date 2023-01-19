import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class ReorderModal extends LightningModal {
    /**
     * @description The unique identifier of order summary
     * @type {string}
     */
    @api orderSummaryId: string | undefined;

    /**
     * @description URL for View Cart button in modal
     * @type {string}
     */
    @api cartUrl: string | undefined;

    /**
     * @description Handle the click of the "View Cart" button
     */
    handleViewCart(): void {
        const viewcart = new CustomEvent('viewcart');
        this.dispatchEvent(viewcart);
        this.handleClose();
    }

    /**
     * @description Closes the modal
     */
    handleClose(): void {
        this.close('close');
    }
}
