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
import { createCreditCard } from "@/lib/useCases/creditCard/createCreditCard";
import type { Wallet } from "@/lib/types";

interface CreateCreditCardModalProps {
  open: boolean;
  userId: string;
  wallets: Wallet[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export default function CreateCreditCardModal({
  open,
  userId,
  wallets,
  onClose,
  onCreated,
}: CreateCreditCardModalProps) {
  const [walletId, setWalletId] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const walletOptions = useMemo(() => wallets, [wallets]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setWalletId(walletOptions[0]?.id ?? "");
    setName("");
    setBrand("");
    setLimit("");
    setClosingDay("");
    setDueDay("");
    setErrorMessage("");
  }, [open, walletOptions]);

  const handleSubmit = async () => {
    setErrorMessage("");
    try {
      setIsSaving(true);
      await createCreditCard({
        userId,
        walletId,
        name: name.trim(),
        brand: brand.trim(),
        limit: Number(limit),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
      });
      await onCreated();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível criar o cartão de crédito.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Novo Cartão</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <FormControl fullWidth>
            <InputLabel id="wallet-credit-card-label">Carteira</InputLabel>
            <Select
              labelId="wallet-credit-card-label"
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

          <TextField
            label="Nome do cartão"
            placeholder="Ex.: Cartão principal"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />

          <TextField
            label="Bandeira"
            placeholder="Ex.: Visa, Mastercard..."
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            fullWidth
          />

          <TextField
            type="number"
            label="Limite (R$)"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              type="number"
              label="Dia de fechamento"
              value={closingDay}
              onChange={(event) => setClosingDay(event.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: 31, step: 1 } }}
            />
            <TextField
              type="number"
              label="Dia de vencimento"
              value={dueDay}
              onChange={(event) => setDueDay(event.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: 31, step: 1 } }}
            />
          </Stack>
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
