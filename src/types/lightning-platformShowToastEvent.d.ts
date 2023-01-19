declare module 'lightning/platformShowToastEvent' {
    declare class ShowToastEvent extends Event {
        constructor(arg: any);

        showToast(): void;
    }
}
