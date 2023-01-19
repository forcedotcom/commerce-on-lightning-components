import { LightningElement } from 'lwc';
declare module 'lightning/formattedText' {
    class FormattedText extends LightningElement{
        public value: string;
    }

    export default FormattedText;
}
