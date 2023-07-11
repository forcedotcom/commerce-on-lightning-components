/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api } from 'lwc';
import LightningModal from 'lightning/modal';

/**
 * Modal for defining and handling primary and secondary actions.
 * The modal will close by default on either action click unless the event
 * is cancelled by the consumer.
 * @fires CommonModal#primaryactionclick
 * @fires CommonModal#secondaryactionclick
 * @example
 *  CommonModal.open({
 *    label: 'Custom Modal', // <-- Required
 *    size: 'small', // <-- Optional, defaults to 'medium'
 *    description: 'This is a custom modal showcase', // <-- Optional
 *    secondaryActionLabel: 'Cancel', // <-- Required
 *    primaryActionLabel: 'Submit', // <-- Required
 *    onprimaryactionclick: () => { // <-- Optional, default just closes the modal
 *      this.handleNavigateToCart();
 *    },
 *    onsecondaryactionclick: () => { // <-- Optional, default just closes the modal
 *      // ...
 *    },
 *  });
 * @example Manual `close` handling
 *  CommonModal.open({
 *    label: 'Custom Modal',
 *    secondaryActionLabel: 'Cancel',
 *    primaryActionLabel: 'Submit',
 *    onprimaryactionclick: async (event) => {
 *      event.preventDefault(); // <-- Prevents the standard behaviour, i.e. closing the modal
 *
 *      // Execute custom behavior
 *      await this.handleNavigateToCart();
 *      event.detail.close('myReason'); // <-- Close the modal manually with a custom result
 *    },
 *  });
 */
export default class CommonModal extends LightningModal {
    /**
     * Sets the modal's title and assistive device label.
     * @type {?string}
     */
    @api
    label;

    /**
     * An optional message to display to the customer.
     * @type {?string}
     */
    @api
    message;

    /**
     * The label for the primary action. If no label is provided, the action is omitted.
     * @type {?string}
     */
    @api
    primaryActionLabel;

    /**
     * The label for the secondary action. If no label is provided, the action is omitted.
     * @type {?string}
     */
    @api
    secondaryActionLabel;

    /**
     * Whether to show the primary action.
     * @type {boolean}
     * @readonly
     * @private
     */
    get hasPrimaryAction() {
        return Boolean(this.primaryActionLabel);
    }

    /**
     * Whether to show the secondary action.
     * @type {boolean}
     * @readonly
     * @private
     */
    get hasSecondaryAction() {
        return Boolean(this.secondaryActionLabel);
    }

    /**
     * Whether the modal has a message/body.
     * @type {boolean}
     * @readonly
     * @private
     */
    get hasMessageText() {
        return typeof this.message === 'string' && this.message.trim().length > 0;
    }

    /**
     * Handles the click on the primary action.
     * @readonly
     * @private
     */
    handlePrimaryAction() {
        this.handleAction('primary');
    }

    /**
     * Handles the click on the secondary action.
     * @readonly
     * @private
     */
    handleSecondaryAction() {
        this.handleAction('secondary');
    }

    /**
     * This method dispatches either the primary or secondary action click event,
     * and ensures that the modal automatically closes itself, unless the consumer
     * calls {@link CustomEvent.prototype.preventDefault}.
     * @param {('primary' | 'secondary')} eventType
     *   The type of the emitted event
     * @private
     */
    handleAction(eventType) {
        const event = new CustomEvent(`${eventType}actionclick`, {
            cancelable: true,
            detail: {
                close: (result) => {
                    event.preventDefault();
                    this.close(result);
                },
            },
        });
        this.dispatchEvent(event);
        if (!event.defaultPrevented) {
            this.close(eventType);
        }
    }
}
