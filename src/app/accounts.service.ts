import {Injectable} from '@angular/core';
import {Query} from "apollo-angular";
import gql from "graphql-tag";
import {Account} from "./model/account";

/**
 * Response emitted by a call to the "accounts" GraphQL query.
 */
export class AccountsResponse {
    accounts: Account[];
}

/**
 * Represents the "accounts" GraphQL query.
 * <p/>
 * Note that GraphQL does not support recursive queries, therefor an explicit pre-determined depth of account nesting
 * is specified verbatim in the query.
 */
@Injectable({
    providedIn: 'root',
})
export class FetchAccountsQuery extends Query<AccountsResponse> {
    document = gql`
        query {
            accounts {
                id, name, childAccounts {
                    id, name, childAccounts {
                        id, name, childAccounts {
                            id, name, childAccounts {
                                id, name, childAccounts {
                                    id, name, childAccounts {
                                        id, name, childAccounts {
                                            id, name, childAccounts {
                                                id, name, childAccounts {
                                                    id, name, childAccounts {
                                                        id, name
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
}
