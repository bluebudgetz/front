import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";

const ACCOUNTS_URL = "http://localhost:3001/v1/accounts";

export interface Account {
    id: number;
    name: string;
    childCount: number;
    loading?: boolean;
    incoming: number;
    outgoing: number;
}

@Injectable()
export class AccountProvider {

    rootAccounts: BehaviorSubject<Account[]> = new BehaviorSubject<Account[]>([]);

    private accountChildLoaders: Map<number, BehaviorSubject<Account[]>> = new Map();

    constructor(private http: HttpClient) {
        this.http.get<Account[]>(ACCOUNTS_URL)
            .subscribe(
                data => this.rootAccounts.next(data),
                error => {
                    if (error.error instanceof ErrorEvent) {
                        console.error(`JavaScript error occurred while fetching root accounts: `, error.error.message);
                    } else {
                        console.error(`Backend request for root accounts failed: `, error);
                    }
                    this.rootAccounts.error(new Error(`Oops, that's embarrassing! Failed fetching your accounts, please try again.`));
                });
    }

    refresh(): void {
        this.http.get<Account[]>(ACCOUNTS_URL)
            .subscribe(
                data => {
                    this.accountChildLoaders.clear();
                    this.rootAccounts.next(data);
                },
                error => {
                    if (error.error instanceof ErrorEvent) {
                        console.error(`JavaScript error occurred while fetching root accounts: `, error.error.message);
                    } else {
                        console.error(`Backend request for root accounts failed: `, error);
                    }
                    this.rootAccounts.error(new Error(`Oops, that's embarrassing! Failed fetching your accounts, please try again.`));
                });
    }

    loadChildrenFor(parentId: number): BehaviorSubject<Account[]> {
        let childrenLoader = this.accountChildLoaders.get(parentId);
        if (!childrenLoader) {
            childrenLoader = new BehaviorSubject<Account[]>([]);
            this.http.get<Account[]>(ACCOUNTS_URL + `/${parentId}/children`)
                .subscribe(
                    accounts => childrenLoader.next(accounts),
                    error => {
                        if (error.error instanceof ErrorEvent) {
                            console.error(
                                `JavaScript error occurred while fetching child accounts of '${parentId}': `, error.error.message);
                        } else {
                            console.error(`Backend request for child accounts of '${parentId}' failed: `, error);
                        }
                        childrenLoader.error(new Error(`Oops, that's embarrassing! Failed fetching your accounts, please try again.`));
                    },
                    () => {
                    });
            this.accountChildLoaders.set(parentId, childrenLoader);
        }
        return childrenLoader;
    }
}
