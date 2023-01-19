/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types */
import { LightningElement } from 'lwc';
declare module 'lightning/modal' {
    class LightningModal extends LightningElement {
        static open(props?: Record<string, unknown>): Promise;
        public close(data?: any): any;

        public size: string;
        public description: string;
    }

    export default LightningModal;
}