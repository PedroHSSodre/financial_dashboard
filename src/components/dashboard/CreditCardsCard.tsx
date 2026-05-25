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
  onNewCard: () => void;
  onEditCard: (card: CreditCard) => void;
  isDisabled?: boolean;
}

export default function CreditCardsCard({
  cards,
  onNewCard,
  onEditCard,
  isDisabled,
}: CreditCardsCardProps) {
  return (
    <Card
      title="Cartões de crédito"
      action={
        <Button
          size="small"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onNewCard}
          disabled={isDisabled}
        >
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
                <IconButton
                  size="small"
                  aria-label="Editar cartão"
                  onClick={() => onEditCard(card)}
                  disabled={isDisabled}
                >
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                <Detail label="Fechamento" value={`Dia ${card.closingDay}`} />
                <Detail label="Vencimento" value={`Dia ${card.dueDay}`} />
              </Stack>
              
              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                <Detail label="Limite" value={formatCurrencyBRL(card.limit)} />
                <Detail label="Limite Restante" value={formatCurrencyBRL(card.remainingLimit)} />
                <Detail label="Utilizado" value={formatCurrencyBRL(card.limitUsed)} />
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
