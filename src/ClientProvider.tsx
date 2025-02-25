"use client";
import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store/store";
import { ThemeProvider as NextThemesProvider } from "next-themes";

function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <Provider store={store}>{children}</Provider>
    </NextThemesProvider>
  );
}

export default ClientProvider;
