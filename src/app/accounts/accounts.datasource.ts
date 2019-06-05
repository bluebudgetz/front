import {CollectionViewer, DataSource, SelectionChange} from "@angular/cdk/collections";
import {BehaviorSubject, merge, Observable, of, Subscription} from "rxjs";
import {Injectable} from "@angular/core";
import {Account} from "./account";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {AccountsService} from "./accounts.service";
import {MatTree} from "@angular/material";
import {catchError, filter, map, mergeMap, tap, toArray} from "rxjs/operators";
import {NotifyService} from "../notifications/notify.service";

interface DataSourceConnection<T> {
    collectionViewer: CollectionViewer;
    subscription: Subscription;
    observable: Observable<T[] | ReadonlyArray<T>>;
}

abstract class BaseAccountsDataSource implements DataSource<Account> {
    protected readonly connectedViewers: DataSourceConnection<Account>[] = [];
    public readonly dataChange = new BehaviorSubject<Account[]>([]);

    protected constructor(protected readonly notifyService: NotifyService, protected accountsService: AccountsService) {
    }

    get data(): Account[] {
        return this.dataChange.value;
    }

    set data(accounts: Account[]) {
        this.dataChange.next(accounts);
    }

    refresh(callback: (accounts: Account[]) => void): void {
        this.refreshInternal().pipe(
            catchError(error => {
                console.info("Failed fetching accounts: ", error);

                let message = "Ooops, that's embarrassing! We have encountered an unexpected error.";
                if (error instanceof HttpErrorResponse) {
                    if (error.status >= 400 && error.status <= 499) {
                        message = `${error.statusText} (${error.status})`;
                    } else if (error.status >= 500) {
                        message = "Ooops, that's embarrassing! It seems our servers have encountered an unexpected error.";
                    } else {
                        message = "Ooops, we could not communicate with our servers. Are you online?";
                    }
                }
                this.notifyService.error(message);
                return of([]);
            }),
            tap(accounts => this.data = accounts),
            tap(callback),
        ).subscribe();
    }

    protected abstract refreshInternal(): Observable<Account[]>;

    connect(collectionViewer: CollectionViewer): Observable<Account[] | ReadonlyArray<Account>> {
        if (!(collectionViewer instanceof MatTree)) {
            throw new Error(`unsupported collection viewer`);
        }

        let connection = this.connectedViewers.find(i => i.collectionViewer === collectionViewer);
        if (connection) {
            return connection.observable;
        }

        const expansionChanges = collectionViewer.treeControl.expansionModel.changed;
        connection = {
            collectionViewer,
            subscription: expansionChanges.subscribe(change => this.handleExpansionChange(change as SelectionChange<Account>)),
            observable: merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data))
        };
        this.connectedViewers.push(connection);

        return connection.observable;
    }

    disconnect(collectionViewer: CollectionViewer): void {
        const index = this.connectedViewers.findIndex(i => i.collectionViewer === collectionViewer);
        if (index >= 0) {
            this.connectedViewers.splice(index, 1);
        }
    }

    protected abstract getAccountChildren(account: Account): Observable<Account[]>;

    private handleExpansionChange(change: SelectionChange<Account>) {
        of<Account>(...change.added).pipe(
            filter<Account>(account => account.expandable),
            tap<Account>(account => account.loading = true),
            mergeMap<Account, Observable<Account>>(parent => {
                if (parent.children.value) {
                    return of(parent);
                } else {
                    return this.getAccountChildren(parent).pipe(
                        tap<Account[]>(children => children.forEach(child => child.level = parent.level + 1)),
                        map<Account[], Account>(children => {
                            parent.children.next(children);
                            return parent;
                        }),
                        catchError(error => {
                            this.handleAccountChildrenError(error);
                            parent.children.next(null);
                            return of(parent);
                        }),
                    );
                }
            }),
            tap<Account>(account => account.loading = false),
            toArray(),
        ).subscribe(() => this.data = this.data.slice());

        of<Account>(...change.removed.reverse()).pipe(
            filter<Account>(account => account.expandable),
            toArray(),
        ).subscribe(() => this.data = this.data.slice());
    }

    private handleAccountChildrenError(error: any): void {
        let message = "Ooops, that's embarrassing! We have encountered an unexpected error.";
        if (error instanceof HttpErrorResponse) {
            if (error.status >= 400 && error.status <= 499) {
                message = `${error.statusText} (${error.status})`;
            } else if (error.status >= 500) {
                message = "Ooops, that's embarrassing! It seems our servers have encountered an unexpected error.";
            } else {
                message = "Ooops, we could not communicate with our servers. Are you online?";
            }
        }
        this.notifyService.error(message);
    }
}

@Injectable()
export class LazyAccountsDataSource extends BaseAccountsDataSource {

    constructor(private http: HttpClient, notifyService: NotifyService, accountsService: AccountsService) {
        super(notifyService, accountsService);
    }

    protected refreshInternal(): Observable<Account[]> {
        return this.accountsService.fetchRootAccounts();
    }

    protected getAccountChildren(account: Account): Observable<Account[]> {
        return this.accountsService.fetchAccountChildren(account.id);
    }
}

@Injectable()
export class FullAccountsDataSource extends BaseAccountsDataSource {

    constructor(private http: HttpClient, notifyService: NotifyService, accountsService: AccountsService) {
        super(notifyService, accountsService);
    }

    protected refreshInternal(): Observable<Account[]> {
        return this.accountsService.fetchAllAccounts();
    }

    protected getAccountChildren(account: Account): Observable<Account[]> {
        const children = account.children.value;
        if (!children || !children.length) {
            throw new Error("uninitialized account (no children)");
        }
        return of(children);
    }
}
