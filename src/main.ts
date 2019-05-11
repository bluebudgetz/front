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

registerLocaleData(english, 'en-US');
registerLocaleData(hebrew, 'he-IL');

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
