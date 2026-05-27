"use client";

import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  formatCurrencyBRL,
  formatDateBR,
  getStatusLabel,
  getTransactionTypeLabel,
} from "@/lib/format";
import type { TransactionDetailsDto } from "@/core/application/dto/transaction";

interface TransactionDetailsModalProps {
  open: boolean;
  isLoading: boolean;
  errorMessage: string;
  transaction: TransactionDetailsDto | null;
  onClose: () => void;
}

export default function TransactionDetailsModal({
  open,
  isLoading,
  errorMessage,
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalhes da transação</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : null}

        {!isLoading && errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {!isLoading && !errorMessage && transaction ? (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Dados da transação</Typography>
            <Typography variant="body2">
              <strong>Descrição:</strong> {transaction.description}
            </Typography>
            <Typography variant="body2">
              <strong>Data:</strong> {formatDateBR(transaction.date)}
            </Typography>
            <Typography variant="body2">
              <strong>Valor:</strong> {formatCurrencyBRL(transaction.value)}
            </Typography>
            <Typography variant="body2">
              <strong>Tipo:</strong> {getTransactionTypeLabel(transaction.type)}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {getStatusLabel(transaction.status)}
            </Typography>
            <Typography variant="body2">
              <strong>Compra no cartão:</strong> {transaction.isCreditCard ? "Sim" : "Não"}
            </Typography>

            <Divider />

            <Typography variant="subtitle2">Carteira</Typography>
            <Typography variant="body2">
              <strong>Nome:</strong> {transaction.wallet?.name ?? "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Moeda:</strong> {transaction.wallet?.currency ?? "-"}
            </Typography>

            {transaction.isCreditCard ? (
              <>
                <Divider />
                <Typography variant="subtitle2">Cartão de crédito</Typography>
                <Typography variant="body2">
                  <strong>Nome:</strong> {transaction.creditCard?.name ?? "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Bandeira:</strong> {transaction.creditCard?.brand ?? "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Limite:</strong>{" "}
                  {transaction.creditCard ? formatCurrencyBRL(transaction.creditCard.limit) : "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Limite usado:</strong>{" "}
                  {transaction.creditCard ? formatCurrencyBRL(transaction.creditCard.limitUsed) : "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Fechamento:</strong> {transaction.creditCard?.closingDay ?? "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Vencimento:</strong> {transaction.creditCard?.dueDay ?? "-"}
                </Typography>
              </>
            ) : null}
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
