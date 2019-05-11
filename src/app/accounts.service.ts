import {Injectable} from '@angular/core';
import {Query} from "apollo-angular";
import gql from "graphql-tag";
import {Account} from "./model/account";

/**
 * Response emitted by a call to the "accounts" GraphQL query.
 */
export class RootAccountsResponse {
    rootAccounts: Account[];
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
    childAccounts: Account[];
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
