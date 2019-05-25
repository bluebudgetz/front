import {Injectable} from "@angular/core";
import {BehaviorSubject, merge, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {DataSource} from "@angular/cdk/table";
import {FlatTreeControl} from "@angular/cdk/tree";
import {CollectionViewer, SelectionChange} from "@angular/cdk/collections";
import {delay, map} from "rxjs/operators";
import {environment} from "../../environments/environment";

export class AccountDTO {
    constructor(public id: number,
                public name: string,
                public childCount: number,
                public incoming: number,
                public outgoing: number) {
    }
}

export class Account {
    constructor(private dto: AccountDTO, public level = 1, public loading = false) {
    }

    get id(): number {
        return this.dto.id;
    }

    get name(): string {
        return this.dto.name;
    }

    get incoming(): number {
        return this.dto.incoming;
    }

    get outgoing(): number {
        return this.dto.outgoing;
    }

    get expandable(): boolean {
        return this.dto.childCount > 0;
    }
}

@Injectable()
export class AccountsDataSource implements DataSource<Account> {

    dataChange = new BehaviorSubject<Account[]>([]);

    constructor(private http: HttpClient, private treeControl: FlatTreeControl<Account>) {
    }

    get data(): Account[] {
        return this.dataChange.value;
    }

    set data(value: Account[]) {
        this.treeControl.dataNodes = value;
        this.dataChange.next(value);
    }

    refresh() {
        this.http.get<AccountDTO[]>(environment.apiURL + "/v1/accounts")
            .pipe(delay(1000))
            .subscribe(
                accounts => this.data = accounts.map(acc => new Account(acc, 0)),
                error => {
                    if (error.error instanceof ErrorEvent) {
                        console.error(`JavaScript error occurred while fetching root accounts: `, error.error.message);
                    } else {
                        console.error(`Backend request for root accounts failed: `, error);
                    }
                    // TODO: notify user (e.g. "Oops, that's embarrassing! Failed fetching your accounts, please try again.")
                });
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
        // TODO: implement "AccountsDataSource.disconnect(CollectionViewer)"
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
            .pipe(delay(1000))
            .subscribe(
                accounts => {
                    if (expand) {
                        const nodes = accounts.map(acc => new Account(acc, node.level + 1));
                        this.data.splice(index + 1, 0, ...nodes);
                    } else {
                        // delete all nodes following this parent in the data array, until the next sibling
                        let count = 0;
                        for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {
                        }
                        this.data.splice(index + 1, count);
                    }

                    // notify the change
                    this.dataChange.next(this.data);
                    node.loading = false;
                },
                error => {
                    if (error.error instanceof ErrorEvent) {
                        console.error(
                            `JavaScript error occurred while fetching child accounts of '${node.id}': `, error.error.message);
                    } else {
                        console.error(`Backend request for child accounts of '${node.id}' failed: `, error);
                    }
                    // TODO: notify user (e.g. "Oops, that's embarrassing! Failed fetching your accounts, please try again.")
                });
    }
}
