import {Injectable} from '@angular/core';
import {Query} from "apollo-angular";
import gql from "graphql-tag";

export interface AccountVO {
    id: number;
    name: string;
    childCount: number;
    incoming: number;
    outgoing: number;
}

/**
 * Response emitted by a call to the "accounts" GraphQL query.
 */
export class RootAccountsResponse {
    rootAccounts: AccountVO[];
}

@Injectable({providedIn: 'root'})
export class FetchRootAccountsQuery extends Query<RootAccountsResponse> {
    document = gql`
        query {
            rootAccounts {
                id
                name
                childCount
                incoming
                outgoing
            }
        }
    `;
}

/**
 * Response emitted by a call to the "accounts" GraphQL query.
 */
export class ChildAccountsResponse {
    childAccounts: AccountVO[];
}

@Injectable({providedIn: 'root'})
export class FetchChildAccountsQuery extends Query<ChildAccountsResponse> {
    document = gql`
        query($parentId: Int!) {
            childAccounts(parentId: $parentId) {
                id
                name
                childCount
                incoming
                outgoing
            }
        }
    `;
}
