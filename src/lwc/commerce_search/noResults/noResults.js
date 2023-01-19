import { LightningElement, api } from 'lwc';
/**
 * A UI for no results.
 **/
export default class NoResults extends LightningElement {
    /**
     * No results rich text HTML body
     *
     * @type {string}
     */
    @api
    bodyRichText = '';
}
