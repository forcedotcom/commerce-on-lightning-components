import { LightningElement, api } from 'lwc';
import labels from './labels';
import type { CategoryInfoTree, CategoryInfoTreeNode, CategoryInfoTreeAncestorNode } from 'commerce/searchApiInternal';

const EVENT = {
    CATEGORY_UPDATE_EVT: 'categoryupdate',
};

/**
 * Representation for the the category tree
 *
 * @fires CategoryTree#categoryupdate
 */
export default class CategoryTree extends LightningElement {
    static renderMode = 'light';

    /**
     * A event fired when the user indicates a desire to change the category.
     *
     * Properties:
     *   - Bubbles: true
     *   - Composed: true
     *
     * @event CategoryTree#categoryupdate
     * @type {CustomEvent}
     *
     * @property {string} detail.categoryId
     *   The unique category identifier.
     *
     * @property {CategoryInfoTreeAncestorNode[]} detail.cachedTree.ancestorCategories
     *   The ancestor categories of the tree.
     *
     * @property {CategoryInfoTreeNode} detail.cachedTree.selectedCategory
     *   The selected category of the tree
     *
     * @export
     */

    /**
     * A logging event fired when the user indicates a desire to change the category.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *
     * @event CategoryTree#searchmetricslogging
     * @type {CustomEvent}
     *
     * @property {string} detail.target
     *   The name of the component that initiated this logging.
     *
     * @property {string} detail.eventSource
     *   The logging event source. Possible values are predefined by LOGGING.EVENT_SOURCE.
     *
     * @export
     */

    /**
     * The category tree display-data.
     *
     * @typedef {Object} CategoryInfoTree
     *
     * @property {CategoryInfoTreeAncestorNode[]} ancestorCategories
     *  The list of categories that are ancestors to the current selected category.
     *
     * @property {CategoryInfoTreeNode} selectedCategory
     *  The category that is currently selected.
     */

    /**
     * Tree node representation for a single category and its sub-categories.
     *
     * @typedef {Object} CategoryInfoTreeAncestorNode
     *
     * @property {string} id
     *  The id of the tree node
     *
     * @property {string} label
     *  The label of the tree node.
     *
     * @property {string} categoryName
     *  The display name of the category, without product count included.
     *
     * @property {string} backActionAssistiveText
     *  The label for the node back action assistive text
     */

    /**
     * Tree node representation for a single category and its sub-categories.
     *
     * @typedef {Object} CategoryInfoTreeNode
     *
     * @property {string} id
     *  The id of the tree node
     *
     * @property {string} label
     *  The label of the tree node.
     *
     * @property {string} categoryName
     *  The display name of the category, without product count included.
     *
     * @property {CategoryInfoTreeNode[]} items
     *  The child nodes of the tree node
     */

    /**
     * Gets or sets the category tree display-data.
     *
     * @type {CategoryInfoTree}
     */
    @api
    displayData?: CategoryInfoTree;

    /**
     * The normalized / defaulted ancestor categories of the tree.
     * @returns {CategoryInfoTreeAncestorNode[]}
     * @private
     */
    private get _ancestorCategories(): CategoryInfoTreeAncestorNode[] {
        const ancestorCategories = this.displayData?.ancestorCategories ?? [];
        return ancestorCategories.map((category: CategoryInfoTreeAncestorNode) => {
            return {
                id: category.id ?? '',
                label: category.label,
                categoryName: category.categoryName,
                backActionAssistiveText: labels.backActionAssistiveText.replace(
                    '{categoryName}',
                    category.categoryName ?? ''
                ),
            };
        });
    }

    /**
     * The normalized / defaulted selected category of the tree.
     * @returns {CategoryInfoTreeNode}
     * @private
     */
    private get _selectedCategory(): CategoryInfoTreeNode | null {
        return this.displayData?.selectedCategory ?? null;
    }

    /**
     * Gets the normalized list of items from the selected category.
     *
     * @type {CategoryInfoTreeNode[]}
     * @private
     */
    private get selectedCategoryItems(): CategoryInfoTreeNode[] {
        return this._selectedCategory?.items ?? [];
    }

    /**
     * Determines whether the currently selected category is visible.
     *
     * @type {boolean}
     * @private
     */
    private get _isSelectedCategoryVisible(): boolean {
        return this._selectedCategory ? Object.keys(this._selectedCategory).length > 0 : false;
    }

    /**
     * Gets the label for the category header.
     *
     * @returns {string} the label for the category header
     * @private
     */
    private get _categoryHeader(): string {
        return labels.categoryHeader;
    }

    /**
     * Handler for the 'click' event fired from categoryTree
     *
     * @param {Object} evt the event object
     * @fires CategoryTree#categoryupdate
     */
    handleCategoryUpdate(evt: KeyboardEvent): void {
        evt.preventDefault();
        if (evt.target instanceof HTMLElement) {
            const categoryId = evt?.target?.dataset?.categoryid;
            this.dispatchEvent(
                new CustomEvent(EVENT.CATEGORY_UPDATE_EVT, {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                    detail: {
                        categoryId: categoryId,
                        cachedTree: {
                            ancestorCategories: this._ancestorCategories,
                            selectedCategory: this._selectedCategory,
                        },
                    },
                })
            );
        }
    }

    /**
     * Handle the keydown event from categoryTree
     *
     * @param {Object} evt the event object
     */
    handleKeydown(evt: KeyboardEvent): void {
        if (evt.key === 'Enter') {
            this.handleCategoryUpdate(evt);
        }
    }
}
