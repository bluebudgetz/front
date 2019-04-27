import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    MatButtonModule, MatCardModule,
    MatCheckboxModule, MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule
} from '@angular/material';

const modules = [
    MatCardModule,
    MatExpansionModule,
    MatToolbarModule,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule
];

@NgModule({
    declarations: [],
    exports: modules,
    imports: [CommonModule].concat(modules)
})
export class MaterialModule {
}
