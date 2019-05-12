import {Component, OnInit} from '@angular/core';
import {FetchTransactionsQuery, TransactionVO} from "../transactions.service";
import {map} from "rxjs/operators";
import {FormBuilder, Validators} from "@angular/forms";
import * as moment from "moment";

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
    maxDate = new Date();

    filtersForm = this.fb.group({
        range: [
            [moment().startOf('day').subtract(30, "days").toDate(), moment().toDate()],
            Validators.required
        ],
    });

    transactions: TransactionVO[];

    constructor(private transactionsQuery: FetchTransactionsQuery, private fb: FormBuilder) {
    }

    ngOnInit() {
    }

    onSubmit() {
        const range = this.filtersForm.get("range");
        this.transactionsQuery
            .fetch({from: range.value[0], until: range.value[1]})
            .pipe(map(result => result.data && result.data.transactions || []))
            .subscribe(transactions => this.transactions = transactions);
    }
}
