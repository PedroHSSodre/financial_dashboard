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
import { updateCreditCard } from "@/lib/useCases/creditCard/updateCreditCard";
import type { CreditCard, Wallet } from "@/lib/types";

interface EditCreditCardModalProps {
  open: boolean;
  card: CreditCard | null;
  userId: string;
  wallets: Wallet[];
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

export default function EditCreditCardModal({
  open,
  card,
  userId,
  wallets,
  onClose,
  onUpdated,
}: EditCreditCardModalProps) {
  const [walletId, setWalletId] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [limitUsed, setLimitUsed] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const walletOptions = useMemo(() => wallets, [wallets]);

  useEffect(() => {
    if (!open || !card) {
      return;
    }

    setWalletId(card.walletId);
    setName(card.name);
    setBrand(card.brand);
    setLimit(String(card.limit));
    setClosingDay(String(card.closingDay));
    setDueDay(String(card.dueDay));
    setLimitUsed(String(card.limitUsed));
    setErrorMessage("");
  }, [card, open]);

  const handleSubmit = async () => {
    if (!card) {
      return;
    }

    setErrorMessage("");

    try {
      setIsSaving(true);
      await updateCreditCard({
        id: card.id,
        userId,
        walletId,
        name: name.trim(),
        brand: brand.trim(),
        limit: Number(limit),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
        limitUsed: Number(limitUsed),
      });
      await onUpdated();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível atualizar o cartão de crédito.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Cartão</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <FormControl fullWidth>
            <InputLabel id="wallet-edit-credit-card-label">Carteira</InputLabel>
            <Select
              labelId="wallet-edit-credit-card-label"
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
            <TextField
              type="number"
              label="Limite utilizado (R$)"
              value={limitUsed}
              onChange={(event) => setLimitUsed(event.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving || !card}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
