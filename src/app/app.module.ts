import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {GraphQLModule} from './graphql.module';
import {AppComponent} from './app.component';
import {AccountsComponent} from './accounts/accounts.component';
import {TransactionsComponent} from './transactions/transactions.component';
import {RoutingModule} from './routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PrimeNGModule} from "./primeng.module";
import {LayoutModule} from '@angular/cdk/layout';
import {FlexLayoutModule} from '@angular/flex-layout';
import {IconsModule} from "./icons.module";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        AppComponent,
        AccountsComponent,
        TransactionsComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule, // or NoopAnimationsModule to disable animations
        HttpClientModule,
        RoutingModule,
        FormsModule,
        LayoutModule,
        FlexLayoutModule,
        PrimeNGModule,
        IconsModule,
        GraphQLModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
