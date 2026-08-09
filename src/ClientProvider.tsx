"use client";
import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import store from "./redux/store/store";
import { useGetUserQuery } from "@/redux/fetchApi/userApi";
import { setUser, logout } from "@/redux/slices/userSlice";

function UserInitializer() {
  const { status } = useSession();
  const dispatch = useDispatch();
  const { data: userData } = useGetUserQuery(undefined, {
    skip: status !== "authenticated",
  });

  useEffect(() => {
    if (status === "authenticated" && userData?.user) {
      dispatch(setUser(userData.user));
    } else if (status === "unauthenticated") {
      dispatch(logout());
    }
  }, [status, userData, dispatch]);

  return null;
}

function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ReduxProvider store={store}>
        <UserInitializer />
        {children}
      </ReduxProvider>
    </NextThemesProvider>
  );
}

export default ClientProvider;
