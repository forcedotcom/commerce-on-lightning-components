import { api, LightningElement, wire } from 'lwc';
import { coerceBooleanProperty, coerceStringProperty } from 'experience/coercion';
import type { MyAccountAddress, MyAccountAddressResponse } from 'commerce/myAccountApi';
import { MyAccountAddressesAdapter } from 'commerce/myAccountApi';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { getErrorInfo } from 'commerce_my_account/errorHandler';
import type { SessionContext } from 'commerce/contextApi';
import { SessionContextAdapter } from 'commerce/contextApi';

import {
    generateAlignClass,
    generateSizeClass,
    generateStretchClass,
    generateStyleClass,
} from './showMoreButtonClassGenerator';
import type MyAccountAddressFooter from 'commerce_my_account/myAccountAddressFooter';

const DEFAULTS = {
    itemSpacing: 'medium',
    pageSize: '10',
    sortOrder: 'CreatedDateDesc',
};

export default class MyAccountAddressGrid extends LightningElement {
    public static renderMode = 'light';

    private _myAddresses: MyAccountAddress[] = [];
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
    private _showAddressType = '';
    private _noAddressMessageTitle = '';
    private _noAddressMessageText = '';
    private _showShowMoreAddressesButton = false;
    private _showEmptyState = false;
    public _addressLimitIncrease = 0;
    private _addressType = '';
    private isPreviewMode = false;
    private _previewAccountId = '';
    private _accountId = '';
    private _showAddressResponse = true;
    private _isShowMoreClicked = false;
    private _dataLoaded = false;
    private _isAccountAddressManager = true;

    @wire(SessionContextAdapter)
    updateSessionContext({ data }: StoreAdapterCallbackEntry<SessionContext>): void {
        this.isPreviewMode = data?.isPreview === true;
        if (this.isPreviewMode) {
            if (this.previewAccountId !== '') {
                this._accountId = this.previewAccountId;
            } else {
                this._showAddressResponse = false;
                this._showShowMoreAddressesButton = true;
            }
        }
    }

    @wire(MyAccountAddressesAdapter, {
        accountId: '$accountId',
        pageSize: '$_addressLimitIncrease',
        addressType: '$addressType',
        sort: DEFAULTS.sortOrder,
    })
    AddressesHandler(response: StoreAdapterCallbackEntry<MyAccountAddressResponse>): void {
        if (this._showAddressResponse && response?.data?.items) {
            // here we show an ordered subset of all available addresses non-default addresses
            // ensuring default address (loaded elsewhere) remains first
            const otherAddresses = response.data.items.filter((item) => !item.isDefault);
            this._myAddresses = response.data.items.filter((item) => item.isDefault);
            this._myAddresses = this._myAddresses.concat(otherAddresses);
            this._showShowMoreAddressesButton = response?.data?.nextPageUrl ? true : false;
            this._showEmptyState = response?.data?.count === 0 ? true : false;
            this._dataLoaded = true;
        }
        if (this._showAddressResponse && response?.error) {
            this.dispatchEvent(
                new CustomEvent('addresserror', {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        value: getErrorInfo(response?.error, this.isPreviewMode),
                    },
                })
            );
        }
    }

    /**
     * previewAccountId to support accountId property on design substitute
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
     * The type of addresses showing in the grid
     */
    @api
    get addressType(): string {
        return this._addressType;
    }
    set addressType(value: string) {
        this._addressType = coerceStringProperty(value, '');
    }

    /**
     * get the list of addresses from store adapter
     *
     */
    @api
    get myAddresses(): MyAccountAddress[] {
        return this._myAddresses;
    }
    set myAddresses(addressList: MyAccountAddress[]) {
        this._myAddresses = addressList;
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
        this._addressLimitIncrease = Number(this._pageSize);
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
     * Sets show/hide show more address button for tab
     */
    @api
    public get showShowMoreAddressesButton(): boolean {
        return this._showShowMoreAddressesButton;
    }
    public set showShowMoreAddressesButton(value: boolean) {
        this._showShowMoreAddressesButton = coerceBooleanProperty(value);
    }

    /**
     * Sets show/hide show more address button for tab
     * Adding getter/setter as we need default value as true
     */
    @api
    public get isAccountAddressManager(): boolean {
        return this._isAccountAddressManager;
    }
    public set isAccountAddressManager(value: boolean) {
        this._isAccountAddressManager = value;
    }

    /**
     * Whether or not show the empty state for addresses.
     *
     * @return {boolean}
     */
    @api
    get showEmptyState(): boolean {
        return this._showEmptyState;
    }
    set showEmptyState(value: boolean) {
        this._showEmptyState = coerceBooleanProperty(value);
    }

    get gridStyleClass(): string {
        return `address-container address-grid-gap-${this.itemSpacing}`;
    }

    get accountId(): string {
        return this._accountId;
    }

    get footerDisable(): boolean {
        return !this.isAccountAddressManager && !this.isPreviewMode;
    }

    /**
     * Gets SLDS classes to apply to button.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get customButtonClasses(): string {
        return `slds-button show-more-button ${generateStyleClass(this.showMoreButtonStyle)} ${generateSizeClass(
            this.showMoreButtonSize
        )} ${generateStretchClass(this.showMoreButtonWidth)} ${generateAlignClass(this.showMoreButtonAlign)}`;
    }

    handleShowMoreAddressesClicked(): void {
        this._isShowMoreClicked = true;
        this._addressLimitIncrease = this._addressLimitIncrease + Number(this.pageSize);
    }

    /**
     * Helps set focus on the first address card of the newly added cards after "Show More" button is clicked.
     */
    renderedCallback(): void {
        if (this._isShowMoreClicked === true && this._dataLoaded === true) {
            this._dataLoaded = false;
            this._isShowMoreClicked = false;
            const allFooterComponents = this.querySelectorAll<MyAccountAddressFooter & HTMLElement>(
                'commerce_my_account-my-account-address-footer'
            );
            allFooterComponents[Number(this._addressLimitIncrease - Number(this.pageSize))]?.focusCell();
        }
    }
}
