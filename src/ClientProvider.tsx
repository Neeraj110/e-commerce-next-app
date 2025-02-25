"use client";
import type React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import store from "./redux/store/store";

function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </NextThemesProvider>
  );
}

export default ClientProvider;
