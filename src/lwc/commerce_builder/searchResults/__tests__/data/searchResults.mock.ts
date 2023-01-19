import type { ProductSearchResultSummary, ProductSearchResultsData } from 'commerce/productApiInternal';

export const mockProductSearchResultsData: ProductSearchResultsData = {
    categories: {
        category: {
            description: 'All Categories',
            name: 'All Categories',
        },
        children: [
            {
                category: {
                    id: '0ZGxx000000001dGAA',
                    name: 'Machines',
                },
                children: [],
                productCount: 11,
            },
            {
                category: {
                    id: '0ZGxx000000001fGAA',
                    name: 'Beans',
                },
                children: [],
                productCount: 6,
            },
            {
                category: {
                    id: '0ZGxx000000001lGAA',
                    name: 'Coffee Accessories',
                },
                children: [],
                productCount: 6,
            },
            {
                category: {
                    id: '0ZGxx000000001mGAA',
                    name: 'Grinders',
                },
                children: [],
                productCount: 2,
            },
        ],
        productCount: 25,
    },
    facets: [],
    locale: 'en_US',
    productsPage: {
        currencyIsoCode: 'USD',
        pageSize: 20,
        products: [
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBPGA2',
                    id: '2pmxx000000002NAAQ',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-cp-3-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/cp-3/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:58Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'This classic 8-cup coffee press has a black chrome-plated steel frame and lid that will last for years. It features a wide, matte-black polypropylene handle that provides a cool, comfortable grip and adds to the modern style of the design. The borosilicate glass carafe is heat-resistant, and the entire press is dishwasher safe. Dimensions: 10cm D x 17cm W x 25cm H, or 4.2"D x 6.9"W x 9.7"H',
                    },
                    ProductCode: {
                        value: 'CP-3',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'CP-3',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Java Black Coffee Press',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:58Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i63AAA',
                name: 'Java Black Coffee Press',
                prices: {
                    error: {},
                    listPrice: '20',
                    pricebookEntryId: '01uxx0000008ybMAAQ',
                    productId: '01txx0000006i63',
                    success: true,
                    unitPrice: '19.99',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBZGA2',
                    id: '2pmxx000000002XAAQ',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-cof-fil-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/COF-FIL/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:19:07Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'Great coffee filters are made up of filaments approximately 20 micrometres wide, which allow particles through that are less than approximately 10 to 15 micrometres.\\nPackage contains 300 filters.',
                    },
                    ProductCode: {
                        value: 'COF-FIL',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'COF-FIL',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Organic Paper Coffee Filters',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:19:07Z',
                    },
                    Family: {
                        value: 'Commercial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i68AAA',
                name: 'Organic Paper Coffee Filters',
                prices: {
                    error: {},
                    listPrice: '4.99',
                    pricebookEntryId: '01uxx0000008ybbAAA',
                    productId: '01txx0000006i68',
                    success: true,
                    unitPrice: '3.99',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBbGAM',
                    id: '2pmxx000000002ZAAQ',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-ss-coffeepress1-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/ss-coffeepress1/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:19:08Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'This classic 8-cup coffee press has a chrome-plated steel frame and lid that will last for years. It features a wide, matte-black polypropylene handle that provides a cool, comfortable grip and adds to the modern style of the design. The borosilicate glass carafe is heat-resistant, and the entire press is dishwasher safe. Dimensions: 10cm D x 17cm W x 25cm H, or 4.2"D x 6.9"W x 9.7"H',
                    },
                    ProductCode: {
                        value: 'CP-1',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'CP-1',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Stainless Steel Coffee Press',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:19:08Z',
                    },
                    Family: {
                        value: 'Nikon',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i69AAA',
                name: 'Stainless Steel Coffee Press',
                prices: {
                    error: {},
                    listPrice: '99.99',
                    pricebookEntryId: '01uxx0000008ybeAAA',
                    productId: '01txx0000006i69',
                    success: true,
                    unitPrice: '80',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CAzGAM',
                    id: '2pmxx000000001xAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-coppercoffeepress-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/copper_coffee_press/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:34Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'This classic 8-cup coffee press has a copper and chrome-plated steel frame and lid that will last for years. It features a wide, matte-black polypropylene handle that provides a cool, comfortable grip and adds to the modern style of the design. The borosilicate glass carafe is heat-resistant, and the entire press is dishwasher safe.',
                    },
                    ProductCode: {
                        value: 'CP-2',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'CP-2',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Copper Coffee Press',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:34Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5qAAA',
                name: 'Copper Coffee Press',
                prices: {
                    error: {},
                    listPrice: '50',
                    pricebookEntryId: '01uxx0000008yajAAA',
                    productId: '01txx0000006i5q',
                    success: true,
                    unitPrice: '39.99',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CB1GAM',
                    id: '2pmxx000000001zAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-gdg-1-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/GDG-1/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:36Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'This pure glass, 8-cup coffeemaker to help you brew the perfect cup of coffee. It is made from non-porous Borosilicate glass, which will not absorb odors or chemical residues.',
                    },
                    ProductCode: {
                        value: 'GDG-1',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'GDG-1',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Glass Drip Coffee Maker',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:36Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5rAAA',
                name: 'Glass Drip Coffee Maker',
                prices: {
                    error: {},
                    listPrice: '45.99',
                    pricebookEntryId: '01uxx0000008yamAAA',
                    productId: '01txx0000006i5r',
                    success: true,
                    unitPrice: '45.5',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBFGA2',
                    id: '2pmxx000000002DAAQ',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-filters-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/filters/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:49Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'Use this pack of 100 unbleached paper filters for a rich, full coffee flavor.',
                    },
                    ProductCode: {
                        value: 'CF-1',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'CF-1',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Coffee Filters',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:49Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5yAAA',
                name: 'Coffee Filters',
                prices: {
                    error: {},
                    listPrice: '4.5',
                    pricebookEntryId: '01uxx0000008yb7AAA',
                    productId: '01txx0000006i5y',
                    success: true,
                    unitPrice: '3.42',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CArGAM',
                    id: '2pmxx000000001pAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-id-pem1-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/ID-PEM1/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:26Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: "The Capricorn I group espresso machine is the perfect addition to your restaurant, coffee shop, or cafe! Not only does this machine give you the opportunity to add one-of-a kind hot beverages to your menu, but its stainless steel dual boiler system and automatic functionality ensure fast, efficient service for your customers. A user-friendly option for any high-volume establishment, this espresso machine is sure to take your customer's morning fix to the next level.",
                    },
                    ProductCode: {
                        value: 'ID-PEM',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'ID-PEM',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Capricorn I Group Espresso Machine',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:26Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5mAAA',
                name: 'Capricorn I Group Espresso Machine',
                prices: {
                    error: {},
                    listPrice: '1849',
                    pricebookEntryId: '01uxx0000008yaXAAQ',
                    productId: '01txx0000006i5m',
                    success: true,
                    unitPrice: '1690',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CAfGAM',
                    id: '2pmxx000000001dAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-bc-cofmac-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/BC-COFMAC/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:12Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'The ultimate in coffee making luxury. Create up to three gourmet coffees at the same time. Granular control of the froth and foaminess. Can create a coffee in under 60 minutes',
                    },
                    ProductCode: {
                        value: 'B-C-COFMAC-001',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'B-C-COFMAC-001',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Bella Chrome Coffee Machine',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:12Z',
                    },
                    Family: {
                        value: 'Commercial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5gAAA',
                name: 'Bella Chrome Coffee Machine',
                prices: {
                    error: {},
                    listPrice: '39.99',
                    pricebookEntryId: '01uxx0000008yaFAAQ',
                    productId: '01txx0000006i5g',
                    success: true,
                    unitPrice: '35.99',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CB7GAM',
                    id: '2pmxx0000000025AAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-ps-db-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/PS-DB/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:42Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: "At the heart of this machine is it's dual boiler heating system. The boiler, for the espresso shot, is PID temperature controlled, while a separate steam boiler offers instant and powerful steam on demand. So you can extract your shot at the right temperature, delivering optimal flavor, while simultaneously steaming your milk to cafe quality.",
                    },
                    ProductCode: {
                        value: 'PS-DB',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'PS-DB',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'The Dual Boiler',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:42Z',
                    },
                    Family: {
                        value: 'Industrial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5uAAA',
                name: 'The Dual Boiler',
                prices: {
                    error: {},
                    listPrice: '1350',
                    pricebookEntryId: '01uxx0000008yavAAA',
                    productId: '01txx0000006i5u',
                    success: true,
                    unitPrice: '1299',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CB9GAM',
                    id: '2pmxx0000000027AAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-infuser1-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/infuser1/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:44Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'The Infuser delivers optimal espresso flavor in every cup. It pre-infuses ground coffee with low, steady water pressure before extraction, gently expanding the grinds before stepping up to high pressure. The result is a more even extraction, which produces balanced espresso flavor.',
                    },
                    ProductCode: {
                        value: 'Q85YQ2',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'Q85YQ2',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'The Infuser',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:44Z',
                    },
                    Family: {
                        value: 'Commercial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5vAAA',
                name: 'The Infuser',
                prices: {
                    error: {},
                    listPrice: '579.99',
                    pricebookEntryId: '01uxx0000008yayAAA',
                    productId: '01txx0000006i5v',
                    success: true,
                    unitPrice: '319.95',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CAnGAM',
                    id: '2pmxx000000001lAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-tm-cofmac-001-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/TM-COFMAC-001/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:23Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'TaskMater espresso machine is the perfect addition to your restaurant, coffee shop, or cafe!',
                    },
                    ProductCode: {
                        value: 'TM-COFMAC-001',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'TM-COFMAC-001',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'TaskMaster Coffee Machine',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:23Z',
                    },
                    Family: {
                        value: 'Commercial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5kAAA',
                name: 'TaskMaster Coffee Machine',
                prices: {
                    error: {},
                    listPrice: '554',
                    pricebookEntryId: '01uxx0000008yaRAAQ',
                    productId: '01txx0000006i5k',
                    success: true,
                    unitPrice: '524',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CAxGAM',
                    id: '2pmxx000000001vAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-mrc-1-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/mrc-1/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:32Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: "Grown in Colombia's rich volcanic soil, this coffee is as distinctive as the countryside. Our medium roast coffee delivers a signature nutty flavor. We use 100% natural roasted arabica beans to create a smooth and balanced, yet crisp, cup of coffee.",
                    },
                    ProductCode: {
                        value: 'MRC-1',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'MRC-1',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Medium Roast Coffee',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:32Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5pAAA',
                name: 'Medium Roast Coffee',
                prices: {
                    error: {},
                    listPrice: '15',
                    pricebookEntryId: '01uxx0000008yagAAA',
                    productId: '01txx0000006i5p',
                    success: true,
                    unitPrice: '15',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBBGA2',
                    id: '2pmxx0000000029AAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-ccg-1-png',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/CCG-1/png',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:45Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'This espresso grinder uses 2 1/2" blades to finely grind whole bean coffee so that you can serve delicious espresso at your coffee shop, espresso bar, and more! A unique micro adjustment system and a manual timer give you infinite control over grind settings to get the precise grind that you need. A cast aluminum frame ensures perfect grind head alignment for consistent, long-lasting service.',
                    },
                    ProductCode: {
                        value: 'CCG-1',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'CCG-1',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Commercial Coffee Grinder',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:45Z',
                    },
                    Family: {
                        value: 'Commercial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5wAAA',
                name: 'Commercial Coffee Grinder',
                prices: {
                    error: {},
                    listPrice: '1041',
                    pricebookEntryId: '01uxx0000008yb1AAA',
                    productId: '01txx0000006i5w',
                    success: true,
                    unitPrice: '918',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBDGA2',
                    id: '2pmxx000000002BAAQ',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-cercg-1-1-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/CERCG-1-1/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:47Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'This multi-purpose grinder prepares fresh coffee, salt, pepper, green tea, and even sesame seeds. A ceramic grinding mechanism never alters flavor of grinds, resulting in fresh, flavorful, and pure ingredients',
                    },
                    ProductCode: {
                        value: 'CERCG-1',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'CERCG-1',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Ceramic Coffee Grinder',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:47Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5xAAA',
                name: 'Ceramic Coffee Grinder',
                prices: {
                    error: {},
                    listPrice: '99',
                    pricebookEntryId: '01uxx0000008yb4AAA',
                    productId: '01txx0000006i5x',
                    success: true,
                    unitPrice: '80',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CAtGAM',
                    id: '2pmxx000000001rAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-tr-cofmac-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/TR-COFMAC/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:28Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'The Testa Rossa Milk Espresso & Coffee machine: Deliciousness delivered with ease, cup after cup. With our innovative illy iperEspresso capsule system, creating an excellent cup of espresso or classic coffee is perfectly simple. Our specially designed capsules deliver extraordinary taste with professional artistry - all in a single touch, from a single machine. With a hot water dispenser for soothing tea, and new integrated milk frother for beautiful lattes and smooth cappuccinos, every cup becomes an at-home indulgence.\\n\\nEnjoy all six beverage options with the convenience of one machine:\\n\\nEspresso\\nCoffee\\nCappuccino\\nLatte macchiato\\nSteamed milk\\nHot water for teas and herbal infusions',
                    },
                    ProductCode: {
                        value: 'TR-COFMAC-001',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'TR-COFMAC-001',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Testa Rossa Coffee Machine',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:28Z',
                    },
                    Family: {
                        value: 'Industrial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5nAAA',
                name: 'Testa Rossa Coffee Machine',
                prices: {
                    error: {},
                    listPrice: '829',
                    pricebookEntryId: '01uxx0000008yaaAAA',
                    productId: '01txx0000006i5n',
                    success: true,
                    unitPrice: '595',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CAhGAM',
                    id: '2pmxx000000001fAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-drw-1-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/DRW-1/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:14Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: '2.5 lbs of dark roasted, single-origin, fair trade and Organic Arabica bean from the Chiapas region of Mexico. It is nutty with notes of caramel and slight baker\'s chocolate. It is fresh roasted and rated Premium Grade "1," the highest rating available for coffee.',
                    },
                    ProductCode: {
                        value: 'DRW-1',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'DRW-1',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Dark Roast Whole Bean Coffee',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:14Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5hAAA',
                name: 'Dark Roast Whole Bean Coffee',
                prices: {
                    error: {},
                    listPrice: '16.99',
                    pricebookEntryId: '01uxx0000008yaIAAQ',
                    productId: '01txx0000006i5h',
                    success: true,
                    unitPrice: '14.99',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CAvGAM',
                    id: '2pmxx000000001tAAA',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-lrw-1-jpg',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/LRW-1/jpg',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:30Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'A blend of 100 percent premium Arabica beans from Central America, Kenya and Tanzania that results in a superb, rich aroma and well-balanced taste. Coffee is light, sweet and balanced coffee. Whole beans are perfect for drip or filter method. Comes in 2.5 lb bag.',
                    },
                    ProductCode: {
                        value: 'LRW-1',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'LRW-1',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Light Roast Whole Bean Coffee',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:30Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5oAAA',
                name: 'Light Roast Whole Bean Coffee',
                prices: {
                    error: {},
                    listPrice: '23',
                    pricebookEntryId: '01uxx0000008yadAAA',
                    productId: '01txx0000006i5o',
                    success: true,
                    unitPrice: '17',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBHGA2',
                    id: '2pmxx000000002FAAQ',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-e-mr-b-png',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/E-MR-B/png',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:18:51Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'This medium roast Ethiopian coffee has graceful notes of chocolate, paired with flavors of molasses and nuts.',
                    },
                    ProductCode: {
                        value: 'E-MR-B',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'E-MR-B',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Medium Roast Ethiopian Coffee Bean',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:18:51Z',
                    },
                    Family: {
                        value: 'Personal',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i5zAAA',
                name: 'Medium Roast Ethiopian Coffee Bean',
                prices: {
                    error: {},
                    listPrice: '19.97',
                    pricebookEntryId: '01uxx0000008ybAAAQ',
                    productId: '01txx0000006i5z',
                    success: true,
                    unitPrice: '18.99',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBXGA2',
                    id: '2pmxx000000002VAAQ',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-cm-msb-300-png',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/CM-MSB-300/png',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:19:05Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'This coffee brewer is an excellent addition to any cafe or restaurant where a reliable source of coffee is needed. It brews coffee directly into an airpot at optimum temperatures between 201 and 205 degrees Fahrenheit for a rich, consistent product every time. While this model is intended for low volume use, 1650W of power allows you to brew up to 56 cups per hour.',
                    },
                    ProductCode: {
                        value: 'CM-MSB-300',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'CM-MSB-300',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Commercial - Medium Scale Brewer',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:19:05Z',
                    },
                    Family: {
                        value: 'Commercial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i67AAA',
                name: 'Commercial - Medium Scale Brewer',
                prices: {
                    error: {},
                    listPrice: '599',
                    pricebookEntryId: '01uxx0000008ybYAAQ',
                    productId: '01txx0000006i67',
                    success: true,
                    unitPrice: '575',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
            {
                defaultImage: {
                    alternateText: null,
                    contentVersionId: '5OUxx0000004CBVGA2',
                    id: '2pmxx000000002TAAQ',
                    mediaType: 'Image',
                    sortOrder: 0,
                    thumbnailUrl: null,
                    title: 'image-capricorn-crev-dr-blend-png',
                    url: 'https://img4demo.herokuapp.com/image/capricorn/CREV-DR-BLEND/png',
                },
                fields: {
                    LastModifiedDate: {
                        value: '2020-05-28T22:19:03Z',
                    },
                    DisplayUrl: {
                        value: null,
                    },
                    IsDeleted: {
                        value: 'false',
                    },
                    Description: {
                        value: 'These expertly roasted beans are the pride and joy of Colombia. They have taken the coffee world by storm. Try it for yourself!',
                    },
                    ProductCode: {
                        value: 'CREV-DR-BLEND',
                    },
                    IsActive: {
                        value: 'true',
                    },
                    ExternalId: {
                        value: null,
                    },
                    LastViewedDate: {
                        value: null,
                    },
                    LastReferencedDate: {
                        value: null,
                    },
                    StockKeepingUnit: {
                        value: 'CREV-DR-BLEND',
                    },
                    CurrencyIsoCode: {
                        value: 'USD',
                    },
                    ExternalDataSourceId: {
                        value: null,
                    },
                    Name: {
                        value: 'Colombian Dark Roast Revolution Blend',
                    },
                    SystemModstamp: {
                        value: '2020-07-09T22:55:57Z',
                    },
                    IsArchived: {
                        value: 'false',
                    },
                    CreatedById: {
                        value: '005xx000001X7VB',
                    },
                    CloneSourceId: {
                        value: null,
                    },
                    QuantityUnitOfMeasure: {
                        value: null,
                    },
                    CreatedDate: {
                        value: '2020-05-28T22:19:03Z',
                    },
                    Family: {
                        value: 'Commercial',
                    },
                    LastModifiedById: {
                        value: '005xx000001X7VB',
                    },
                },
                id: '01txx0000006i66AAA',
                name: 'Colombian Dark Roast Revolution Blend',
                prices: {
                    error: {},
                    listPrice: '38.99',
                    pricebookEntryId: '01uxx0000008ybVAAQ',
                    productId: '01txx0000006i66',
                    success: true,
                    unitPrice: '35.45',
                    isLoading: false,
                },
                productClass: null,
                variationAttributeSet: {
                    attributes: [],
                },
                purchaseQuantityRule: null,
            },
        ],
        total: 25,
    },
};

export const mockSearchResultsData: ProductSearchResultSummary = {
    locale: 'en_US',
    total: 25,
    pageSize: 20,
    filtersPanel: {
        facets: [],
        categories: {
            ancestorCategories: [],
            selectedCategory: {
                id: 'ROOT_CATEGORY_ID',
                label: 'All Categories',
                categoryName: 'All Categories',
                items: [
                    {
                        id: '0ZGxx000000001dGAA',
                        label: 'Machines (11)',
                        categoryName: 'Machines',
                    },
                    {
                        id: '0ZGxx000000001fGAA',
                        label: 'Beans (6)',
                        categoryName: 'Beans',
                    },
                    {
                        id: '0ZGxx000000001lGAA',
                        label: 'Coffee Accessories (6)',
                        categoryName: 'Coffee Accessories',
                    },
                    {
                        id: '0ZGxx000000001mGAA',
                        label: 'Grinders (2)',
                        categoryName: 'Grinders',
                    },
                ],
            },
        },
    },
    cardCollection: [
        {
            id: '01txx0000006i63AAA',
            name: 'Java Black Coffee Press',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:58Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'This classic 8-cup coffee press has a black chrome-plated steel frame and lid that will last for years. It features a wide, matte-black polypropylene handle that provides a cool, comfortable grip and adds to the modern style of the design. The borosilicate glass carafe is heat-resistant, and the entire press is dishwasher safe. Dimensions: 10cm D x 17cm W x 25cm H, or 4.2"D x 6.9"W x 9.7"H',
                },
                ProductCode: {
                    value: 'CP-3',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'CP-3',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Java Black Coffee Press',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:58Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/cp-3/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '20',
                negotiatedPrice: '19.99',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i68AAA',
            name: 'Organic Paper Coffee Filters',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:19:07Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'Great coffee filters are made up of filaments approximately 20 micrometres wide, which allow particles through that are less than approximately 10 to 15 micrometres.\\nPackage contains 300 filters.',
                },
                ProductCode: {
                    value: 'COF-FIL',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'COF-FIL',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Organic Paper Coffee Filters',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:19:07Z',
                },
                Family: {
                    value: 'Commercial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/COF-FIL/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '4.99',
                negotiatedPrice: '3.99',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i69AAA',
            name: 'Stainless Steel Coffee Press',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:19:08Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'This classic 8-cup coffee press has a chrome-plated steel frame and lid that will last for years. It features a wide, matte-black polypropylene handle that provides a cool, comfortable grip and adds to the modern style of the design. The borosilicate glass carafe is heat-resistant, and the entire press is dishwasher safe. Dimensions: 10cm D x 17cm W x 25cm H, or 4.2"D x 6.9"W x 9.7"H',
                },
                ProductCode: {
                    value: 'CP-1',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'CP-1',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Stainless Steel Coffee Press',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:19:08Z',
                },
                Family: {
                    value: 'Nikon',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/ss-coffeepress1/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '99.99',
                negotiatedPrice: '80',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5qAAA',
            name: 'Copper Coffee Press',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:34Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'This classic 8-cup coffee press has a copper and chrome-plated steel frame and lid that will last for years. It features a wide, matte-black polypropylene handle that provides a cool, comfortable grip and adds to the modern style of the design. The borosilicate glass carafe is heat-resistant, and the entire press is dishwasher safe.',
                },
                ProductCode: {
                    value: 'CP-2',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'CP-2',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Copper Coffee Press',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:34Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/copper_coffee_press/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '50',
                negotiatedPrice: '39.99',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5rAAA',
            name: 'Glass Drip Coffee Maker',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:36Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'This pure glass, 8-cup coffeemaker to help you brew the perfect cup of coffee. It is made from non-porous Borosilicate glass, which will not absorb odors or chemical residues.',
                },
                ProductCode: {
                    value: 'GDG-1',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'GDG-1',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Glass Drip Coffee Maker',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:36Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/GDG-1/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '45.99',
                negotiatedPrice: '45.5',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5yAAA',
            name: 'Coffee Filters',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:49Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'Use this pack of 100 unbleached paper filters for a rich, full coffee flavor.',
                },
                ProductCode: {
                    value: 'CF-1',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'CF-1',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Coffee Filters',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:49Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/filters/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '4.5',
                negotiatedPrice: '3.42',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5mAAA',
            name: 'Capricorn I Group Espresso Machine',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:26Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: "The Capricorn I group espresso machine is the perfect addition to your restaurant, coffee shop, or cafe! Not only does this machine give you the opportunity to add one-of-a kind hot beverages to your menu, but its stainless steel dual boiler system and automatic functionality ensure fast, efficient service for your customers. A user-friendly option for any high-volume establishment, this espresso machine is sure to take your customer's morning fix to the next level.",
                },
                ProductCode: {
                    value: 'ID-PEM',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'ID-PEM',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Capricorn I Group Espresso Machine',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:26Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/ID-PEM1/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '1849',
                negotiatedPrice: '1690',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5gAAA',
            name: 'Bella Chrome Coffee Machine',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:12Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'The ultimate in coffee making luxury. Create up to three gourmet coffees at the same time. Granular control of the froth and foaminess. Can create a coffee in under 60 minutes',
                },
                ProductCode: {
                    value: 'B-C-COFMAC-001',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'B-C-COFMAC-001',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Bella Chrome Coffee Machine',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:12Z',
                },
                Family: {
                    value: 'Commercial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/BC-COFMAC/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '39.99',
                negotiatedPrice: '35.99',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5uAAA',
            name: 'The Dual Boiler',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:42Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: "At the heart of this machine is it's dual boiler heating system. The boiler, for the espresso shot, is PID temperature controlled, while a separate steam boiler offers instant and powerful steam on demand. So you can extract your shot at the right temperature, delivering optimal flavor, while simultaneously steaming your milk to cafe quality.",
                },
                ProductCode: {
                    value: 'PS-DB',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'PS-DB',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'The Dual Boiler',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:42Z',
                },
                Family: {
                    value: 'Industrial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/PS-DB/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '1350',
                negotiatedPrice: '1299',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5vAAA',
            name: 'The Infuser',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:44Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'The Infuser delivers optimal espresso flavor in every cup. It pre-infuses ground coffee with low, steady water pressure before extraction, gently expanding the grinds before stepping up to high pressure. The result is a more even extraction, which produces balanced espresso flavor.',
                },
                ProductCode: {
                    value: 'Q85YQ2',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'Q85YQ2',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'The Infuser',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:44Z',
                },
                Family: {
                    value: 'Commercial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/infuser1/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '579.99',
                negotiatedPrice: '319.95',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5kAAA',
            name: 'TaskMaster Coffee Machine',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:23Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'TaskMater espresso machine is the perfect addition to your restaurant, coffee shop, or cafe!',
                },
                ProductCode: {
                    value: 'TM-COFMAC-001',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'TM-COFMAC-001',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'TaskMaster Coffee Machine',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:23Z',
                },
                Family: {
                    value: 'Commercial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/TM-COFMAC-001/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '554',
                negotiatedPrice: '524',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5pAAA',
            name: 'Medium Roast Coffee',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:32Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: "Grown in Colombia's rich volcanic soil, this coffee is as distinctive as the countryside. Our medium roast coffee delivers a signature nutty flavor. We use 100% natural roasted arabica beans to create a smooth and balanced, yet crisp, cup of coffee.",
                },
                ProductCode: {
                    value: 'MRC-1',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'MRC-1',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Medium Roast Coffee',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:32Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/mrc-1/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '15',
                negotiatedPrice: '15',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5wAAA',
            name: 'Commercial Coffee Grinder',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:45Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'This espresso grinder uses 2 1/2" blades to finely grind whole bean coffee so that you can serve delicious espresso at your coffee shop, espresso bar, and more! A unique micro adjustment system and a manual timer give you infinite control over grind settings to get the precise grind that you need. A cast aluminum frame ensures perfect grind head alignment for consistent, long-lasting service.',
                },
                ProductCode: {
                    value: 'CCG-1',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'CCG-1',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Commercial Coffee Grinder',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:45Z',
                },
                Family: {
                    value: 'Commercial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/CCG-1/png',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '1041',
                negotiatedPrice: '918',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5xAAA',
            name: 'Ceramic Coffee Grinder',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:47Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'This multi-purpose grinder prepares fresh coffee, salt, pepper, green tea, and even sesame seeds. A ceramic grinding mechanism never alters flavor of grinds, resulting in fresh, flavorful, and pure ingredients',
                },
                ProductCode: {
                    value: 'CERCG-1',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'CERCG-1',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Ceramic Coffee Grinder',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:47Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/CERCG-1-1/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '99',
                negotiatedPrice: '80',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5nAAA',
            name: 'Testa Rossa Coffee Machine',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:28Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'The Testa Rossa Milk Espresso & Coffee machine: Deliciousness delivered with ease, cup after cup. With our innovative illy iperEspresso capsule system, creating an excellent cup of espresso or classic coffee is perfectly simple. Our specially designed capsules deliver extraordinary taste with professional artistry - all in a single touch, from a single machine. With a hot water dispenser for soothing tea, and new integrated milk frother for beautiful lattes and smooth cappuccinos, every cup becomes an at-home indulgence.\\n\\nEnjoy all six beverage options with the convenience of one machine:\\n\\nEspresso\\nCoffee\\nCappuccino\\nLatte macchiato\\nSteamed milk\\nHot water for teas and herbal infusions',
                },
                ProductCode: {
                    value: 'TR-COFMAC-001',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'TR-COFMAC-001',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Testa Rossa Coffee Machine',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:28Z',
                },
                Family: {
                    value: 'Industrial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/TR-COFMAC/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '829',
                negotiatedPrice: '595',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5hAAA',
            name: 'Dark Roast Whole Bean Coffee',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:14Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: '2.5 lbs of dark roasted, single-origin, fair trade and Organic Arabica bean from the Chiapas region of Mexico. It is nutty with notes of caramel and slight baker\'s chocolate. It is fresh roasted and rated Premium Grade "1," the highest rating available for coffee.',
                },
                ProductCode: {
                    value: 'DRW-1',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'DRW-1',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Dark Roast Whole Bean Coffee',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:14Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/DRW-1/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '16.99',
                negotiatedPrice: '14.99',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5oAAA',
            name: 'Light Roast Whole Bean Coffee',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:30Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'A blend of 100 percent premium Arabica beans from Central America, Kenya and Tanzania that results in a superb, rich aroma and well-balanced taste. Coffee is light, sweet and balanced coffee. Whole beans are perfect for drip or filter method. Comes in 2.5 lb bag.',
                },
                ProductCode: {
                    value: 'LRW-1',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'LRW-1',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Light Roast Whole Bean Coffee',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:30Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/LRW-1/jpg',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '23',
                negotiatedPrice: '17',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i5zAAA',
            name: 'Medium Roast Ethiopian Coffee Bean',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:18:51Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'This medium roast Ethiopian coffee has graceful notes of chocolate, paired with flavors of molasses and nuts.',
                },
                ProductCode: {
                    value: 'E-MR-B',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'E-MR-B',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Medium Roast Ethiopian Coffee Bean',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:18:51Z',
                },
                Family: {
                    value: 'Personal',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/E-MR-B/png',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '19.97',
                negotiatedPrice: '18.99',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i67AAA',
            name: 'Commercial - Medium Scale Brewer',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:19:05Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'This coffee brewer is an excellent addition to any cafe or restaurant where a reliable source of coffee is needed. It brews coffee directly into an airpot at optimum temperatures between 201 and 205 degrees Fahrenheit for a rich, consistent product every time. While this model is intended for low volume use, 1650W of power allows you to brew up to 56 cups per hour.',
                },
                ProductCode: {
                    value: 'CM-MSB-300',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'CM-MSB-300',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Commercial - Medium Scale Brewer',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:19:05Z',
                },
                Family: {
                    value: 'Commercial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/CM-MSB-300/png',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '599',
                negotiatedPrice: '575',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
        {
            id: '01txx0000006i66AAA',
            name: 'Colombian Dark Roast Revolution Blend',
            fields: {
                LastModifiedDate: {
                    value: '2020-05-28T22:19:03Z',
                },
                DisplayUrl: {
                    value: null,
                },
                IsDeleted: {
                    value: 'false',
                },
                Description: {
                    value: 'These expertly roasted beans are the pride and joy of Colombia. They have taken the coffee world by storm. Try it for yourself!',
                },
                ProductCode: {
                    value: 'CREV-DR-BLEND',
                },
                IsActive: {
                    value: 'true',
                },
                ExternalId: {
                    value: null,
                },
                LastViewedDate: {
                    value: null,
                },
                LastReferencedDate: {
                    value: null,
                },
                StockKeepingUnit: {
                    value: 'CREV-DR-BLEND',
                },
                CurrencyIsoCode: {
                    value: 'USD',
                },
                ExternalDataSourceId: {
                    value: null,
                },
                Name: {
                    value: 'Colombian Dark Roast Revolution Blend',
                },
                SystemModstamp: {
                    value: '2020-07-09T22:55:57Z',
                },
                IsArchived: {
                    value: 'false',
                },
                CreatedById: {
                    value: '005xx000001X7VB',
                },
                CloneSourceId: {
                    value: null,
                },
                QuantityUnitOfMeasure: {
                    value: null,
                },
                CreatedDate: {
                    value: '2020-05-28T22:19:03Z',
                },
                Family: {
                    value: 'Commercial',
                },
                LastModifiedById: {
                    value: '005xx000001X7VB',
                },
            },
            image: {
                url: 'https://img4demo.herokuapp.com/image/capricorn/CREV-DR-BLEND/png',
                alternateText: '',
            },
            prices: {
                currencyIsoCode: 'USD',
                listingPrice: '38.99',
                negotiatedPrice: '35.45',
                isLoading: false,
            },
            productClass: null,
            variationAttributeSet: null,
            purchaseQuantityRule: null,
        },
    ],
};
