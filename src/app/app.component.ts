import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    sideBarOpen = false;
    menu = [
        { path: "/accounts", icon: "balance-scale", text: "Balance" },
        { path: "/transactions", icon: "list-alt", text: "Transactions" },
        { path: "/settings", icon: "cog", text: "Settings" },
        { path: "/about", icon: "info-circle", text: "About" },
    ];
}
