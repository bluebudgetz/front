import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    sideBarOpen = false;
    menu = [
        {path: '/accounts', icon: 'account_balance', text: 'Balance'},
        {path: '/transactions', icon: 'view_list', text: 'Transactions'},
        {path: '/settings', icon: 'settings', text: 'Settings'},
        {path: '/about', icon: 'info', text: 'About'},
    ];
}
