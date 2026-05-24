"use client";

import { Box, Container, Typography } from "@mui/material";
import { useState } from "react";
import CreditCardsCard from "@/components/dashboard/CreditCardsCard";
import CreateCreditCardModal from "@/components/dashboard/CreateCreditCardModal";
import CreateTransactionModal from "@/components/dashboard/CreateTransactionModal";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";
import SummaryCard from "@/components/dashboard/SummaryCard";
import Header from "@/components/layout/Header";
import { formatCurrencyBRL } from "@/lib/format";
import { useTransactions } from "@/hooks/useTransactions";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateCreditCardModalOpen, setIsCreateCreditCardModalOpen] = useState(false);
  const {
    mainWallet,
    wallets,
    userId,
    creditCards,
    transactions,
    paginatedTransactions,
    latestEntries,
    latestExits,
    totalIncome,
    totalExpenses,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    refresh,
    isLoading,
  } = useTransactions();

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5">Resumo financeiro</Typography>
          <Typography color="textSecondary">
            Entradas: {formatCurrencyBRL(totalIncome)} | Saídas:{" "}
            {formatCurrencyBRL(totalExpenses)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          <SummaryCard
            wallet={mainWallet}
            latestEntries={latestEntries}
            latestExits={latestExits}
            onNewRecord={() => setIsCreateModalOpen(true)}
            isDisabled={isLoading || !mainWallet}
          />
          <CreditCardsCard
            cards={creditCards}
            onNewCard={() => setIsCreateCreditCardModalOpen(true)}
            isDisabled={isLoading || wallets.length === 0}
          />
        </Box>

        <RecentActivityTable
          transactions={transactions}
          paginatedTransactions={paginatedTransactions}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          refresh={refresh}
        />
      </Container>
      <CreateTransactionModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={refresh}
        wallets={wallets}
        userId={userId}
      />
      <CreateCreditCardModal
        open={isCreateCreditCardModalOpen}
        onClose={() => setIsCreateCreditCardModalOpen(false)}
        onCreated={refresh}
        wallets={wallets}
        userId={userId}
      />
    </>
  );
}
