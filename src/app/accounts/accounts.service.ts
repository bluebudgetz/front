import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {Account, AccountDTO} from "./account";
import {environment} from "../../environments/environment";
import {expand, filter, flatMap, map, retry, tap, toArray} from "rxjs/operators";

@Injectable()
export class AccountsService {

    constructor(private http: HttpClient) {
    }

    fetchRootAccounts(): Observable<Account[]> {
        return this.http.get<AccountDTO[]>(environment.apiURL + "/v1/accounts").pipe(
            retry<AccountDTO[]>(2),
            map(dtos => dtos.map(dto => (new AccountDTO(
                dto.id,
                null,
                dto.name,
                dto.childCount,
                dto.incoming,
                dto.outgoing,
                dto.balance)))),
            map(accountDTOs => accountDTOs.map(dto => new Account(dto)))
        );
    }

    fetchAllAccounts(): Observable<Account[]> {
        // TODO: use a single HTTP request to fetch all accounts in one shot
        return this.fetchRootAccounts().pipe(
            // emit each account separately
            flatMap(accounts => of(...accounts)),

            // recursively fetch children for each account
            expand(account => this.fetchAccountChildren(account.id).pipe(
                tap(children => account.children.next(children)),
                flatMap(children => of(...children)),
            )),

            // filter to keep only the root accounts (child accounts are still kept inside parents' "children" arrays)
            filter(account => !account.parentId),

            // merge it all back to one array containing ALL accounts
            toArray(),
        );
    }

    fetchAccountChildren(parentId: number): Observable<Account[]> {
        return this.http.get<AccountDTO[]>(`${environment.apiURL}/v1/accounts/${parentId}/children`).pipe(
            retry<AccountDTO[]>(2),
            map(dtos => dtos.map(dto => (new AccountDTO(
                dto.id,
                parentId,
                dto.name,
                dto.childCount,
                dto.incoming,
                dto.outgoing,
                dto.balance)))),
            map(accountDTOs => accountDTOs.map(dto => new Account(dto))),
        );
    }

    updateAccountParent(id: number, parentId: number | null): Observable<void> {
        return this.http.patch<void>(`${environment.apiURL}/v1/accounts/${id}`, {parentId});
    }

    deleteAccount(id: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiURL}/v1/accounts/${id}`);
    }
}
