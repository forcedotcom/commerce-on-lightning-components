import { LightningElement, api } from 'lwc';
import { coerceStringProperty, coerceBooleanProperty } from 'experience/coercion';
import addressCardStyleStringGenerator from './addressCardStyleStringGenerator';
import { AddressLabel } from './labels';
import { getCustomLocale, isLastNameFirstCountry } from 'commerce_unified_checkout/internationalization';

const DEFAULTS = {
    address: AddressLabel,
    defaultBadgeColor: 'var(--dxp-g-root)',
    defaultBorderRadius: '0',
};

/**
 * My Account Address
 *
 * */
export default class MyAccountAddressCard extends LightningElement {
    public static renderMode = 'light';
    private _addressType = '';
    private _isDefault = false;
    private _street = '';
    private _city = '';
    private _country = '';
    private _postalCode = '';
    private _defaultBadgeColor = DEFAULTS.defaultBadgeColor;
    private _defaultBorderRadius = DEFAULTS.defaultBorderRadius;
    private _defaultBadgeLabel = '';

    /**
     * Gets or Sets the name property on address record
     */

    @api name: string | undefined;

    /**
     * Gets or Sets the first name property on address record
     */
    @api firstName: string | undefined;

    /**
     * Gets or Sets the last name property on address record
     */
    @api lastName: string | undefined;

    /**
     * Gets or Sets the addressType property on address record
     */
    @api
    get addressType(): string {
        return this._addressType;
    }
    set addressType(value: string) {
        this._addressType = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the isDefault property on address record
     */
    @api
    get isDefault(): boolean {
        return this._isDefault;
    }
    set isDefault(value: boolean) {
        this._isDefault = coerceBooleanProperty(value);
    }

    /**
     * Gets or Sets the street property on address record
     */
    @api
    get street(): string {
        return this._street;
    }
    set street(value: string) {
        this._street = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the city property on address record
     */
    @api
    get city(): string {
        return this._city;
    }
    set city(value: string) {
        this._city = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the region property on address record
     */
    @api region: string | undefined;

    /**
     * Gets or Sets the country property on address record
     */
    @api
    get country(): string {
        return this._country;
    }
    set country(value: string) {
        this._country = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the postal code property on address record
     */
    @api
    get postalCode(): string {
        return this._postalCode;
    }
    set postalCode(value: string) {
        this._postalCode = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the color of the default badge
     */
    @api
    get defaultBadgeColor(): string {
        return this._defaultBadgeColor;
    }
    set defaultBadgeColor(value: string) {
        this._defaultBadgeColor = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the border radius of the default badge
     */
    @api
    get defaultBorderRadius(): string {
        return this._defaultBorderRadius;
    }
    set defaultBorderRadius(value: string) {
        this._defaultBorderRadius = coerceStringProperty(value, '');
    }

    /**
     * Gets or Sets the label of the default badge
     */
    @api
    get defaultBadgeLabel(): string {
        return this._defaultBadgeLabel;
    }
    set defaultBadgeLabel(value: string) {
        this._defaultBadgeLabel = coerceStringProperty(value, '');
    }

    get showDefaultLabel(): boolean {
        return this.isDefault && this.defaultBadgeLabel !== '';
    }

    /**
     * Gets the default badge style from the corresponding styling builder properties
     */
    get defaultBadgeStyle(): string {
        const styles = {
            'default-badge-bg-color': this.defaultBadgeColor,
            'default-badge-border-radius': `${this.defaultBorderRadius}px`,
        };
        return addressCardStyleStringGenerator.defaultBadgeStyle.createForStyles(styles);
    }

    get customLocale(): string {
        return getCustomLocale(this.country);
    }

    get normalisedName(): string | undefined {
        if (this.firstName && this.lastName) {
            return this.concatenatedName();
        }
        return this.name;
    }

    private concatenatedName(): string {
        return isLastNameFirstCountry(this.country)
            ? `${this.lastName} ${this.firstName}`
            : `${this.firstName} ${this.lastName}`;
    }
}
