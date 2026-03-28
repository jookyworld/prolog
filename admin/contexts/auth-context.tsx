"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { UserResponse } from "@/lib/types";
import { getUser, clearAuth } from "@/lib/auth";

interface AuthContextType {
  user: UserResponse | null;
  setUser: (user: UserResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(null);

  useEffect(() => {
    setUserState(getUser());
  }, []);

  const setUser = (user: UserResponse) => {
    setUserState(user);
  };

  const logout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
