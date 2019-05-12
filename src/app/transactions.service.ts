import {Injectable} from '@angular/core';
import {Query} from "apollo-angular";
import gql from "graphql-tag";

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

export class TransactionsResponse {
    transactions: TransactionVO[];
}

@Injectable({providedIn: 'root'})
export class FetchTransactionsQuery extends Query<TransactionsResponse> {
    document = gql`
         query($from: Time!, $until: Time!) {
            transactions(from: $from, until: $until) {
                id
                createdOn
                origin
                source { id, name }
                target { id, name }
                amount
                comments
            }
        }
    `;
}
