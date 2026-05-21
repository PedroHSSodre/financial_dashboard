import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import Card from "@/components/ui/Card";
import { formatCurrencyBRL, formatDateBR } from "@/lib/format";
import type { Transaction, Wallet } from "@/lib/types";

interface SummaryCardProps {
  wallet?: Wallet;
  latestEntries: Transaction[];
  latestExits: Transaction[];
  onNewRecord: () => void;
  isDisabled?: boolean;
}

export default function SummaryCard({
  wallet,
  latestEntries,
  latestExits,
  onNewRecord,
  isDisabled,
}: SummaryCardProps) {
  return (
    <Card
      title="Resumo da conta"
      action={
        <Button
          size="small"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onNewRecord}
          disabled={isDisabled}
        >
          Novo Registro
        </Button>
      }
    >
      <Typography variant="body2" color="textSecondary">
        Saldo atual da carteira
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
        {formatCurrencyBRL(wallet?.balance ?? 0)}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box 
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <TransactionMiniList title="Últimas entradas" items={latestEntries} />
        <TransactionMiniList title="Últimas saídas" items={latestExits} />
      </Box>
    </Card>
  );
}

interface TransactionMiniListProps {
  title: string;
  items: Transaction[];
}

function TransactionMiniList({ title, items }: TransactionMiniListProps) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          Nenhum registro encontrado
        </Typography>
      ) : (
        <Stack spacing={1}>
          {items.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.description}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formatDateBR(item.date)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700 }}
                color={item.type === "entrada" ? "success" : "error"}
              >
                {item.type === "entrada" ? "+" : "-"}
                {formatCurrencyBRL(item.value)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}
