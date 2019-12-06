import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material/material.module';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        FontAwesomeModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas, far, fab);
    }
}
