import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTreeModule
} from '@angular/material';

const modules = [
    MatTreeModule,
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
