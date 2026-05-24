"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_USER_ID } from "@/lib/db/seedFirstAccess";
import type { CreditCard, Transaction, Wallet } from "@/lib/types";
import { loadDashboardData } from "@/lib/useCases/loadDashboardData";

export function useTransactions() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { wallets: walletsData, transactions: transactionsData, creditCards: creditCardsData } =
      await loadDashboardData(DEFAULT_USER_ID);

    setWallets(walletsData);
    setTransactions(transactionsData);
    setCreditCards(creditCardsData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const latestEntries = useMemo(
    () => transactions.filter((item) => item.type === "entrada").slice(0, 2),
    [transactions],
  );

  const latestExits = useMemo(
    () => transactions.filter((item) => item.type === "saida").slice(0, 2),
    [transactions],
  );

  const paginatedTransactions = useMemo(() => {
    const start = page * rowsPerPage;
    return transactions.slice(start, start + rowsPerPage);
  }, [transactions, page, rowsPerPage]);

  useEffect(() => {
    const start = page * rowsPerPage;
    if (transactions.length > 0 && start >= transactions.length) {
      setPage(0);
    }
  }, [transactions.length, page, rowsPerPage]);

  const totalIncome = useMemo(
    () => sumTransactionsByType(transactions, "entrada"),
    [transactions],
  );

  const totalExpenses = useMemo(
    () => sumTransactionsByType(transactions, "saida"),
    [transactions],
  );

  return {
    mainWallet: wallets[0],
    creditCards,
    transactions,
    paginatedTransactions,
    latestEntries,
    latestExits,
    totalIncome,
    totalExpenses,
    wallets,
    userId: DEFAULT_USER_ID,
    isLoading,
    refresh,
    page,
    rowsPerPage,
    onPageChange: setPage,
    onRowsPerPageChange: (value: number) => {
      setRowsPerPage(value);
      setPage(0);
    },
    isFirstAccess:
      transactions.length === 0 &&
      creditCards.length === 0 &&
      (wallets[0]?.balance ?? 0) === 0,
  };
}

function sumTransactionsByType(
  items: Transaction[],
  type: "entrada" | "saida",
): number {
  return items
    .filter((item) => item.type === type)
    .reduce((accumulator, item) => accumulator + item.value, 0);
}
