import { LightningElement } from 'lwc';
declare module 'lightning/spinner' {
    class Spinner extends LightningElement{
        public alternativeText: string;
        public variant: string;
    }

    export default Spinner;
}
