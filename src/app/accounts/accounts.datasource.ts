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

@Injectable()
export class AccountsDataSource implements DataSource<Account> {
    private readonly connectedViewers: DataSourceConnection<Account>[] = [];
    readonly dataChange = new BehaviorSubject<Account[]>([]);

    constructor(private http: HttpClient,
                private readonly notifyService: NotifyService,
                private accountsService: AccountsService) {
    }

    get data(): Account[] {
        return this.dataChange.value;
    }

    set data(accounts: Account[]) {
        this.dataChange.next(accounts);
    }

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

    handleExpansionChange(change: SelectionChange<Account>) {
        of<Account>(...change.added).pipe(
            filter<Account>(account => account.expandable),
            tap<Account>(account => account.loading = true),
            mergeMap<Account, Observable<Account>>(parent => {
                if (parent.children.value) {
                    return of(parent);
                }

                return this.accountsService.fetchAccountChildren(parent.id).pipe(
                    tap<Account[]>(children => children.forEach(child => child.level = parent.level + 1)),
                    map<Account[], Account>(children => {
                        parent.children.next(children);
                        return parent;
                    }),
                    catchError(error => {
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
                        parent.children.next(null);
                        return of(parent);
                    }),
                );
            }),
            tap<Account>(account => account.loading = false),
            toArray(),
        ).subscribe(() => this.data = this.data.slice());

        of<Account>(...change.removed.reverse()).pipe(
            filter<Account>(account => account.expandable),
            tap<Account>(account => account.loading = false),
            toArray(),
        ).subscribe(() => this.data = this.data.slice());
    }
}
