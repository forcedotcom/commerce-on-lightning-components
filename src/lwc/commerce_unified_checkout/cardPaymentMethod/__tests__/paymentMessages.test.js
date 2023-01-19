import { setBranding, setStyle } from '../paymentMessages';

describe('paymentMessages', () => {
    describe('setBranding', () => {
        it('should construct a set branding message', () => {
            expect(setBranding('--dxp-destructive: #FFFFFF')).toEqual({
                type: 'SET_BRANDING',
                data: '--dxp-destructive: #FFFFFF',
            });
        });
    });

    describe('setStyle', () => {
        it('should construct a set branding message', () => {
            expect(setStyle(['styleurl1', 'styleurl2'])).toEqual({
                type: 'SET_STYLES',
                data: ['styleurl1', 'styleurl2'],
            });
        });
    });
});
