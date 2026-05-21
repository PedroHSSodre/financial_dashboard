import Dexie, { type Table } from "dexie";
import { DB_NAME, DB_SCHEMA_V1, DB_VERSION } from "@/lib/db/schema";
import type { CreditCard, Transaction, Wallet } from "@/lib/types";

class DashboardDatabase extends Dexie {
  wallets!: Table<Wallet, string>;
  transactions!: Table<Transaction, string>;
  creditCards!: Table<CreditCard, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores(DB_SCHEMA_V1);
  }
}

export const db = new DashboardDatabase();
