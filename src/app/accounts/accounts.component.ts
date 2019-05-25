import {Component, OnInit} from '@angular/core';
import {FlatTreeControl} from "@angular/cdk/tree";
import {Account, AccountsDataSource} from "./accounts.provider.service";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
    private readonly treeControl: FlatTreeControl<Account>;
    private readonly dataSource: AccountsDataSource;

    constructor(private http: HttpClient) {
        this.treeControl = new FlatTreeControl<Account>(node => node.level, node => node.expandable);
        this.dataSource = new AccountsDataSource(this.http, this.treeControl);
    }

    ngOnInit() {
        this.dataSource.refresh();
    }

    refresh() {
        this.dataSource.refresh();
    }
}
