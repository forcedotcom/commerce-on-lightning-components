export const FieldsData = [
    {
        field: undefined,
        isReference: false,
        label: 'Ordered Date: ',
        name: 'OrderedDate',
        type: 'datetime',
        value: '2022-06-23T16:16:23.000Z',
    },
    {
        field: { objectApiName: 'Account', fieldApiName: 'Name' },
        isReference: true,
        label: 'Account: ',
        name: 'AccountId',
        type: 'reference',
        value: '001xx000003GZeFAAW',
    },
    {
        field: { objectApiName: 'User', fieldApiName: 'Name' },
        isReference: true,
        label: 'Owner Name: ',
        name: 'OwnerId',
        type: 'reference',
        value: '005xx000001XBSrAAO',
    },
    {
        field: undefined,
        isReference: false,
        label: 'Custom Geo: ',
        name: 'Custom_Geo__c',
        type: 'geolocation',
        value: { latitude: '77.4235', longitude: '41.9000' },
    },
];
