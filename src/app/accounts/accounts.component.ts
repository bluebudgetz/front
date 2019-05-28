import {Component, Injectable, OnInit} from '@angular/core';
import {FlatTreeControl} from "@angular/cdk/tree";
import {HttpClient} from "@angular/common/http";
import {BlockUI, NgBlockUI} from "ng-block-ui";
import {MatSnackBar} from "@angular/material";
import {environment} from "../../environments/environment";
import {catchError, map, retry, tap} from "rxjs/operators";
import {DataSource} from "@angular/cdk/table";
import {BehaviorSubject, merge, Observable, of} from "rxjs";
import {CollectionViewer, SelectionChange} from "@angular/cdk/collections";
import {Account, AccountDTO} from "./account";

@Injectable()
class AccountsDataSource implements DataSource<Account> {
    @BlockUI("accountsTree") blockUI: NgBlockUI;

    dataChange = new BehaviorSubject<Account[]>([]);

    constructor(private http: HttpClient,
                private snackBar: MatSnackBar,
                private treeControl: FlatTreeControl<Account>) {
    }

    get data(): Account[] {
        return this.dataChange.value;
    }

    set data(accounts: Account[]) {
        this.treeControl.dataNodes = accounts;
        this.dataChange.next(accounts);
    }

    refresh() {
        this.http.get<AccountDTO[]>(environment.apiURL + "/v1/accounts")
            .pipe(retry<AccountDTO[]>(2))
            .pipe(map(accountDTOs => accountDTOs.map(acc => new Account(acc, 0))))
            .pipe(catchError(error => {
                if (error.error instanceof ErrorEvent) {
                    this.snackBar.open("Ooops, an unexpected error has occurred!");
                } else {
                    this.snackBar.open("Ooops, our servers failed fetching accounts tree!");
                }
                return of([]);
            }))
            .pipe(tap(accounts => this.data = accounts))
            .subscribe(() => this.blockUI.stop());
    }

    connect(collectionViewer: CollectionViewer): Observable<Account[] | ReadonlyArray<Account>> {
        this.treeControl.expansionModel.changed.subscribe(change => {
            if ((change as SelectionChange<Account>).added || (change as SelectionChange<Account>).removed) {
                this._handleTreeControlExpansionModelChange(change as SelectionChange<Account>);
            }
        });
        return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
    }

    disconnect(collectionViewer: CollectionViewer): void {
        // no-op
    }

    _handleTreeControlExpansionModelChange(change: SelectionChange<Account>) {
        if (change.added) {
            change.added.forEach(node => this._toggleNodeExpansion(node, true));
        }
        if (change.removed) {
            change.removed.slice().reverse().forEach(node => this._toggleNodeExpansion(node, false));
        }
    }

    _toggleNodeExpansion(node: Account, expand: boolean) {
        const index = this.data.indexOf(node);
        if (index < 0) {
            console.warn("Unknown node encountered: ", node);
            return;
        } else if (!node.expandable) {
            return;
        }

        node.loading = true;
        this.http.get<AccountDTO[]>(environment.apiURL + `/v1/accounts/${node.id}/children`)
            .pipe(retry<AccountDTO[]>(2))
            .pipe(map(accountDTOs => accountDTOs.map(acc => new Account(acc, node.level + 1))))
            .pipe(catchError(error => {
                if (error.error instanceof ErrorEvent) {
                    this.snackBar.open("Ooops, an unexpected error has occurred!");
                } else {
                    this.snackBar.open("Ooops, our servers failed fetching child accounts!");
                }
                return of([]);
            }))
            .pipe(tap(accounts => {
                if (expand) {
                    this.data.splice(index + 1, 0, ...accounts);
                } else {
                    // delete all nodes following this parent in the data array, until the next sibling
                    let count = 0;
                    for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {
                    }
                    this.data.splice(index + 1, count);
                }
                this.treeControl.dataNodes = accounts;
                this.dataChange.next(this.data);
            }))
            .subscribe(
                () => {
                    node.loading = false;
                    this.blockUI.stop();
                });
    }
}

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
    @BlockUI("accountsTree") blockUI: NgBlockUI;
    private readonly treeControl: FlatTreeControl<Account>;
    private readonly dataSource: AccountsDataSource;

    constructor(private http: HttpClient, private snackBar: MatSnackBar) {
        this.treeControl = new FlatTreeControl<Account>(node => node.level, node => node.expandable);
        this.dataSource = new AccountsDataSource(this.http, this.snackBar, this.treeControl);
        this.dataSource.dataChange.subscribe(() => this.blockUI.stop(), () => this.blockUI.stop());
    }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.blockUI.start('Loading...');
        this.dataSource.refresh();
    }
}
