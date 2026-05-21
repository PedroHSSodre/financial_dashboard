"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_USER_ID, seedFirstAccess } from "@/lib/db/seedFirstAccess";
import { listCreditCardsByUser } from "@/lib/repositories/creditCardsRepository";
import { listTransactionsByUserOrderedDesc } from "@/lib/repositories/transactionsRepository";
import { listWalletsByUser } from "@/lib/repositories/walletsRepository";
import type { CreditCard, Transaction, Wallet } from "@/lib/types";

export function useTransactions() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await seedFirstAccess(DEFAULT_USER_ID);

    const [walletsData, transactionsData, creditCardsData] = await Promise.all([
      listWalletsByUser(DEFAULT_USER_ID),
      listTransactionsByUserOrderedDesc(DEFAULT_USER_ID),
      listCreditCardsByUser(DEFAULT_USER_ID),
    ]);

    setWallets(walletsData);
    setTransactions(transactionsData);
    setCreditCards(creditCardsData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const orderedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (left, right) =>
          new Date(right.date).getTime() - new Date(left.date).getTime(),
      ),
    [transactions],
  );

  const latestEntries = useMemo(
    () =>
      orderedTransactions.filter((item) => item.type === "entrada").slice(0, 2),
    [orderedTransactions],
  );

  const latestExits = useMemo(
    () => orderedTransactions.filter((item) => item.type === "saida").slice(0, 2),
    [orderedTransactions],
  );

  const paginatedTransactions = useMemo(() => {
    const start = page * rowsPerPage;
    return orderedTransactions.slice(start, start + rowsPerPage);
  }, [orderedTransactions, page, rowsPerPage]);

  useEffect(() => {
    const start = page * rowsPerPage;
    if (orderedTransactions.length > 0 && start >= orderedTransactions.length) {
      setPage(0);
    }
  }, [orderedTransactions.length, page, rowsPerPage]);

  const totalIncome = useMemo(
    () => sumTransactionsByType(orderedTransactions, "entrada"),
    [orderedTransactions],
  );

  const totalExpenses = useMemo(
    () => sumTransactionsByType(orderedTransactions, "saida"),
    [orderedTransactions],
  );

  return {
    mainWallet: wallets[0],
    creditCards,
    transactions: orderedTransactions,
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
      orderedTransactions.length === 0 &&
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
