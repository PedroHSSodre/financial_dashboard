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
import { createTransaction } from "@/lib/useCases/transaction/createTransaction";
import type { CreditCard, TransactionStatus, TransactionType, Wallet } from "@/lib/types";

interface CreateTransactionModalProps {
  open: boolean;
  userId: string;
  wallets: Wallet[];
  creditCards: CreditCard[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export default function CreateTransactionModal({
  open,
  userId,
  wallets,
  creditCards,
  onClose,
  onCreated,
}: CreateTransactionModalProps) {
  const [walletId, setWalletId] = useState("");
  const [creditCardId, setCreditCardId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<TransactionType>("entrada");
  const [status, setStatus] = useState<TransactionStatus>("efetivada");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [value, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const walletOptions = useMemo(() => wallets, [wallets]);
  const creditCardOptions = useMemo(() => creditCards, [creditCards]);

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

    return () => {
      setCreditCardId(undefined);
    };
  }, [open, walletOptions]);

  const handleSubmit = async () => {
    setErrorMessage("");
    const nextType = creditCardId ? "saida" : type;
    const nextWalletId = creditCardId ? creditCardOptions.find((creditCard) => creditCard.id === creditCardId)?.walletId : walletId;
    
    if(!nextWalletId) {
      setErrorMessage("Selecione uma carteira.");
      return;
    }

    try {
      setIsSaving(true);
      const transaction = {
        userId,
        walletId: nextWalletId,
        type: nextType,
        status,
        description,
        date,
        value: Number(value),
        isCreditCard: !!creditCardId,
        creditCardId,
      }
      console.log(transaction);
      await createTransaction(transaction);
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
            <InputLabel id="credit-card-label">Cartão de crédito</InputLabel>
            <Select
              labelId="credit-card-label"
              label="Cartão de crédito"
              value={creditCardId ?? ""}
              onChange={(event) => setCreditCardId(event.target.value)}
            >
              {creditCardOptions.map((creditCard) => (
                <MenuItem key={creditCard.id} value={creditCard.id}>
                  {creditCard.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>



          {!creditCardId ? 
            <>
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
            </> 
          : null}

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
