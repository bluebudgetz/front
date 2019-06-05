import {Component, Inject, OnInit} from '@angular/core';
import {NestedTreeControl} from "@angular/cdk/tree";
import {HttpClient} from "@angular/common/http";
import {Account} from "./account";
import {AccountsService} from "./accounts.service";
import {FullAccountsDataSource} from "./accounts.datasource";
import {NotifyService} from "../notifications/notify.service";
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, MatTreeNestedDataSource} from "@angular/material";
import {BlockUI, NgBlockUI} from "ng-block-ui";

interface FoodNode {
    name: string;
    children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
    {
        name: 'Fruit',
        children: [
            {name: 'Apple'},
            {name: 'Banana'},
            {name: 'Fruit loops'},
        ]
    }, {
        name: 'Vegetables',
        children: [
            {
                name: 'Green',
                children: [
                    {name: 'Broccoli'},
                    {name: 'Brussel sprouts'},
                ]
            }, {
                name: 'Orange',
                children: [
                    {name: 'Pumpkins'},
                    {name: 'Carrots'},
                ]
            },
        ]
    },
];

export interface AccountsTargetTreeSheetData {
    account: Account;
    expanded: number[];
}

export type AccountsTargetTreeSheetResult = Account | null | boolean;

@Component({
    selector: 'app-accounts-target-tree',
    styleUrls: ['accounts-target-tree.component.scss'],
    templateUrl: 'accounts-target-tree.component.html',
    providers: [
        AccountsService,
        FullAccountsDataSource,
        {provide: NestedTreeControl, useFactory: () => new NestedTreeControl<Account>(acc => acc.children)}
    ],
})
export class AccountsTargetTreeSheetComponent implements OnInit {
    @BlockUI("bottomAccountsTree") blockUI: NgBlockUI;

    constructor(private readonly http: HttpClient,
                private readonly notifyService: NotifyService,
                private readonly accountsService: AccountsService,
                private readonly dataSource: FullAccountsDataSource,
                private readonly treeControl: NestedTreeControl<Account>,
                private readonly bottomSheetRef: MatBottomSheetRef<AccountsTargetTreeSheetComponent, AccountsTargetTreeSheetResult>,
                @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: AccountsTargetTreeSheetData) {
        this.bottomSheetRef.backdropClick().subscribe(() => this.bottomSheetRef.dismiss(false));
    }

    ngOnInit() {
        this.dataSource.refresh((accounts) => {
            this.treeControl.dataNodes = accounts;

            for (const accountIdToExpand of this.data.expanded) {
                const account = this.dataSource.data.reduce((acc, item) => acc || item.findChild(accountIdToExpand), null);
                if (account) {
                    // TODO: https://github.com/angular/components/issues/16212
                    this.treeControl.expand(account);
                }
            }
            this.blockUI.stop();
        });
    }

    selectAccount(event: MouseEvent, parent: Account | null): void {
        event.preventDefault();
        this.bottomSheetRef.dismiss(parent);
    }
}
