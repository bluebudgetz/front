import {Component, Injectable, OnInit} from '@angular/core';
import {FlatTreeControl} from "@angular/cdk/tree";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {BlockUI, NgBlockUI} from "ng-block-ui";
import {MatSnackBar, MatTree} from "@angular/material";
import {environment} from "../../environments/environment";
import {catchError, filter, finalize, map, mergeMap, retry, scan, switchMap, tap} from "rxjs/operators";
import {DataSource} from "@angular/cdk/table";
import {BehaviorSubject, forkJoin, merge, Observable, of} from "rxjs";
import {CollectionViewer, SelectionChange} from "@angular/cdk/collections";
import {Account, AccountDTO} from "./account";
import {CdkDragDrop} from "@angular/cdk/drag-drop";

@Injectable()
class AccountsService {

    constructor(private http: HttpClient) {
    }

    fetchAccounts(): Observable<Account[]> {
        return this.http.get<AccountDTO[]>(environment.apiURL + "/v1/accounts")
            .pipe(retry<AccountDTO[]>(2))
            .pipe(map(dtos => dtos.map(dto => (new AccountDTO(dto.id, dto.name, dto.childCount, dto.incoming, dto.outgoing, dto.balance)))))
            .pipe(map(accountDTOs => accountDTOs.map(dto => new Account(dto))));
    }

    fetchAccountChildren(parentId: number): Observable<Account[]> {
        return this.http.get<AccountDTO[]>(`${environment.apiURL}/v1/accounts/${parentId}/children`)
            .pipe(retry<AccountDTO[]>(2))
            .pipe(map(dtos => dtos.map(dto => (new AccountDTO(dto.id, dto.name, dto.childCount, dto.incoming, dto.outgoing, dto.balance)))))
            .pipe(map(accountDTOs => accountDTOs.map(dto => new Account(dto))));
    }

    updateAccountParent(id: number, parentId: number | null): Observable<void> {
        return this.http.patch<void>(`${environment.apiURL}/v1/accounts/${id}`, {parentId});
    }
}

@Injectable()
class AccountsDataSource implements DataSource<Account> {
    @BlockUI("accountsTree") blockUI: NgBlockUI;

    readonly data = new BehaviorSubject<Account[]>([]);

    constructor(private http: HttpClient,
                private accountsService: AccountsService,
                private expandNodeCallback: (node: Account) => Observable<Account[]>,
                private collapseNodeCallback: (node: Account) => Observable<any>) {
    }

    connect(collectionViewer: CollectionViewer): Observable<Account[] | ReadonlyArray<Account>> {
        if (collectionViewer instanceof MatTree) {
            collectionViewer.treeControl.expansionModel.changed.subscribe(change => {
                if ((change as SelectionChange<Account>).added || (change as SelectionChange<Account>).removed) {
                    this._handleTreeControlExpansionModelChange(change as SelectionChange<Account>);
                }
            });
            return merge(collectionViewer.viewChange, this.data).pipe(map(() => this.data.value));
        } else {
            throw new Error(`unsupported collection viewer`);
        }
    }

    disconnect(collectionViewer: CollectionViewer): void {
        // no-op
    }

    _handleTreeControlExpansionModelChange(change: SelectionChange<Account>) {
        if (change.added) {
            change.added
                .filter(node => this.data.value.includes(node))
                .filter(node => node.expandable)
                .forEach(node => {
                    node.loading = true;
                    this.expandNodeCallback(node).subscribe(() => {
                        node.loading = false;
                        node.expanded = true;
                    });
                });
        }
        if (change.removed) {
            change.removed
                .filter(node => this.data.value.includes(node))
                .reverse()
                .forEach(node => this.collapseNodeCallback(node).subscribe(() => node.expanded = false));
        }
    }
}

interface ObservableAccountsMap {
    [index: number]: Observable<Account[]>;
}

interface ObservableAccountsWithRootsMap extends ObservableAccountsMap {
    roots: Observable<Account[]>;
}

interface AccountsMap {
    [index: number]: Account[];

    roots: Account[];
}

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
    providers: [AccountsService]
})
export class AccountsComponent implements OnInit {

    @BlockUI("accountsTree") blockUI: NgBlockUI;
    private readonly treeControl: FlatTreeControl<Account>;
    private readonly dataSource: AccountsDataSource;

    constructor(private http: HttpClient, private accountsService: AccountsService, private snackBar: MatSnackBar) {
        this.treeControl = new FlatTreeControl<Account>(node => node.level, node => node.expandable);
        this.dataSource = new AccountsDataSource(
            this.http,
            this.accountsService,
            node => {
                let root: Observable<Account[]>;
                if (node.children) {
                    root = of(node.children);
                } else {
                    root = this.accountsService.fetchAccountChildren(node.id);
                }
                return root.pipe(
                    map(accounts => accounts.map(account => {
                        account.level = node.level + 1;
                        return account;
                    })),
                    tap(accounts => {
                        node.children = accounts;
                        const nodeIndex = this.dataSource.data.value.indexOf(node);
                        this.dataSource.data.value.splice(nodeIndex + 1, 0, ...accounts);
                        this.treeControl.dataNodes = accounts;
                        this.dataSource.data.next(this.dataSource.data.value);
                        this.blockUI.stop();
                    }),
                    catchError(error => {
                        if (error instanceof HttpErrorResponse) {
                            this.snackBar.open(`${error.status}: ${error.statusText}`);
                        } else {
                            this.snackBar.open("Ooops, an unexpected error has occurred!");
                        }
                        throw error;
                    })
                );
            },
            node => {
                node.children = null;
                const nodeIndex = this.dataSource.data.value.indexOf(node);
                const nextSiblingIndex = this.dataSource.data.value.slice(nodeIndex + 1).findIndex(n => n.level <= node.level);
                if (nextSiblingIndex < 0) {
                    // all nodes following this node are its children; simply truncate the array up to this parent node
                    const value = this.dataSource.data.value.slice(0, nodeIndex + 1);
                    this.treeControl.dataNodes = value;
                    this.dataSource.data.next(value);
                } else if (nextSiblingIndex > 0) {
                    this.dataSource.data.value.splice(nodeIndex + nextSiblingIndex, nextSiblingIndex);
                    this.treeControl.dataNodes = this.dataSource.data.value;
                    this.dataSource.data.next(this.dataSource.data.value);
                }
                return of(this.dataSource.data.value);
            });
    }

    ngOnInit() {
        this.refresh();
    }

    private createRefresher(): Observable<Account[]> {
        return this.accountsService.fetchAccounts()
            .pipe(
                tap(accounts => {
                    this.treeControl.dataNodes = accounts;
                    this.dataSource.data.next(accounts);
                }),
                catchError(error => this.handleError<Account[]>(error)),
                finalize(() => this.blockUI.stop()));
    }

    refresh() {
        this.blockUI.start('Loading...');
        this.createRefresher().subscribe();
    }

    drop(event: CdkDragDrop<string[]>) {
        const svc = this.accountsService;

        const data = this.dataSource.data.value.slice();
        const node: Account = event.item.data;
        const nodeIndex = data.indexOf(node);

        // prevent making an account a child of itself
        const nodeNextSiblingIndex = data.slice(nodeIndex + 1).findIndex(n => n.level <= node.level);
        const nodeChildrenStart = nodeIndex + 1;
        const nodeChildrenEnd = nodeNextSiblingIndex < 0 ? data.length : nodeIndex + 1 + nodeNextSiblingIndex;
        if (event.currentIndex >= nodeChildrenStart && event.currentIndex < nodeChildrenEnd) {
            return;
        }

        // find parent of target node (this will be the new parent)
        const targetNodeIndex = event.currentIndex;
        const targetNode = data[targetNodeIndex];
        let parentIndex: number;
        for (parentIndex = targetNodeIndex - 1; parentIndex >= 0 && data[parentIndex].level === targetNode.level; parentIndex--) {
        }
        const parent = parentIndex < 0 ? null : data[parentIndex];
        if (parent && parent.id === node.id) {
            return;
        }

        // update node's parent in the server
        // if the update is successful, re-resolve the tree by refreshing and re-expanding all previously expanded nodes
        // to do that, we will:
        //      - determine the currently expanded nodes
        //      - for each of those, refresh their children
        //      - refresh the root accounts
        //      - re-expand the tree with updated data
        this.blockUI.start('Updating...');
        svc.updateAccountParent(node.id, parent == null ? null : parent.id)
            .pipe(
                // start with all current accounts, filtered to only contain expanded nodes
                mergeMap(() => of(...data)),
                filter(account => this.treeControl.isExpanded(account)),

                // map it all to one object, where keys are account IDs and the values are Observable of their child accounts
                scan<Account, ObservableAccountsMap>(
                    (accounts: ObservableAccountsMap, account: Account) => Object.assign(
                        {},
                        accounts,
                        {
                            [account.id]: svc.fetchAccountChildren(account.id)
                        }),
                    {}),

                // add a root accounts Observable under the "roots" key in the aggregation object
                map<ObservableAccountsMap, ObservableAccountsWithRootsMap>(r => Object.assign(r, {roots: this.createRefresher()})),

                // execute all observables in parallel
                switchMap<ObservableAccountsWithRootsMap, Observable<AccountsMap>>(accounts => forkJoin(accounts)),

                // handle errors & unblock the UI when over
                catchError(error => this.handleError<any>(error)),
                finalize(() => this.blockUI.stop())
            )
            .subscribe(
                (results: AccountsMap) => {
                    const expanded: Account[] = results.roots.slice();
                    let found = true;
                    while (found) {
                        found = false;
                        for (const p in results) {
                            if (results.hasOwnProperty(p) && p !== "roots") {
                                const parentAccount = expanded.find(a => a.id === parseInt(p, 10));
                                if (parentAccount) {
                                    results[p].forEach(a => a.level = parentAccount.level + 1);
                                    parentAccount.children = results[p];
                                    this.treeControl.expand(parentAccount);
                                    found = true;
                                    expanded.push(...parentAccount.children);
                                    delete results[p];
                                    break;
                                }
                            }
                        }
                    }
                    this.dataSource.data.next(results.roots);
                    this.treeControl.dataNodes = results.roots;
                });
    }

    handleError<T>(error: Error, returnValue?: T): Observable<T> {
        if (error instanceof HttpErrorResponse) {
            this.snackBar.open(`${error.status}: ${error.statusText}`);
        } else {
            this.snackBar.open("Ooops, an unexpected error has occurred!");
        }
        if (typeof returnValue !== 'undefined') {
            return of(returnValue);
        } else {
            throw error;
        }
    }
}
