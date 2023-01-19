import { LightningElement } from 'lwc';
declare module 'lightning/dialog' {
    class Dialog extends LightningElement{
        public showModal(): void;
        public close(): void;
    }

    export default Dialog ;
}
