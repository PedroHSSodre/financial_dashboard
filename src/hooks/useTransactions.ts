"use client";

import { useMemo, useState } from "react";
import { dashboardMockData } from "@/lib/mockData";
import type { Transaction } from "@/lib/types";

export function useTransactions() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { wallets, creditCards, transactions } = dashboardMockData;

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
  console.log(items);
  return items
    .filter((item) => item.type === type)
    .reduce((accumulator, item) => accumulator + item.value, 0);
}
