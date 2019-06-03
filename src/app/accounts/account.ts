import {BehaviorSubject} from "rxjs";

export class AccountDTO {
    constructor(public id: number,
                public name: string,
                public childCount: number,
                public incoming: number,
                public outgoing: number,
                public balance: number) {
    }
}

export class Account {
    level = 0;
    readonly children = new BehaviorSubject<Account[]>(null);

    constructor(private dto: AccountDTO, public loading = false) {
    }

    get id(): number {
        return this.dto.id;
    }

    get name(): string {
        return this.dto.name;
    }

    get childCount(): number {
        return this.dto.childCount;
    }

    get incoming(): number {
        return this.dto.incoming;
    }

    get outgoing(): number {
        return this.dto.outgoing;
    }

    get balance(): number {
        return this.dto.balance;
    }

    get expandable(): boolean {
        return this.dto.childCount > 0;
    }
}
