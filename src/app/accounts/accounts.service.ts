import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {Account, AccountDTO} from "./account";
import {environment} from "../../environments/environment";
import {map, retry} from "rxjs/operators";

@Injectable()
export class AccountsService {

    constructor(private http: HttpClient) {
    }

    fetchAccounts(): Observable<Account[]> {
        return this.http.get<AccountDTO[]>(environment.apiURL + "/v1/accounts")
            .pipe(retry<AccountDTO[]>(2))
            .pipe(map(dtos => dtos.map(dto => (new AccountDTO(dto.id, dto.name, dto.childCount, dto.incoming, dto.outgoing, dto.balance)))))
            .pipe(map(accountDTOs => accountDTOs.map(dto => new Account(dto))));
    }

    fetchAccountChildren(parentId: number): Observable<Account[]> {
        return this.http.get<AccountDTO[]>(`${environment.apiURL}/v1/accounts/${parentId}/children`)
            .pipe(retry<AccountDTO[]>(2))
            .pipe(map(dtos => dtos.map(dto => (new AccountDTO(dto.id, dto.name, dto.childCount, dto.incoming, dto.outgoing, dto.balance)))))
            .pipe(map(accountDTOs => accountDTOs.map(dto => new Account(dto))));
    }

    updateAccountParent(id: number, parentId: number | null): Observable<void> {
        return this.http.patch<void>(`${environment.apiURL}/v1/accounts/${id}`, {parentId});
    }
}
