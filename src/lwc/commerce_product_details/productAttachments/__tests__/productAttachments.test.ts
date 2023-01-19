import { createElement } from 'lwc';
import ProductAttachments from 'commerce_product_details/productAttachments';
import { getFile } from './data/files.mock';

describe('commerce_product_details/productAttachments: Product Attachments', () => {
    let element: HTMLElement & ProductAttachments;

    beforeEach(() => {
        element = createElement('commerce_product_details-product-attachments', {
            is: ProductAttachments,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [undefined, []].forEach((files) => {
        it(`should not render the attachments when the array of files is ("${files}")`, () => {
            element.files = files;

            return Promise.resolve().then(() => {
                const listElement = <HTMLElement>element.querySelector('ul');
                const attachmentElement = listElement.querySelectorAll('li');
                expect(attachmentElement).toHaveLength(0);
            });
        });
    });

    it('should render files when there are valid files in the file object', () => {
        element.files = getFile();

        return Promise.resolve().then(() => {
            const listElement = <HTMLElement>element.querySelector('ul');

            const attachmentElement = listElement.querySelectorAll('li');
            expect(attachmentElement).toHaveLength(2);

            // verify each file
            const firstAttachment = attachmentElement[0].querySelectorAll('a');
            expect(firstAttachment).toHaveLength(1);
            expect(firstAttachment[0].textContent).toBe(getFile()[0].name);
            expect(firstAttachment[0].href).toContain(getFile()[0].url);

            const secondAttachment = attachmentElement[1].querySelectorAll('a');
            expect(secondAttachment).toHaveLength(1);
            expect(secondAttachment[0].textContent).toBe(getFile()[1].name);
            expect(secondAttachment[0].href).toContain(getFile()[1].url);
        });
    });

    [true, false].forEach((target) => {
        it(`target gets set properly when openFilesInNewTab is ("${target}")`, () => {
            element.files = getFile();
            element.openFilesInNewTab = target;
            return Promise.resolve().then(() => {
                const listElement = <HTMLElement>element.querySelector('ul');

                const attachmentElement = listElement.querySelectorAll('li');
                const firstAttachment = attachmentElement[0].querySelectorAll('a');
                expect(firstAttachment[0].target).toBe(target ? '_blank' : '_self');
            });
        });
    });

    it('is accessible', async () => {
        element.files = getFile();
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
