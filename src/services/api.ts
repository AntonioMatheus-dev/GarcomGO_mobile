import Constants from "expo-constants";
import { Platform } from "react-native";

const getHost = () => {
  const debuggerHost =
    typeof Constants.manifest?.debuggerHost === "string"
      ? Constants.manifest.debuggerHost.split(":")[0]
      : "localhost";

  if (Platform.OS === "android") {
    if (debuggerHost && debuggerHost !== "localhost") {
      return debuggerHost;
    }
    return "10.0.2.2";
  }

  return debuggerHost || "localhost";
};

const BASE_URL = `http://${getHost()}:3000`;

const buildHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro ao acessar ${path}`);
  }

  return (await response.json()) as T;
}

export interface LoginResponse {
  accessToken: string;
  administrador: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
}

export async function login(email: string, password: string) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

export async function listarRestaurantes() {
  return apiFetch<Array<{ id: string; nome: string }>>("/restaurantes", {
    method: "GET",
    headers: buildHeaders(),
  });
}

export async function criarPedido(
  mesaId: string,
  garcomId: string,
  token: string,
) {
  return apiFetch<{
    id: string;
    status: string;
    valorTotal: number;
    mesaId: string;
    garcomId: string;
    createdAt: string;
  }>("/pedidos", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ mesaId, garcomId }),
  });
}

export async function alterarStatusPedido(
  pedidoId: string,
  status: string,
  token: string,
) {
  return apiFetch<{
    id: string;
    status: string;
    valorTotal: number;
    mesaId: string;
    garcomId: string;
    createdAt: string;
  }>(`/pedidos/${pedidoId}/status`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify({ status }),
  });
}

export interface ItemResponse {
  id: string;
  nome: string;
  descricao?: string | null;
  preco: number;
  categoria: string;
  restauranteId: string;
}

export async function listarItensPorRestaurante(
  restauranteId: string,
  token: string,
) {
  return apiFetch<ItemResponse[]>(`/itens/restaurante/${restauranteId}`, {
    method: "GET",
    headers: buildHeaders(token),
  });
}

export async function adicionarItemPedido(
  pedidoId: string,
  itemId: string,
  quantidade: number,
  precoUnitario: number,
  token: string,
) {
  return apiFetch<void>("/pedidos/item", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ pedidoId, itemId, quantidade, precoUnitario }),
  });
}
