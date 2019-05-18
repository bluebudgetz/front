export interface TransactionVO {
    id: number;
    createdOn: string;
    origin: string;
    source: {
        id: number;
        name: string;
    };
    target: {
        id: number;
        name: string;
    };
    amount: number;
    comments: string;
}

