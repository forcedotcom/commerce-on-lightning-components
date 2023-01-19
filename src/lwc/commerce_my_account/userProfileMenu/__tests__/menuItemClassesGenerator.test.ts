import { cssClassesForMenuItem } from '../menuItemClassesGenerator';

describe('commerce_my_account-user-profile-menu-ui: menuItemClassesGenerator', () => {
    describe('cssClassesForMenuItem()', () => {
        it('verifies css classes if hasFocus is true and hasBorder is false', () => {
            const expectedCssClasses =
                'slds-text-color_default slds-truncate menu-item_hover menu-item-bg-hover-color profile-menu-item_hover';
            const cssClasses = cssClassesForMenuItem(true, false);
            expect(cssClasses).toBe(expectedCssClasses);
        });

        it('verifies css classes if both hasBorder and hasFocus is false', () => {
            const expectedCssClasses = 'slds-text-color_default slds-truncate menu-item profile-menu-item';
            const cssClasses = cssClassesForMenuItem(false, false);
            expect(cssClasses).toBe(expectedCssClasses);
        });
    });
});
