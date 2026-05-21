"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { createTransaction } from "@/lib/useCases/createTransaction";
import type { TransactionStatus, TransactionType, Wallet } from "@/lib/types";

interface CreateTransactionModalProps {
  open: boolean;
  userId: string;
  wallets: Wallet[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export default function CreateTransactionModal({
  open,
  userId,
  wallets,
  onClose,
  onCreated,
}: CreateTransactionModalProps) {
  const [walletId, setWalletId] = useState("");
  const [type, setType] = useState<TransactionType>("entrada");
  const [status, setStatus] = useState<TransactionStatus>("efetivada");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [value, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const walletOptions = useMemo(() => wallets, [wallets]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultWalletId = walletOptions[0]?.id ?? "";
    setWalletId(defaultWalletId);
    setType("entrada");
    setStatus("efetivada");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setValue("");
    setErrorMessage("");
  }, [open, walletOptions]);

  const handleSubmit = async () => {
    setErrorMessage("");
    const numericValue = Number(value);

    if (!walletId) {
      setErrorMessage("Selecione uma carteira.");
      return;
    }

    if (!date) {
      setErrorMessage("Informe a data da movimentação.");
      return;
    }

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setErrorMessage("O valor deve ser maior que zero.");
      return;
    }

    try {
      setIsSaving(true);
      await createTransaction({
        userId,
        walletId,
        type,
        status,
        description,
        date,
        value: numericValue,
      });
      await onCreated();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível criar o registro.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Novo Registro</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <FormControl fullWidth>
            <InputLabel id="wallet-label">Carteira</InputLabel>
            <Select
              labelId="wallet-label"
              label="Carteira"
              value={walletId}
              onChange={(event) => setWalletId(event.target.value)}
            >
              {walletOptions.map((wallet) => (
                <MenuItem key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="type-label">Tipo</InputLabel>
            <Select
              labelId="type-label"
              label="Tipo"
              value={type}
              onChange={(event) => setType(event.target.value as TransactionType)}
            >
              <MenuItem value="entrada">Entrada</MenuItem>
              <MenuItem value="saida">Saída</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Descrição"
            placeholder="Ex.: Salário, Mercado, Transporte..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              type="date"
              label="Data"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type="number"
              label="Valor (R$)"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            />
          </Stack>

          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as TransactionStatus)}
            >
              <MenuItem value="pendente">Pendente</MenuItem>
              <MenuItem value="efetivada">Efetivada</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
