import { LightningElement } from 'lwc';
declare module 'lightning/combobox' {
    class Combobox extends LightningElement{
        public value: any;
        public placeholder: any;
    }

    export default Combobox ;
}
