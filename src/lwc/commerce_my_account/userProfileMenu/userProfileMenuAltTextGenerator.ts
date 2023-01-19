import { UserProfileMenuAltLabel } from './labels';

/**
 * Generates a localized description of the userProfile Menu button.
 *
 * @param {string} userName
 * The name of a user.
 * @returns {string}
 * returns a localized string describing the userProfile Menu button.
 */
export default function userProfileMenuAltLabelGenerator(userName: string): string {
    return UserProfileMenuAltLabel.replace('{userName}', userName);
}
