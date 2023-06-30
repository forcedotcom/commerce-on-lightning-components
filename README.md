# @salesforce/commerce-components

![recipes-logo](recipes-logo.png)

🌟 Welcome to the Commerce on Lightning Web Components Starter Kit! 🛍️

We're excited to present you with an ongoing development journey that aims to provide comprehensive building blocks for every aspect of your commerce storefront. If you're a customer or partner looking to create a remarkable commerce storefront that dazzles your users, then you've come to the right place.

While the project is still in active development, we're committed to gradually releasing the essential components you need. Each release will bring you closer to achieving a seamless and efficient commerce experience. The goal is that with our meticulously crafted reference components at your disposal, you'll be able to effortlessly assemble dynamic product catalogs, seamless shopping carts, intuitive checkout processes, and so much more. You can focus on what truly matters – crafting a storefront that not only meets your customers' expectations but exceeds them.

Join us on this exciting adventure as we shape the future of commerce storefront development together. Happy coding and happy commerce building! ✨🚀

---

## The Hopefully Obvious

As you might expect, this project is organized as an SFDX (Salesforce DX) project. And because this is a project that consists almost exclusively of Lightning Web Components (LWC) intended for use in a B2B/B2C on LWR commerce storefront, everything essential is thus located in the [`force-app/main/default/lwc`](force-app/main/default/lwc) directory.

---

## Installation

<details>
<summary>Installing the components using a Scratch Org</summary>

1.  Set up your environment. Follow the steps in the [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components/) Trailhead project. The steps include:

    -   Enable Dev Hub in your Org
    -   Install Salesforce CLI
    -   Install Visual Studio Code
    -   Install the Visual Studio Code Salesforce extensions, including the Lightning Web Components extension

2.  If you haven't already done so, authorize your hub org and provide it with an alias (**myhuborg** in the command below):

    ```shell
    sf org login web -d -a myhuborg
    ```

3.  Clone the repositoty `forcedotcom/commerce-on-lightning-components`:

    ```shell
    git clone https://github.com/forcedotcom/commerce-on-lightning-components.git
    cd commerce-on-lightning-components
    ```

4.  Create a scratch org and provide it with an alias (**commerce-components** in the command below):

    ```shell
    sf org create scratch -f config/project-scratch-def.json -a commerce-components
    ```

5.  Push the app to your scratch org:

    ```shell
    sf project deploy start
    ```

6.  Open the scratch org:

    ```shell
    sf org open
    ```

    </details>

<details>
<summary>Optional Installation Instructions</summary>

This repository contains several files that are relevant if you want to integrate modern web development tooling to your Salesforce development processes, or to your continuous integration/continuous deployment processes.

### Code Formatting

[Prettier](https://prettier.io/) is a code formatter used to ensure consistent formatting across your code base. To use Prettier with Visual Studio Code, install [this extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) from the Visual Studio Code Marketplace. The [.prettierignore](.prettierignore) and [.prettierrc](.prettierrc) files are provided as part of this repository to control the behavior of the Prettier formatter.

### Code Linting

[ESLint](https://eslint.org/) is a popular JavaScript linting tool used to identify stylistic errors and erroneous constructs. To use ESLint with Visual Studio Code, install [this extension](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-lwc) from the Visual Studio Code Marketplace. The [.eslintrc.cjs](force-app/main/default/lwc/.eslintrc.cjs) file is provided as part of this repository to control the behavior of the linting process in the context of Lightning Web Components development.

### Pre-Commit Hook

This repository also comes with a [package.json](package.json) file that makes it easy to set up a pre-commit hook that enforces code formatting and linting by running Prettier and ESLint every time you `git commit` changes.

To set up the formatting and linting pre-commit hook:

1. Install [Node.js](https://nodejs.org) if you haven't already done so
2. Run `npm install` in your project's root folder to install the ESLint and Prettier modules (Note: Mac users should verify that Xcode command line tools are installed before running this command.)

Prettier and ESLint will now run automatically every time you commit changes. The commit will fail if linting errors are detected. You can also run the formatting and linting from the command line using the following commands (check out [package.json](package.json) for the full list):

```shell
npm run lint
npm run format
```

</details>

---

## Components

### Worth Knowing

The components themselves can be roughly divided into two categories. On the one hand, you will find purely presentational components for various aspects of a commerce storefront, but on the other hand, you will also find components that are designed to bridge the gap between the presentational layer and the layer that actively sets them into effect, i.e. the layer of declarative tools like the Experience Builder. These components are easily recognized by the _builder_ prefix.

Close observers may discern that even these _builder_ components, conceptualized as smart components, do not retrieve their data through the customary channel of one or more `@wire` adapters in LWC. This is a specialty of the newer LWR experiences, which include the ones based on our B2B/B2C commerce storefront templates. Integral to these experiences are what we refer to as data providers, offering a versatile means of fetching an extensive range of data. Subsequently, this data seamlessly "flows" into components through the utilization of expressions and data binding, serving as input for `@api` properties on our LWCs.

### Overview

<!-- prettier-ignore -->
| Name/FQN                                                                                                                                                                                                                                                                  | Description                                                                                                                                                                                                                                                            | Application Area |                                 Builder Support                                 |
|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------|:-------------------------------------------------------------------------------:|
| [`c/commonButton`](force-app/main/default/lwc/commonButton)                                                                                                                                                                                                               | Custom `button` control.                                                                                                                                                                                                                                               | *                |                                                                                 |
| [`c/commonModal`](force-app/main/default/lwc/commonModal)                                                                                                                                                                                                                 | Custom `lightning/modal` that exposes two actions (primary/secondary).                                                                                                                                                                                                 | *                |                                                                                 |
| [`c/commonNumberInput`](force-app/main/default/lwc/commonNumberInput)                                                                                                                                                                                                     | Custom `input[type=number]` control.                                                                                                                                                                                                                                   | *                |                                                                                 |
| [`c/productPricing`](force-app/main/default/lwc/productPricing)                                                                                                                                                                                                           | Displays pricing information for products.                                                                                                                                                                                                                             | PDP              |     [:white_check_mark:](force-app/main/default/lwc/builderProductPricing)      |
| [`c/productPricingTiers`](force-app/main/default/lwc/productPricingTiers)                                                                                                                                                                                                 | Displays pricing information for products with discount tiers.                                                                                                                                                                                                         | PDP              |   [:white_check_mark:](force-app/main/default/lwc/builderProductPricingTiers)   |
| [`c/productQuantityAdd`](force-app/main/default/lwc/productQuantityAdd)<br/>`├──`[`c/commonButton`](force-app/main/default/lwc/commonButton)<br/>`└──`[`c/productQuantitySelector`](force-app/main/default/lwc/productQuantitySelector)                                   | Displays a [`c/productQuantitySelector`](force-app/main/default/lwc/productQuantitySelector) along with an "Add to Cart" button. The [Experience Builder component](force-app/main/default/lwc/builderProductPurchaseOptions) adds an "Add to Wishlist" button on top. | PDP              | [:white_check_mark:](force-app/main/default/lwc/builderProductPurchaseOptions)  |
| [`c/productQuantitySelector`](force-app/main/default/lwc/productQuantitySelector)<br/>`├──`[`c/commonNumberInput`](force-app/main/default/lwc/commonNumberInput)<br/>`└──`[`c/productQuantitySelectorPopover`](force-app/main/default/lwc/productQuantitySelectorPopover) | Displays a [`c/commonNumberInput`](force-app/main/default/lwc/commonNumberInput) field constrained by product quantity rules (PQR) if available/configured.                                                                                                            | PDP              | [:white_check_mark:](force-app/main/default/lwc/builderProductQuantitySelector) |
| [`c/productVariantSelector`](force-app/main/default/lwc/productVariantSelector)                                                                                                                                                                                           | Displays options for selecting product variations.                                                                                                                                                                                                                     | PDP              | [:white_check_mark:](force-app/main/default/lwc/builderProductVariantSelector)  |
| [`c/searchSortMenu`](force-app/main/default/lwc/searchSortMenu)                                                                                                                                                                                                           | Displays options for changing the search sort order.                                                                                                                                                                                                                   | Search/PLP       |     [:white_check_mark:](force-app/main/default/lwc/builderSearchSortMenu)      |

---

## Resources

-   [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
-   [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
-   [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
-   [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
