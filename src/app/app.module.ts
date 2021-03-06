import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {AccountsComponent} from './accounts/accounts.component';
import {TransactionsComponent} from './transactions/transactions.component';
import {RoutingModule} from './routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import {FlexLayoutModule} from '@angular/flex-layout';
import {IconsModule} from "./icons.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from './material.module';
import {BlockUIModule} from "ng-block-ui";
import {AppHttpModule} from "./http.module";

@NgModule({
    declarations: [
        AppComponent,
        AccountsComponent,
        TransactionsComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule, // or NoopAnimationsModule to disable animations
        AppHttpModule,
        RoutingModule,
        FormsModule,
        ReactiveFormsModule,
        LayoutModule,
        FlexLayoutModule,
        IconsModule,
        MaterialModule,
        BlockUIModule.forRoot()
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
