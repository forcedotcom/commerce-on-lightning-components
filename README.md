# commerce-on-lightning-components
Salesforce Commerce on Lightning LWR storefront out-of-the-box component source code for reference and educational purposes. The contents of this repository reflect the latest form of the components made available in the current release of Salesforce Commerce, providing customers a starting point for the development of their own storefront components.

# Usage
_:warning: The source code for Salesforce out-of-the-box components is provided for reference and educational purposes only; component implementations can and will change as features and functionality are revised, extended, and / or deprecated. Unless documented as a part of a Salesforce release, the properties, events, styles, and behaviors of these components are neither guaranteed nor supported for direct use by customers. See the [Caveats](#caveats) section below._

To begin browsing the component source code in its native TypeScript format, simply clone the repository and start loooking around.

To browse the components in a JavaScript format, simply take these steps:
1. Run `yarn install`
1. Run `yarn build`
The JavaScript form of the components will be generated in the `/dist` directory.

## Additional Documentation
More information regarding the development of custom components for Salesforce Commerce storefronts can be found [here](https://developer.salesforce.com/docs/atlas.en-us.b2b_b2c_comm_dev.meta/b2b_b2c_comm_dev/b2b_b2c_comm_custom_component.htm). Developers will find these sections of particular interest:
* [Client-side JS API](https://developer.salesforce.com/docs/atlas.en-us.b2b_b2c_comm_dev.meta/b2b_b2c_comm_dev/b2b_b2c_comm_display_lwc_apis.htm): describes the wire adapters and imperative methods in the `commerce/*Api` libraries that customers may use to interact with Commerce data, i.e. Commerce Connect API endpoints. This documentation includes links to the Connect APIs that these libraries utilize, which describe the data structures.
* [Custom Checkout Component Guide](https://developer.salesforce.com/docs/atlas.en-us.b2b_b2c_comm_dev.meta/b2b_b2c_comm_dev/b2b_b2c_comm_create_checkout_component.htm): captures the interactions between checkout-related components, including the functional interface custom checkout component developers can leverage.

## Organization
Components are currently organized by feature and / or functional purpose via namespaces, e.g. [`commerce`](src/lwc/commerce) and [`commerce_builder`](src/lwc/commerce_builder). At a high level, we have these important namespaces / areas:
* **[commerce](src/lwc/commerce)**: Common components and libraries shared across a Commerce storefront.
* **[commerce_builder](src/lwc/commerce_builder)**: Top-level LWCs that are available in the Experience Builder palette - that is, the components you can drag-and-drop.
* Other **commerce_** namespaces: Storefront feature areas containing the inner LWCs that support the components available in the Experience Builder.

The feature areas are organized as follows:
* **[commerce_cart](src/lwc/commerce_cart)**: Components related to the shopping cart, including the cart badge and components on the Cart page.
* **[commerce_my_account](src/lwc/commerce_my_account)**: Components related the user and their account, including profile information and shopper account settings.
* **[commerce_product_details](src/lwc/commerce_product_details)**: Components that provide an organized display of product information, primarily seen on the Product Detail page.
* **[commerce_product_information](src/lwc/commerce_product_information)**: Supporting components that support the display of product information via other area-specific components.
* **[commerce_search](src/lwc/commerce_search)**: Components involved in triggering searches and displaying search results and category products.
* **[commerce_unified_checkout](src/lwc/commerce_unified_checkout)**: Components that choreograph and support the shopper checkout experience.
* **[commerce_unified_coupons](src/lwc/commerce_unified_coupons)**: Components that display and manage shopper coupons, as seen on the Cart page.
* **[commerce_unified_promotions](src/lwc/commerce_unified_promotions)**: Components that display shopping promotion information, as seen on the Cart page.

## Caveats
In an effort to provide immediate value to customers, Salesforce is providing the exact, unaltered source code for its out-of-the-box components to customers. This promptness means that the source code cannot be immediately used (i.e. copy-pasted) by customers to create their own components as it contains references to internal libraries and evolving internal features that may not be available to customers. While Salesforce works to refine our source code and components to make them more directly reusable and composable, customers should be aware of these limitations of the component source code we provide.

### Components use internal libraries and technologies that are unavailable to customers
As Salesforce-provided components, the source code references other internal libraries, components, and features that are unfamiliar and / or unavailable to customers. Customers will need to remove these references from their custom code, which will generate errors when they attempt to upload their components using SFDX.

Notable libraries and syntax customers will need to remove or replace include:
* LWC library imports from
    * the `experience` namespace
    * the `commerce` namespace, with the exception of the public `commerce/*Api` libraries
    * the `commerce_*` namespaces
    * some `lightning` libraries, such as those named `lightning/private*`, `lightning/internal*`, and `lightning/toast`
* Imports from the `@app` scoped module
* References to components in the `commerce` and `commerce_*` namespaces
* `<designSubstitute>` elements in the `*.js-meta.xml` files for components
* `datasource="java://*"` attributes in the `*.js-meta.xml` files for components
* Additional parameters from the component `@slot <name>` JsDoc tags, e.g. `@slot mySlot ({parameters})` should be changed to`@slot mySlot`

### Dependency source code is not included
Only the source code for the Commerce storefront components is included in this repository; the source code for any components or libraries used by the Commerce components - whether publicly available or internal - is not provided. In many cases, the source code is unnecessary since the component (e.g. `lightning/input`) or library (e.g. `commerce/cartApi`) is already publicly available.

In the case of the [client-side JS API](https://developer.salesforce.com/docs/atlas.en-us.b2b_b2c_comm_dev.meta/b2b_b2c_comm_dev/b2b_b2c_comm_display_lwc_apis.htm) (i.e. references to libraries like `commerce/cartApi`), these libraries directly utilize the associated, public Connect API endpoints and operations. This means that the data returned by wire adapters and imperative methods will (with very, very, very few exceptions) match the response structure of the Connect API as-documented. To add further clarity, the internal `commerce/*ApiInternal` libraries are implementation details with two responsibilities:
* Constructing requests (URLs and payloads) for the Connect API and dispatching those requests
* Client-side caching and data coordination that is auto-magic, e.g. adding an item to the cart automatically triggers refreshes of cart items, cart summary information, and coupons

### TypeScript typings are incomplete
Source code files are written in TypeScript and contain extensive uses of custom types; many of these types are not currently shaped in a way that allows them to be beneficially shared. While the type names may provide some helpful information, customers that find this information distracting should examine the components in their JavaScript format, which excludes the type information.