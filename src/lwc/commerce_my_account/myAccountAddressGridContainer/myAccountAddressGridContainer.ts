import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import type { CommerceAddressListPageReference } from 'types/common';
import { coerceStringProperty } from 'experience/coercion';
import type { MyAccountAddress } from 'commerce/myAccountApi';
import { ShippingLabel, BillingLabel } from './labels';
// This was added for this component as per discussion on https://salesforce.quip.com/Kj26A1vhvioZ and not a repeatable pattern
import hasAccountAddressManager from '@salesforce/userPermission/AccountAddressManager';

const DEFAULTS = {
    itemSpacing: 'medium',
    pageSize: '10',
    shippingAndBilling: 'Shipping and billing',
    shippingTabLabel: ShippingLabel,
    billingTabLabel: BillingLabel,
};

/**
 * This is the top level component of address management with header
 * */
export default class MyAccountAddressGridContainer extends LightningElement {
    /**
     * This component can not yet be migrated to light-dom because the LightningTabset component
     * does flip the order of the tabs in light-dom.
     *
     * public static renderMode = 'light';
     */

    private _shippingAddresses: MyAccountAddress[] = [];
    private _billingAddresses: MyAccountAddress[] = [];

    private _pageSize = DEFAULTS.pageSize;
    private _itemSpacing = DEFAULTS.itemSpacing;
    private _cardDefaultBadgeColor = '';
    private _cardDefaultBorderRadius = '';
    private _cardDefaultLabel = '';
    private _footerEditLabel = '';
    private _footerDeleteLabel = '';
    private _showMoreButtonLabel = '';
    private _showMoreButtonStyle = '';
    private _showMoreButtonSize = '';
    private _showMoreButtonWidth = '';
    private _showMoreButtonAlign = '';
    private _previewAccountId = '';
    private _showAddressType = '';
    private _noAddressMessageTitle = '';
    private _noAddressMessageText = '';
    private _errorMessage = '';
    private _errorListener = (ev: Event): void => this.handleAddressErrors(ev as CustomEvent);

    /**
     * Get the current page reference to extract query parameter "orderNumber"
     */
    @wire(CurrentPageReference)
    private pageRef?: CommerceAddressListPageReference;

    /**
     * dummy previewAccountId to support accountId property on design substitute
     *
     */
    @api
    get previewAccountId(): string {
        return this._previewAccountId;
    }
    set previewAccountId(value: string) {
        this._previewAccountId = coerceStringProperty(value, '');
    }

    /**
     * get the list of shipping addresses from store adapter
     */
    @api
    get shippingAddresses(): MyAccountAddress[] {
        return this._shippingAddresses;
    }
    set shippingAddresses(addressList: MyAccountAddress[]) {
        this._shippingAddresses = addressList;
    }

    /**
     * get the list of billing addresses from store adapter
     */
    @api
    get billingAddresses(): MyAccountAddress[] {
        return this._billingAddresses;
    }
    set billingAddresses(addressList: MyAccountAddress[]) {
        this._billingAddresses = addressList;
    }

    /**
     * Specifies the pageSize of the address grid
     */
    @api
    get pageSize(): string {
        return this._pageSize;
    }
    set pageSize(value: string) {
        this._pageSize = coerceStringProperty(value, '');
    }

    /**
     * Specifies the item spacing between grid items(small,medium,large)
     */
    @api
    get itemSpacing(): string {
        return this._itemSpacing;
    }
    set itemSpacing(value: string) {
        this._itemSpacing = coerceStringProperty(value, '');
    }

    /**
     * showAddressType property which loads 'shipping' (vs) 'shipping and billing' address types
     */
    @api
    get showAddressType(): string {
        return this._showAddressType;
    }
    set showAddressType(value: string) {
        this._showAddressType = coerceStringProperty(value, '');
    }

    /**
     * shipping tab label
     */
    @api shippingTabLabel = DEFAULTS.shippingTabLabel;

    /**
     * billing tab label
     */
    @api billingTabLabel = DEFAULTS.billingTabLabel;

    /**
     * Gets or Sets the message title for no addresses scenario
     */
    @api
    get noAddressMessageTitle(): string {
        return this._noAddressMessageTitle;
    }
    set noAddressMessageTitle(value: string) {
        this._noAddressMessageTitle = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the message text for no addresses scenario
     */
    @api
    get noAddressMessageText(): string {
        return this._noAddressMessageText;
    }
    set noAddressMessageText(value: string) {
        this._noAddressMessageText = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the color of the default badge of the address card component
     */
    @api
    get cardDefaultBadgeColor(): string {
        return this._cardDefaultBadgeColor;
    }
    set cardDefaultBadgeColor(value: string) {
        this._cardDefaultBadgeColor = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the border radius of the default badge of the address card component
     */
    @api
    get cardDefaultBorderRadius(): string {
        return this._cardDefaultBorderRadius;
    }
    set cardDefaultBorderRadius(value: string) {
        this._cardDefaultBorderRadius = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the label of the default badge of the address card component
     */
    @api
    get cardDefaultLabel(): string {
        return this._cardDefaultLabel;
    }
    set cardDefaultLabel(value: string) {
        this._cardDefaultLabel = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the edit label of footer in the footer component
     */
    @api
    get footerEditLabel(): string {
        return this._footerEditLabel;
    }
    set footerEditLabel(value: string) {
        this._footerEditLabel = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the delete label of the footer in the footer component
     */
    @api
    get footerDeleteLabel(): string {
        return this._footerDeleteLabel;
    }
    set footerDeleteLabel(value: string) {
        this._footerDeleteLabel = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the label of the Show More button
     */
    @api
    get showMoreButtonLabel(): string {
        return this._showMoreButtonLabel;
    }
    set showMoreButtonLabel(value: string) {
        this._showMoreButtonLabel = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the style of Show More button
     */
    @api
    get showMoreButtonStyle(): string {
        return this._showMoreButtonStyle;
    }
    set showMoreButtonStyle(value: string) {
        this._showMoreButtonStyle = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the size of Show More button
     */
    @api
    get showMoreButtonSize(): string {
        return this._showMoreButtonSize;
    }
    set showMoreButtonSize(value: string) {
        this._showMoreButtonSize = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the size of Show More button
     */
    @api
    get showMoreButtonWidth(): string {
        return this._showMoreButtonWidth;
    }
    set showMoreButtonWidth(value: string) {
        this._showMoreButtonWidth = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the size of Show More button
     */
    @api
    get showMoreButtonAlign(): string {
        return this._showMoreButtonAlign;
    }
    set showMoreButtonAlign(value: string) {
        this._showMoreButtonAlign = coerceStringProperty(value, '');
    }

    /**
     * Determines if we need to show only 'shipping' vs 'shipping and billing' addresses
     */
    get showBothAddressTypes(): boolean {
        return this.showAddressType === DEFAULTS.shippingAndBilling;
    }

    get activeTabValue(): string {
        return this.pageRef?.state?.addressType || 'Shipping';
    }

    /**
     * Determines if buyer/shopper have AccountAddressManager user perm
     */
    get isManageAccountAddress(): boolean {
        return hasAccountAddressManager;
    }
    /**
     * use connected callback to add event listeners
     *
     */
    public connectedCallback(): void {
        this.addEventListener('addresserror', this._errorListener);
    }

    /**
     * use disconnected callback to remove event listeners
     *
     */
    public disconnectedCallback(): void {
        this.removeEventListener('addresserror', this._errorListener);
    }

    private handleAddressErrors(event: CustomEvent): void {
        this._errorMessage = event.detail?.value;
    }

    private handleDismissNotification(): void {
        this._errorMessage = '';
    }
}
