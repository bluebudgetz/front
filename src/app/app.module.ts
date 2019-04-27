import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {GraphQLModule} from './graphql.module';
import {AppComponent} from './app.component';
import {AccountsComponent} from './accounts/accounts.component';
import {TransactionsComponent} from './transactions/transactions.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material.module';
import {LayoutModule} from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';
import {AppHeaderComponent} from "./header/header.component";
import {AppFooterComponent} from "./footer/footer.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@NgModule({
    declarations: [
        AppComponent,
        AppHeaderComponent,
        AppFooterComponent,
        AccountsComponent,
        TransactionsComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule, // or NoopAnimationsModule to disable animations
        HttpClientModule,
        GraphQLModule,
        AppRoutingModule,
        LayoutModule,
        MaterialModule,
        FlexLayoutModule,
        FontAwesomeModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
