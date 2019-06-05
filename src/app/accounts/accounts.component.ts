import {Component, OnInit} from '@angular/core';
import {NestedTreeControl} from "@angular/cdk/tree";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {BlockUI, NgBlockUI} from "ng-block-ui";
import {Account} from "./account";
import {AccountsService} from "./accounts.service";
import {FullAccountsDataSource} from "./accounts.datasource";
import {NotifyService} from "../notifications/notify.service";
import {MatBottomSheet} from "@angular/material";
import {
    AccountsTargetTreeSheetComponent,
    AccountsTargetTreeSheetData,
    AccountsTargetTreeSheetResult
} from "./accounts-target-tree.component";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
    providers: [
        AccountsService,
        FullAccountsDataSource,
        {provide: NestedTreeControl, useFactory: () => new NestedTreeControl<Account>(acc => acc.children)}
    ]
})
export class AccountsComponent implements OnInit {
    @BlockUI("accountsTree") blockUI: NgBlockUI;

    constructor(private readonly http: HttpClient,
                private readonly notifyService: NotifyService,
                private readonly accountsService: AccountsService,
                private readonly dataSource: FullAccountsDataSource,
                private readonly treeControl: NestedTreeControl<Account>,
                private readonly bottomSheet: MatBottomSheet) {
        this.dataSource.dataChange.subscribe(accounts => this.treeControl.dataNodes = accounts);
    }

    ngOnInit() {
        this.refresh();
    }

    refresh(expand: number[] = []) {
        this.blockUI.start('Loading...');
        this.dataSource.refresh(accounts => {
            expand.forEach(previouslyExpandedAccountId => {
                let refreshedAccount = null;
                for (const account of accounts) {
                    refreshedAccount = account.findChild(previouslyExpandedAccountId);
                    if (refreshedAccount) {
                        this.treeControl.expand(refreshedAccount);
                        break;
                    }
                }
            });
            this.blockUI.stop();
        });
    }

    moveAccount(event: MouseEvent, accountToMove: Account) {
        type ComponentAlias = AccountsTargetTreeSheetComponent;
        type DataAlias = AccountsTargetTreeSheetData;
        type ResultAlias = AccountsTargetTreeSheetResult;

        const bottomSheetRef = this.bottomSheet.open<ComponentAlias, DataAlias, ResultAlias>(
            AccountsTargetTreeSheetComponent,
            {
                data: {
                    account: accountToMove,
                    expanded: this.treeControl.expansionModel.selected.map(account => account.id)
                }
            }
        );
        bottomSheetRef.afterDismissed().subscribe(parent => {
            if (parent instanceof Account || parent === null) {
                const parentAccount = parent as Account;
                this.accountsService.updateAccountParent(accountToMove.id, parentAccount && parentAccount.id)
                    .subscribe(
                        () => this.refresh(this.treeControl.expansionModel.selected.slice().map(account => account.id)),
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
                        }
                    );
            }
        });
    }

    deleteAccount(event: MouseEvent, account: Account) {
        // TODO: implement "AccountsComponent.deleteAccount(event, account)"
    }
}
