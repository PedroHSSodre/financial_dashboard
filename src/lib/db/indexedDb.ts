import Dexie, { type Table } from "dexie";
import { DB_NAME, DB_SCHEMA_V1, DB_VERSION } from "@/lib/db/schema";
import type { CreditCardDto } from "@/core/application/dto/creditCard";
import type { TransactionDto } from "@/core/application/dto/transaction";
import type { WalletDto } from "@/core/application/dto/wallet";
      
class DashboardDatabase extends Dexie {
  wallets!: Table<WalletDto, string>;
  transactions!: Table<TransactionDto, string>;
  creditCards!: Table<CreditCardDto, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores(DB_SCHEMA_V1);
  }
}

export const db = new DashboardDatabase();
