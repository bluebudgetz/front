import {Component, OnDestroy, OnInit} from '@angular/core';
import {Account} from '../model/account';
import {FetchAccountsQuery} from "../accounts.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit, OnDestroy {

    accounts: Observable<Account[]>;

    selected: Account = null;

    constructor(private fetchAccountsQuery: FetchAccountsQuery) {
    }

    ngOnInit() {
        // TODO: handle stale/errors/loading/networkStatus
        this.accounts = this.fetchAccountsQuery
            .watch()
            .valueChanges
            .pipe(map(result => result.data && result.data.accounts));
    }

    ngOnDestroy(): void {
        // TODO: unsubscribe?
    }

    onSelect(acc: Account): void {
        this.selected = acc;
    }

}
