import { LightningElement } from 'lwc';
declare module 'lightning/popupSource' {
    type OpenOptions = { alignment: string; size: string; autoFlip: boolean };
    class PopupSource extends LightningElement {
        public open(v: OpenOptions): void;
        public close(): void;
    }

    export default PopupSource;
}
