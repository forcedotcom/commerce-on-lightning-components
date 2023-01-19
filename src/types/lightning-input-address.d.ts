import { LightningElement } from 'lwc';

declare module 'lightning/inputAddress' {
    class LightningInputAddress extends LightningElement {
        public type: string;
        public label: string;
        public checked: boolean;
        public value: any;
        public readOnly: boolean;
        public street: string;
        public streetLabel: string;
        public cityLabel: string;
        public countryLabel: string;
        public provinceLabel: string;
        public postalCodeLabel: string;
        public checkValidity: () => boolean;
        public reportValidity: () => boolean;
    }

    export default LightningInputAddress;
}
