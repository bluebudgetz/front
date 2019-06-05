import {BehaviorSubject} from "rxjs";

export class AccountDTO {
    constructor(public id: number,
                public parentId: number,
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

    get parentId(): number {
        return this.dto.parentId;
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

    findChild(id: number): Account | null {
        if (!this.children.value) {
            throw new Error(`account ${this.name} does not have resolved children`);
        } else if (this.id === id) {
            return this;
        } else {
            const child = this.children.value.reduce((acc, c) => acc || c.findChild(id), null);
            if (child) {
                return child;
            } else {
                return null;
            }
        }
    }
}
