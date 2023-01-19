import { LightningElement } from 'lwc';
declare module 'lightning/button' {
    class LightningButton extends LightningElement {
        public value: any;
        public label: string;
        public variant: string;
    }

    export default LightningButton;
}
