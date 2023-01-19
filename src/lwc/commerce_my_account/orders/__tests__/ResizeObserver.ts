class MockResizeObserverEntry {
    public contentRect?: { width: number } = { width: 1024 };
}
const DEFAULT_CALLBACK_ARG: MockResizeObserverEntry[] = [];

class MockResizeObserver {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(callback: any) {
        this.callback = callback;
    }

    observe(): void {
        this.callback(MockResizeObserver._callback_arg, this);
    }

    unobserve(): void {
        /** Placeholder methods*/
    }

    disconnect(): void {
        /** Placeholder methods*/
    }

    static _callback_arg: MockResizeObserverEntry[] = DEFAULT_CALLBACK_ARG;
}

const OriginalResizeObserver = window.ResizeObserver;

function mock(callbackArg: MockResizeObserverEntry[]): void {
    window.ResizeObserver = MockResizeObserver;
    MockResizeObserver._callback_arg = callbackArg;
}

function restore(): void {
    MockResizeObserver._callback_arg = DEFAULT_CALLBACK_ARG;
    window.ResizeObserver = OriginalResizeObserver;
}
export default { mock, restore };
