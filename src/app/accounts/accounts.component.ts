import {Component, OnInit} from '@angular/core';
import {NestedTreeControl} from "@angular/cdk/tree";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {BlockUI, NgBlockUI} from "ng-block-ui";
import {Account} from "./account";
import {AccountsService} from "./accounts.service";
import {AccountsDataSource} from "./accounts.datasource";
import {NotifyService} from "../notifications/notify.service";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
    providers: [
        AccountsService,
        AccountsDataSource,
        {provide: NestedTreeControl, useFactory: () => new NestedTreeControl<Account>(acc => acc.children)}
    ]
})
export class AccountsComponent implements OnInit {
    @BlockUI("accountsTree") blockUI: NgBlockUI;

    constructor(private readonly http: HttpClient,
                private readonly notifyService: NotifyService,
                private readonly accountsService: AccountsService,
                private readonly dataSource: AccountsDataSource,
                private readonly treeControl: NestedTreeControl<Account>) {
        this.dataSource.dataChange.subscribe(accounts => this.treeControl.dataNodes = accounts);
    }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.blockUI.start('Loading...');
        this.accountsService.fetchAccounts().subscribe(
            accounts => {
                this.dataSource.data = accounts;
                this.blockUI.stop();
            },
            error => {
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
                this.blockUI.stop();
            }
        );
    }

    /*
        dragDrop(event: CdkDragDrop<string[]>) {
            const svc = this.accountsService;

            const data = this.dataSource.dataChange.value.slice();
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
                        this.dataSource.dataChange.next(results.roots);
                        this.treeControl.dataNodes = results.roots;
                    });
    }
    */
}
