"use client";

import { Box, Button, Container, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ContaPage() {
  const { profile, saveProfile, isLoaded } = useUserProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
  }, [isLoaded, profile?.email, profile?.name]);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    saveProfile({ name: name.trim(), email: email.trim() });
    setSavedMessage("Dados do usuário salvos com sucesso.");
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5">Conta</Typography>
            <Typography color="text.secondary">
              Defina seus dados para exibição no header.
            </Typography>
          </Box>

          <TextField
            label="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
          />

          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleSave} disabled={!canSave}>
              Salvar
            </Button>
          </Stack>

          {savedMessage ? (
            <Typography color="success.main" variant="body2">
              {savedMessage}
            </Typography>
          ) : null}
        </Stack>
      </Container>
    </>
  );
}
