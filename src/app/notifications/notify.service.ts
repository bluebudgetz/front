import {Injectable} from "@angular/core";
import {MatSnackBar} from "@angular/material";

interface NotificationOptions {
}

@Injectable({providedIn: 'root'})
export class NotifyService {

    constructor(private snackBar: MatSnackBar) {
    }

    info(message: string, options: NotificationOptions): void {
        this.snackBar.open(message, "Got it", {panelClass: ["info"]});
    }

    warn(message: string): void {
        this.snackBar.open(message, "Got it", {panelClass: ["warn"]});
    }

    error(message: string): void {
        this.snackBar.open(message, "Got it", {panelClass: ["error"]});
    }
}
