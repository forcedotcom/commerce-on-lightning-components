import ReorderModal from 'commerce_my_account/reorderModal';
import { querySelector } from 'kagekiri';
import { DEFAULT_MODAL_DATA } from './data/reorderData';
jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation(() => ({})),
});
jest.mock('lightning/navigation', () => ({
    NavigationContext: jest.fn(),
}));
const getModalElement = function (): ReorderModal & HTMLElement {
    return <ReorderModal & HTMLElement>querySelector('lightning-modal');
};
describe('commerce_my_account/reorderModal', () => {
    afterEach(() => {
        jest.clearAllMocks();
        document.body.firstChild && document.body.removeChild(document.body.firstChild);
    });
    [
        {
            property: 'orderSummaryId',
            defaultValue: undefined,
            changeValue: '123',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            ReorderModal.open(DEFAULT_MODAL_DATA);
            const modal = getModalElement();
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(modal[propertyTest.property as keyof ReorderModal]).toStrictEqual(propertyTest.defaultValue);
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(modal[propertyTest.property as keyof ReorderModal]).not.toBe(propertyTest.changeValue);
                //@ts-ignore
                modal[propertyTest.property as keyof ReorderModal] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(modal[propertyTest.property as keyof ReorderModal]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });
    it('Should close modal on receiving the close event', () => {
        const promise = ReorderModal.open({ label: 'Modal Heading' });
        const reorderModalContents = querySelector('commerce_my_account-reorder-modal-contents');
        reorderModalContents?.dispatchEvent(new CustomEvent('close'));
        return expect(promise).resolves.toBe('close');
    });
    it('Should close modal on X button click', () => {
        const result = ReorderModal.open(DEFAULT_MODAL_DATA);
        const button = querySelector('.slds-modal__close');
        (<HTMLElement | null>button)?.click();
        return expect(result).resolves.toBeUndefined();
    });
    it('Should call handleViewCart on receiving viewcart event', () => {
        ReorderModal.open({ label: 'Modal Heading' });
        const element = getModalElement();
        const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
        const reorderModalContents = querySelector('commerce_my_account-reorder-modal-contents');
        reorderModalContents?.dispatchEvent(new CustomEvent('viewcart'));
        expect(dispatchSpy).toHaveBeenCalled();
    });
});
