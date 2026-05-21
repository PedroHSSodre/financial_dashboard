import { Card as MuiCard, CardContent, CardHeader } from "@mui/material";
import type { ReactNode } from "react";

interface AppCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function Card({ title, action, children }: AppCardProps) {
  return (
    <MuiCard>
      <CardHeader title={title} action={action} />
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
}
