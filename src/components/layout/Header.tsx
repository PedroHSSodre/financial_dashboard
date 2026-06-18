"use client";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";

const links = [
  { href: "/", label: "Resumo" },
  { href: "/conta", label: "Conta" },
];

export default function Header() {
  const pathname = usePathname();
  const { profile, isLoaded } = useUserProfile();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Toolbar
        sx={{
          minHeight: 72,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Finanças App
        </Typography>

        <Stack
          direction="row"
          spacing={3}
          sx={{ alignItems: "center", justifySelf: "center" }}
        >
          {links.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Typography
                key={link.href}
                component={Link}
                href={link.href}
                color={isActive ? "textPrimary" : "textSecondary"}
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  borderBottom: isActive ? "2px solid" : "2px solid transparent",
                  borderColor: isActive ? "primary.main" : "transparent",
                  pb: 0.5,
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Typography>
            );
          })}
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "flex-end", justifySelf: "end" }}
        >
          <IconButton aria-label="Notificações">
            <Badge color="error" variant="dot">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
          <Avatar sx={{ width: 34, height: 34 }}>
            {profile?.name?.slice(0, 1).toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {isLoaded && profile?.name ? profile.name : "Conta não definida"}
            </Typography>
            <Typography color="textSecondary" variant="caption">
              {isLoaded && profile?.email ? profile.email : "Defina na tela Conta"}
            </Typography>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
