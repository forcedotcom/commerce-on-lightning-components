import { LightningElement } from 'lwc';
declare module 'lightning/buttonIcon' {
    class LightningButton extends LightningElement {
        public value: any;
        public label: string;
    }

    export default LightningButton;
}
