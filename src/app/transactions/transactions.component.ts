import {Component, OnInit} from '@angular/core';
import {TransactionVO} from "../transactions.service";
import {FormBuilder, Validators} from "@angular/forms";
import * as moment from "moment";

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

    filtersForm = this.fb.group({
        range: [
            [moment().startOf('day').subtract(30, "days").toDate(), moment().toDate()],
            Validators.required
        ],
    });

    transactions: TransactionVO[];

    constructor(private fb: FormBuilder) {
    }

    ngOnInit() {
    }

    onSubmit() {
    }
}
