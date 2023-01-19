import { LightningElement } from 'lwc';
declare module 'lightning/input' {
    class LightningInput extends LightningElement {
        public type: string;
        public label: string;
        public checked: boolean;
        public value: any;
        public readOnly: boolean;
        public checkValidity: () => boolean;
        public reportValidity: () => boolean;
    }

    export default LightningInput;
}
