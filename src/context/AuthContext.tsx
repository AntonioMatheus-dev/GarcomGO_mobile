import * as api from "@/services/api";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { saveSession, clearSession } from "@/services/storage";
import { dispararNotificacao } from "@/services/notificacao";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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

interface AdminLoginResult {
  garcons: api.GarcomResponse[];
  accessToken: string;
}

interface AuthContextValue {
  token: string | null;
  restauranteId: string | null;
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  pedidosPronto: number;
  adminLogin: (email: string, password: string) => Promise<AdminLoginResult>;
  selectGarcom: (garcom: api.GarcomResponse, adminToken: string) => Promise<void>;
  logout: () => Promise<void>;
  limparNotificacoes: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  restauranteId: null,
  user: null,
  loading: true,
  isLoggedIn: false,
  pedidosPronto: 0,
  adminLogin: async () => ({ garcons: [], accessToken: "" }),
  selectGarcom: async () => {},
  logout: async () => {},
  limparNotificacoes: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [restauranteId, setRestauranteId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pedidosPronto, setPedidosPronto] = useState(0);

  const doSetGarcom = useCallback(
    async (garcom: api.GarcomResponse, adminToken: string) => {
      const payload = decodeJwtPayload(adminToken);
      const rid = payload?.restauranteId || garcom.restauranteId;

      setToken(adminToken);
      setRestauranteId(rid);
      setUser({
        id: garcom.id,
        nome: garcom.nome,
        email: garcom.email,
        role: garcom.role,
      });

      await saveSession(adminToken, garcom.id, rid);

      const socket = connectSocket(adminToken);
      socket.on('statusPedidoAlterado', (data: { status: string }) => {
        if (data.status === 'ENTREGUE') {
          setPedidosPronto(prev => prev + 1);
          dispararNotificacao('Pedido Pronto!', 'Uma mesa tem pedido pronto para servir!', { tela: 'ocupados' });
        }
      });
    },
    [],
  );

  const adminLogin = useCallback(
    async (email: string, password: string) => {
      const response = await api.login(email, password);
      const payload = decodeJwtPayload(response.accessToken);
      const rid = payload?.restauranteId;

      if (!rid) throw new Error("Restaurante não identificado");

      const garcons = await api.listarGarconsPorRestaurante(rid, response.accessToken);
      return { garcons, accessToken: response.accessToken };
    },
    [],
  );

  const selectGarcom = useCallback(
    async (garcom: api.GarcomResponse, adminToken: string) => {
      await doSetGarcom(garcom, adminToken);
    },
    [doSetGarcom],
  );

  const logout = useCallback(async () => {
    disconnectSocket();
    setToken(null);
    setRestauranteId(null);
    setUser(null);
    setPedidosPronto(0);
    await clearSession();
  }, []);

  const limparNotificacoes = useCallback(() => {
    setPedidosPronto(0);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const session = await import("@/services/storage").then((m) => m.getSession());
        if (session) {
          setToken(session.token);
          setRestauranteId(session.restauranteId);

          const garcons = await api.listarGarconsPorRestaurante(
            session.restauranteId,
            session.token,
          );
          const garcom = garcons.find((g) => g.id === session.garcomId);
          if (garcom) {
            setUser({
              id: garcom.id,
              nome: garcom.nome,
              email: garcom.email,
              role: garcom.role,
            });

            const socket = connectSocket(session.token);
            socket.on('statusPedidoAlterado', (data: { status: string }) => {
              if (data.status === 'ENTREGUE') {
                setPedidosPronto(prev => prev + 1);
                dispararNotificacao('Pedido Pronto!', 'Uma mesa tem pedido pronto para servir!', { tela: 'ocupados' });
              }
            });
          }
        }
      } catch {
        await clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        restauranteId,
        user,
        loading,
        isLoggedIn: !!token && !!user,
        pedidosPronto,
        adminLogin,
        selectGarcom,
        logout,
        limparNotificacoes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
