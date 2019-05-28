export class AccountDTO {
    constructor(public id: number,
                public name: string,
                public childCount: number,
                public incoming: number,
                public outgoing: number) {
    }
}

export class Account {
    constructor(private dto: AccountDTO, public level = 1, public loading = false) {
    }

    get id(): number {
        return this.dto.id;
    }

    get name(): string {
        return this.dto.name;
    }

    get incoming(): number {
        return this.dto.incoming;
    }

    get outgoing(): number {
        return this.dto.outgoing;
    }

    get expandable(): boolean {
        return this.dto.childCount > 0;
    }
}
