import * as api from "@/services/api";
import { createContext, ReactNode, useContext, useState } from "react";

const decodeJwtPayload = (token: string) => {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const decoded =
      typeof globalThis.atob === "function"
        ? globalThis.atob(payload)
        : typeof (globalThis as any).Buffer !== "undefined"
          ? (globalThis as any).Buffer.from(payload, "base64").toString("utf8")
          : null;

    if (!decoded) return null;
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  role: string;
};

interface AuthContextValue {
  token: string | null;
  restauranteId: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  restauranteId: null,
  user: null,
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [restauranteId, setRestauranteId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setToken(response.accessToken);
    setUser(response.administrador);

    const payload = decodeJwtPayload(response.accessToken);
    setRestauranteId(payload?.restauranteId || null);
  };

  const logout = () => {
    setToken(null);
    setRestauranteId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        restauranteId,
        user,
        isLoggedIn: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
