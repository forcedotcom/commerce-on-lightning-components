import CardPaymentOptionLabel from '@salesforce/label/B2C_Lite_Payments.cardPaymentOptionLabel';
import Visa from '@salesforce/label/B2C_Lite_Payments.visa';
import MasterCard from '@salesforce/label/B2C_Lite_Payments.masterCard';
import AmericanExpress from '@salesforce/label/B2C_Lite_Payments.americanExpress';
import Discover from '@salesforce/label/B2C_Lite_Payments.discover';
import CardHolderNameLabel from '@salesforce/label/B2C_Lite_Payments.cardHolderNameLabel';
import CardNumberLabel from '@salesforce/label/B2C_Lite_Payments.cardNumberLabel';
import ExpiryDateLabel from '@salesforce/label/B2C_Lite_Payments.expiryDateLabel';
import CvvLabel from '@salesforce/label/B2C_Lite_Payments.cvvLabel';
import CardHolderNamePlaceholder from '@salesforce/label/B2C_Lite_Payments.cardHolderNamePlaceholder';
import CardNumberPlaceholder from '@salesforce/label/B2C_Lite_Payments.cardNumberPlaceholder';
import ExpiryDatePlaceholder from '@salesforce/label/B2C_Lite_Payments.expiryDatePlaceholder';
import CvvPlaceholder from '@salesforce/label/B2C_Lite_Payments.cvvPlaceholder';
import CvvInfo from '@salesforce/label/B2C_Lite_Payments.cvvInfo';
import CardHolderNameMissing from '@salesforce/label/B2C_Lite_Payments.cardHolderNameMissing';
import CreditCardNumberMissing from '@salesforce/label/B2C_Lite_Payments.creditCardNumberMissing';
import InvalidCreditCardNumber from '@salesforce/label/B2C_Lite_Payments.invalidCreditCardNumber';
import ExpirationDateMissing from '@salesforce/label/B2C_Lite_Payments.expirationDateMissing';
import InvalidExpirationDate from '@salesforce/label/B2C_Lite_Payments.invalidExpirationDate';
import CvvMissing from '@salesforce/label/B2C_Lite_Payments.cvvMissing';
import InvalidCvv from '@salesforce/label/B2C_Lite_Payments.invalidCvv';
import CardPaymentIframeTitle from '@salesforce/label/B2C_Lite_Payments.cardPaymentIframeTitle';
import CreditCardsAccepted from '@salesforce/label/B2C_Lite_Payments.creditCardsAccepted';

export default {
    /**
     * A label of the form "Credit Card"
     *
     * @type {String}
     */
    CardPaymentOptionLabel,
    /**
     * A label of the form "Visa"
     *
     * @type {String}
     */
    Visa,
    /**
     * A label of the form "MasterCard"
     *
     * @type {String}
     */
    MasterCard,
    /**
     * A label of the form "AmericanExpress"
     *
     * @type {String}
     */
    AmericanExpress,
    /**
     * A label of the form "Discover"
     *
     * @type {String}
     */
    Discover,
    /**
     * A label of the form "Name on Card"
     *
     * @type {String}
     */
    CardHolderNameLabel,
    /**
     * A label of the form "Credit Card Number"
     *
     * @type {String}
     */
    CardNumberLabel,
    /**
     * A label of the form "CVV"
     *
     * @type {String}
     */
    CvvLabel,
    /**
     * A label of the form "Expiry Date"
     *
     * @type {String}
     */
    ExpiryDateLabel,
    /**
     * A label of the form "Enter a name..."
     *
     * @type {String}
     */
    CardHolderNamePlaceholder,
    /**
     * A label of the form "Enter a card number..."
     *
     * @type {String}
     */
    CardNumberPlaceholder,
    /**
     * A label of the form "MM/YY"
     *
     * @type {String}
     */
    ExpiryDatePlaceholder,
    /**
     * A label of the form "Enter a CVV"
     *
     * @type {String}
     */
    CvvPlaceholder,
    /**
     * A label of the form "Find the CVV/CVC security code on the back of your credit card."
     *
     * @type {String}
     */
    CvvInfo,
    /**
     * A label of the form "Enter the card holder name."
     *
     * @type {String}
     */
    CardHolderNameMissing,
    /**
     * A label of the form "Enter the credit card number."
     *
     * @type {String}
     */
    CreditCardNumberMissing,
    /**
     * A label of the form "That doesn't seem to be a valid card number. Please try re-entering the number."
     *
     * @type {String}
     */
    InvalidCreditCardNumber,
    /**
     * A label of the form "Enter the credit card expiration date."
     *
     * @type {String}
     */
    ExpirationDateMissing,
    /**
     * A label of the form "Please enter a valid expiration date."
     *
     * @type {String}
     */
    InvalidExpirationDate,
    /**
     * A label of the form "Enter the credit card security code or CVV number."
     *
     * @type {String}
     */
    CvvMissing,
    /**
     * A label of the form "Please enter a valid CVV code."
     *
     * @type {String}
     */
    InvalidCvv,
    /**
     * A Label for the title attribute of the payment component iframe
     */
    CardPaymentIframeTitle,
    /**
     * A label for attribute aria-description for container of accepted payment methods
     */
    CreditCardsAccepted,
};
