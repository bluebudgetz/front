import {Component, OnDestroy, OnInit} from '@angular/core';
import {Account} from '../model/account';
import {FetchAccountsQuery} from "../accounts.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit, OnDestroy {

    accounts: Observable<Account[]>;

    selected: Account = null;

    treeControl = new NestedTreeControl<Account>(node => node.childAccounts);

    dataSource = new MatTreeNestedDataSource<Account>();

    constructor(private fetchAccountsQuery: FetchAccountsQuery) {
    }

    ngOnInit() {
        // TODO: handle stale/errors/loading/networkStatus
        this.accounts = this.fetchAccountsQuery
            .watch()
            .valueChanges
            .pipe(map(result => result.data && result.data.accounts));
        this.accounts.subscribe(value => {
            this.dataSource.data = value;
        });
    }

    ngOnDestroy(): void {
        // TODO: unsubscribe?
    }

    onSelect(acc: Account): void {
        this.selected = acc;
    }

    hasChild = (_: number, node: Account) => !!node.childAccounts && node.childAccounts.length > 0;
}
