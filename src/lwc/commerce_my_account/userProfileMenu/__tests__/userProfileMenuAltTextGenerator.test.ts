import userProfileMenuAltLabelGenerator from '../userProfileMenuAltTextGenerator';

//Mock the labels with known values.
jest.mock('../labels.ts', () => ({
    UserProfileMenuAltLabel: 'User Profile {userName}',
}));

describe('commerce_my_account-user-profile-menu-ui: AltText Generator', () => {
    it('returns the string with userProfileMenu AltText to the format template(User Profile {userName} )', () => {
        const labelStr = userProfileMenuAltLabelGenerator('user0000111');
        expect(labelStr).toBe('User Profile user0000111');
    });

    [''].forEach((invalidUserName) => {
        it(`returns only the static AltText specified of format(User Profile ) if userName is (${invalidUserName})`, () => {
            const labelStr = userProfileMenuAltLabelGenerator(invalidUserName);
            expect(labelStr).toBe('User Profile ');
        });
    });
});
