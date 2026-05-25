"use client";

import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import Card from "@/components/ui/Card";
import {
  formatCurrencyBRL,
  formatDateBR,
  getStatusLabel,
} from "@/lib/format";
import type { Transaction, TransactionDetails } from "@/lib/types";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { deleteTransaction } from "@/lib/useCases/transaction/deleteTransaction";
import { efetivateTransaction } from "@/lib/useCases/transaction/efetivateTransaction";
import { getTransaction } from "@/lib/useCases/transaction/getTransaction";
import { useState } from "react";
import TransactionDetailsModal from "@/components/dashboard/TransactionDetailsModal";

interface RecentActivityTableProps {
  transactions: Transaction[];
  paginatedTransactions: Transaction[];
  page: number;
  rowsPerPage: number;
  onPageChange: (value: number) => void;
  onRowsPerPageChange: (value: number) => void;
  refresh: () => void;
}

export default function RecentActivityTable({
  transactions,
  paginatedTransactions,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  refresh,
}: RecentActivityTableProps) {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
  const [detailsError, setDetailsError] = useState("");

  const handleDelete = async (transaction: Transaction) => {
    await deleteTransaction(transaction);
    refresh();
  };
  const handleEfetivate = async (transaction: Transaction) => {
    if(transaction.status === "efetivada") {
      return;
    }
    await efetivateTransaction(transaction);
    refresh();
  };
  const handleOpenDetails = async (transactionId: string) => {
    setDetailsError("");
    setIsDetailsModalOpen(true);
    setIsLoadingDetails(true);

    try {
      const transaction = await getTransaction(transactionId);

      if (!transaction) {
        setSelectedTransaction(null);
        setDetailsError("Transação não encontrada.");
        return;
      }

      setSelectedTransaction(transaction);
    } catch {
      setSelectedTransaction(null);
      setDetailsError("Não foi possível carregar os detalhes da transação.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedTransaction(null);
    setDetailsError("");
  };

  return (
    <Card title="Atividade recente">
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography sx={{ py: 2, textAlign: "center" }} color="textSecondary">
                    Nenhum registro encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell
                    sx={{
                      color: item.type === "entrada" ? "success.main" : "error.main",
                    }}
                  >
                    {item.isCreditCard ? <Chip
                      size="small"
                      color="info"
                      label="Cartão de crédito"
                      variant="outlined"
                    /> : <Chip
                      size="small"
                      color="primary"
                      label="Debito"
                      variant="outlined"
                    />}
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{formatDateBR(item.date)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={item.status === "efetivada" ? "success" : "warning"}
                      label={getStatusLabel(item.status)}
                      variant="outlined"
                      onClick={() => handleEfetivate(item)}
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: item.type === "entrada" ? "success.main" : "error.main",
                      fontWeight: 700,
                    }}
                  >
                    {item.type === "entrada" ? "+" : "-"}
                    {formatCurrencyBRL(item.value)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleOpenDetails(item.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={transactions.length}
        page={page}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(Number(event.target.value))
        }
        rowsPerPageOptions={[5, 10, 20]}
        labelRowsPerPage="Itens por página"
      />

      <TransactionDetailsModal
        open={isDetailsModalOpen}
        isLoading={isLoadingDetails}
        errorMessage={detailsError}
        transaction={selectedTransaction}
        onClose={handleCloseDetails}
      />
    </Card>
  );
}
