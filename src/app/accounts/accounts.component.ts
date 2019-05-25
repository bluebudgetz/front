import {Component, OnInit} from '@angular/core';
import {FlatTreeControl} from "@angular/cdk/tree";
import {Account, AccountsDataSource} from "./accounts.provider.service";
import {HttpClient} from "@angular/common/http";
import {BlockUI, NgBlockUI} from "ng-block-ui";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
    @BlockUI("accountsTree") blockUI: NgBlockUI;
    private readonly treeControl: FlatTreeControl<Account>;
    private readonly dataSource: AccountsDataSource;

    constructor(private http: HttpClient) {
        this.treeControl = new FlatTreeControl<Account>(node => node.level, node => node.expandable);
        this.dataSource = new AccountsDataSource(this.http, this.treeControl);
        this.dataSource.dataChange.subscribe(
            () => this.blockUI.stop(),
            () => this.blockUI.stop());
    }

    ngOnInit() {
        this.blockUI.start('Loading...');
        this.dataSource.refresh();
    }

    refresh() {
        this.blockUI.start('Loading...');
        this.dataSource.refresh();
    }
}
