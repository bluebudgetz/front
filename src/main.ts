import 'hammerjs';
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {registerLocaleData} from "@angular/common";

import english from '@angular/common/locales/en';
import hebrew from '@angular/common/locales/he';

if (environment.production) {
    enableProdMode();
}

// Fix Hebrew local to use the real NIS symbol ("₪") and place the minus sign (for negatives) in the correct position
hebrew[14][2] = "¤ #,##0.00";
hebrew[17]["NIS"] = [hebrew[15]];

registerLocaleData(english, 'en-US');
registerLocaleData(hebrew, 'he-IL');

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
