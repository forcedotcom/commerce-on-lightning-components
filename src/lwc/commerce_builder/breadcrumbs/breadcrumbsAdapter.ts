import { createContextAdapter } from 'experience/context';

/**
 * Contextual wire adapter to provide the `commerce_builder/breadcrumbs` component with breadcrumbs data.
 * Context providers like the {@link ProductDataProvider} will take care of providing the related breadcrumbs
 * for their current context, e.g. a product detail.
 */
export const BreadcrumbsAdapter = createContextAdapter();
