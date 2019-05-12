import {Component, OnInit} from '@angular/core';
import {AccountVO, FetchChildAccountsQuery, FetchRootAccountsQuery} from "../accounts.service";
import {map} from "rxjs/operators";
import {TreeNode} from "primeng/api";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

    accounts: TreeNode[];

    static accountNodeToTreeNode(account: AccountVO): TreeNode {
        return {
            data: {
                id: account.id,
                name: account.name,
                incoming: account.incoming,
                outgoing: account.outgoing,
                balance: account.incoming - account.outgoing,
            },
            leaf: account.childCount === 0
        };
    }

    constructor(private rootAccounts: FetchRootAccountsQuery, private childAccounts: FetchChildAccountsQuery) {
    }

    ngOnInit() {
        // TODO: handle stale/errors/loading/networkStatus
        this.rootAccounts
            .fetch()
            .pipe(map(result => result.data && result.data.rootAccounts || []))
            .pipe(map(accounts => accounts.map(account => AccountsComponent.accountNodeToTreeNode(account))))
            .subscribe(value => this.accounts = value);
    }

    onNodeExpand(event) {
        const node = event.node;
        // TODO: handle stale/errors/loading/networkStatus
        this.childAccounts
            .fetch({parentId: node.data.id})
            .pipe(map(result => result.data && result.data.childAccounts || []))
            .pipe(map(accounts => accounts.map(account => AccountsComponent.accountNodeToTreeNode(account))))
            .subscribe(value => {
                node.children = value;
                this.accounts = [...this.accounts];
            });
    }
}
