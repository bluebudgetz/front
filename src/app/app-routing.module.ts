import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {AccountsComponent} from "./accounts/accounts.component";
import {TransactionsComponent} from "./transactions/transactions.component";

const routes: Routes = [
    {path: '', redirectTo: '/accounts', pathMatch: 'full'},
    {path: 'accounts', component: AccountsComponent},
    {path: 'transactions', component: TransactionsComponent},
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {
}
