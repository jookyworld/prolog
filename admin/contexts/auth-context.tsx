"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { UserResponse } from "@/lib/types";
import { getUser, clearAuth } from "@/lib/auth";
import { authApi } from "@/lib/api";

interface AuthContextType {
  user: UserResponse | null;
  initialized: boolean;
  setUser: (user: UserResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  initialized: false,
  setUser: () => {},
  logout: () => Promise.resolve(),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setUserState(getUser());
    setInitialized(true);
  }, []);

  const setUser = (user: UserResponse) => {
    setUserState(user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, initialized, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
