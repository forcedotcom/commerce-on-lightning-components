export declare type SelectedVariant = {
    isValid?: boolean;
    options?: string[];
};

/**
 * Lightning base component "lighting-dialog"
 * https://github.com/salesforce/lightning-components/tree/master/ui-lightning-components/src/main/modules/lightning/dialog
 */
export interface LightningDialog {
    showModal(): void;
    close(): void;
}

export declare type QuantityGuides = {
    minimumValueGuideText?: string;
    maximumValueGuideText?: string;
    incrementValueGuideText?: string;
};

export declare type Rule = {
    text: string;
    valueText: string;
    value: string;
};

export declare type RuleSet = {
    incrementText: string;
    minimumText: string;
    maximumText: string;
    combinedText: string;
};

export declare type SelectedQuantityEvent = {
    quantity: string;
};
