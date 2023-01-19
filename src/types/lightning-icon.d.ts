import { LightningElement } from 'lwc';
declare module 'lightning/icon' {
    class Icon extends LightningElement{
        public iconName: string;
        public alternativeText: string;
        public size: string;
        public variant: string;
    }

    export default Icon;
}
