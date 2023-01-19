export type Field = {
    fieldApiName: string;
    objectApiName: string;
};

export type Record = {
    data?: {
        apiName: string;
        id: string;
        recordTypeId: string;
        fields: object;
    };
    error?: string;
};
