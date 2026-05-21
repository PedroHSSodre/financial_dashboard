"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PropsWithChildren } from "react";
import theme from "@/lib/theme";

export default function ThemeRegistry({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
