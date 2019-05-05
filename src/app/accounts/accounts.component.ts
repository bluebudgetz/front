import {Component, OnDestroy, OnInit} from '@angular/core';
import {Account} from '../model/account';
import {FetchAccountsQuery} from "../accounts.service";
import {Subscription} from "rxjs";
import {map} from "rxjs/operators";
import {TreeNode} from "primeng/api";

/**
 * Represents an account tree node.
 */
class AccountTreeNode implements TreeNode {
    label: string;
    data: Account;
    icon?: any;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: TreeNode[];
    leaf?: boolean;
    parent?: TreeNode;
    key?: string;

    constructor(account: Account, parent?: TreeNode) {
        this.key = account.id + "";
        this.label = account.name;
        this.data = account;
        this.leaf = !(account.childAccounts && account.childAccounts.length);
        this.parent = parent;
        this.children = account.childAccounts && account.childAccounts.map(child => new AccountTreeNode(child, this));
    }
}

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit, OnDestroy {

    accounts: TreeNode[];

    accountsSubscription: Subscription;

    constructor(private fetchAccountsQuery: FetchAccountsQuery) {
    }

    ngOnInit() {
        // TODO: handle stale/errors/loading/networkStatus
        this.accountsSubscription = this.fetchAccountsQuery
            .watch()
            .valueChanges
            .pipe(map(result => result.data && result.data.accounts || []))
            .pipe(map(accounts => accounts.map(account => new AccountTreeNode(account))))
            .subscribe(value => this.accounts = value);
    }

    ngOnDestroy(): void {
        const subscription = this.accountsSubscription;
        this.accountsSubscription = null;
        if (subscription != null) {
            subscription.unsubscribe();
        }
    }
}
