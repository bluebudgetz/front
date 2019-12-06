import {NgModule} from '@angular/core';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';

@NgModule({
    imports: [FontAwesomeModule],
    exports: [FontAwesomeModule],
    providers: [
        {
            provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {
                horizontalPosition: 'end',
                duration: 60 * 1000,
                verticalPosition: 'top',
            }
        }
    ],
})
export class AppFontAwesomeModule {
    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas, far, fab);
    }
}
