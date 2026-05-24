export const DB_NAME = "financas-dashboard-db";

export const DB_VERSION = 1;

export const DB_SCHEMA_V1 = {
  wallets: "id, userId",
  transactions: "id, userId, walletId, creditCardId, isCreditCard, date, [userId+date]",
  creditCards: "id, userId, walletId",
};
