import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Card from "@/components/ui/Card";
import { formatCurrencyBRL } from "@/lib/format";
import type { CreditCard } from "@/lib/types";

interface CreditCardsCardProps {
  cards: CreditCard[];
}

export default function CreditCardsCard({ cards }: CreditCardsCardProps) {
  return (
    <Card
      title="Cartões de crédito"
      action={
        <Button size="small" variant="contained" startIcon={<AddRoundedIcon />}>
          Novo cartão
        </Button>
      }
    >
      {cards.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          Nenhum registro encontrado
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {cards.map((card) => (
            <Paper key={card.id} variant="outlined" sx={{ p: 1.5 }}>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {card.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {card.brand}
                  </Typography>
                </Box>
                <IconButton size="small" aria-label="Editar cartão">
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                <Detail label="Limite" value={formatCurrencyBRL(card.limit)} />
                <Detail label="Fechamento" value={`Dia ${card.closingDay}`} />
                <Detail label="Vencimento" value={`Dia ${card.dueDay}`} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Card>
  );
}

interface DetailProps {
  label: string;
  value: string;
}

function Detail({ label, value }: DetailProps) {
  return (
    <Box>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}
