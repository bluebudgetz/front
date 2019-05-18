import {Component, Injectable, OnInit} from '@angular/core';
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material";
import {catchError} from "rxjs/operators";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";

const ACCOUNTS_URL = "http://localhost:3001/v1/accounts";

interface Account {
    id: number;
    name: string;
    childCount: number;
    incoming: number;
    outgoing: number;
}

@Injectable()
class AccountProvider {

    rootAccounts: BehaviorSubject<Account[]> = new BehaviorSubject<Account[]>([]);

    private accountChildLoaders: Map<number, BehaviorSubject<Account[]>> = new Map();

    constructor(private http: HttpClient) {
        this.http.get<Account[]>(ACCOUNTS_URL)
            .subscribe(
                data => this.rootAccounts.next(data),
                error => {
                    if (error.error instanceof ErrorEvent) {
                        console.error(`JavaScript error occurred while fetching root accounts: `, error.error.message);
                    } else {
                        console.error(`Backend request for root accounts failed: `, error);
                    }
                    this.rootAccounts.error(new Error(`Oops, that's embarrassing! Failed fetching your accounts, please try again.`));
                });
    }

    loadChildrenFor(parentId: number): BehaviorSubject<Account[]> {
        let childrenLoader = this.accountChildLoaders[parentId];
        if (!childrenLoader) {
            childrenLoader = new BehaviorSubject<Account[]>([]);
            this.http.get<Account[]>(ACCOUNTS_URL + `/${parentId}/children`)
                .subscribe(
                    accounts => childrenLoader.next(accounts),
                    error => {
                        if (error.error instanceof ErrorEvent) {
                            console.error(
                                `JavaScript error occurred while fetching child accounts of '${parentId}': `, error.error.message);
                        } else {
                            console.error(`Backend request for child accounts of '${parentId}' failed: `, error);
                        }
                        childrenLoader.error(new Error(`Oops, that's embarrassing! Failed fetching your accounts, please try again.`));
                    });
            this.accountChildLoaders[parentId] = childrenLoader;
        }
        return childrenLoader;
    }
}

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
    providers: [AccountProvider]
})
export class AccountsComponent implements OnInit {
    // TODO: handle stale/errors/loading/networkStatus on root/children loading

    constructor(private accountsProvider: AccountProvider) {
    }

    treeControl = new NestedTreeControl<Account>(node =>
        node.childCount === 0
            ? []
            : this.accountsProvider
                .loadChildrenFor(node.id)
                .pipe(catchError(error => {
                    console.error(`Child accounts subject for '${node.id}' failed: `, error);
                    return [];
                })));

    dataSource = new MatTreeNestedDataSource<Account>();

    ngOnInit() {
        this.accountsProvider.rootAccounts.subscribe(
            value => this.dataSource.data = value,
            error => console.error("Root accounts subject provided an error: ", error));
    }

    _nodeHasChildren(_: number, node: Account): boolean {
        return node.childCount > 0;
    }
}
