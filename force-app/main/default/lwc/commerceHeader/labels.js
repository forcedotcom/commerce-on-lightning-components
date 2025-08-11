/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */

/*
 * @description Group all Custom Labels for commerceHeader in one place
 */

import MENU from '@salesforce/label/c.CommerceHeader_Menu';
import REQUEST_TRANSCRIPT from '@salesforce/label/c.CommerceHeader_RequestTranscript';
import END_CHAT from '@salesforce/label/c.CommerceHeader_EndChat';
import MINIMIZE from '@salesforce/label/c.CommerceHeader_Minimize';
import MINIMIZE_ASSISTIVE from '@salesforce/label/c.CommerceHeader_MinimizeAssistiveText';
import LOGO_ALT from '@salesforce/label/c.CommerceHeader_LogoAltText';
import CLOSE_ASSISTIVE from '@salesforce/label/c.CommerceHeader_closeButtonAssistiveText';

export const Labels = {
    /** Tooltip & alt text for the menu button */
    menu: MENU,
    /** Dropdown item */
    requestTranscript: REQUEST_TRANSCRIPT,
    /** Dropdown item */
    endChat: END_CHAT,
    /** Tooltip for minimize */
    minimize: MINIMIZE,
    /** Assistive text for minimize icon */
    minimizeAssistive: MINIMIZE_ASSISTIVE,
    /** Alt text for the logo image */
    logoAlt: LOGO_ALT,
    /** Assistive text for close button */
    closeAssistive: CLOSE_ASSISTIVE,
};
