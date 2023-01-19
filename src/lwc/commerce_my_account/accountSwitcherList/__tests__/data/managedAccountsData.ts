export const mockedManagedAccounts = [
    {
        id: '001RM000004Y1nxYAC',
        name: 'Amazon',
        isCurrentUserDefaultAccount: false,
        address: {
            city: 'San Francisco',
            street: '59th Avenue',
            state: 'California',
            country: 'United States',
            zip: '598764',
        },
    },
    {
        id: '001RM000004Y1nxYAD',
        name: 'Amazon Inventory',
        isCurrentUserDefaultAccount: true,
        address: {
            city: 'Seattle',
            street: '1 Prime Way',
            state: 'Washington',
            country: 'United States',
            zip: '98003',
        },
    },
];

export const mockedResponseWithLoading = {
    loading: true,
};
export const mockedResponseWithData = {
    data: mockedManagedAccounts,
    loading: false,
};
export const mockedResponseWithNoData = {
    loading: false,
};
export const mockedResponseWithError = {
    loading: true,
    error: true,
};
export const mockedCurrentUserDefaultAccountId = '001RM000004Y1nxYAD';
export const mockedSelectedAccountId = '001RM000004Y1nxYAC';
