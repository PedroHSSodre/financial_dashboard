"use client";

import {
  Chip,
  Paper,
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
  getTransactionTypeLabel,
} from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface RecentActivityTableProps {
  transactions: Transaction[];
  paginatedTransactions: Transaction[];
  page: number;
  rowsPerPage: number;
  onPageChange: (value: number) => void;
  onRowsPerPageChange: (value: number) => void;
}

export default function RecentActivityTable({
  transactions,
  paginatedTransactions,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: RecentActivityTableProps) {
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
                  >{getTransactionTypeLabel(item.type)}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{formatDateBR(item.date)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={item.status === "efetivada" ? "success" : "warning"}
                      label={getStatusLabel(item.status)}
                      variant="outlined"
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
    </Card>
  );
}
