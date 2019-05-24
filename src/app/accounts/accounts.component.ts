import {Component, OnInit} from '@angular/core';
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTree, MatTreeNestedDataSource} from "@angular/material";
import {catchError} from "rxjs/operators";
import {Account, AccountProvider} from "./accounts.provider.service";

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

    treeControl = new NestedTreeControl<Account>(
        node => node.childCount === 0
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
            value => {
                this.dataSource.data = value;
                this.treeControl.dataNodes = value;
            },
            error => console.error("Root accounts subject provided an error: ", error));
    }

    refresh() {
        this.accountsProvider.refresh();
    }
}
