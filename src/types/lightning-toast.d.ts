import { LightningElement } from 'lwc';

export declare type ToastConfig = {
    label: string;
    labelLinks?: Map<string, string | Map<string, string>>[];
    message?: string;
    messageLinks?: Map<string, string | Map<string, string>>[];
    variant?: 'info' | 'success' | 'warning' | 'error';
    mode?: 'dismissible' | 'pester' | 'sticky';
    onclose?: () => void;
};
export default class Toast extends LightningElement {
    static show: (config: ToastConfig, source: LightningElement) => void;
}
