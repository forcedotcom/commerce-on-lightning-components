import { LightningElement } from 'lwc';
declare module 'lightning/badge' {
    class LightningBadge extends LightningElement {
        public label: string;
    }

    export default LightningBadge;
}
