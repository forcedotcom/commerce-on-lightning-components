/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';

export default class BuilderProductAttachments extends LightningElement {
    static renderMode = 'light';

    @api
    product;

    @api
    fileIconColor;

    @api
    openFilesInNewTab = false;
}
