import Constants from "expo-constants";
import { Platform } from "react-native";

export const getHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.linkingUri?.replace(/^exp:\/\//, "");
  const debuggerHost = hostUri?.split(":")[0] || "localhost";

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

  const responseText = await response.text();
  if (!responseText) {
    return undefined as unknown as T;
  }

  return JSON.parse(responseText) as T;
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

export interface GarcomLoginResponse {
  id: string;
  nome: string;
  email: string;
  restauranteId: string;
  role: string;
}

export async function listarRestaurantes() {
  return apiFetch<{ id: string; nome: string }[]>("/restaurantes", {
    method: "GET",
    headers: buildHeaders(),
  });
}

export interface MesaResponse {
  id: string;
  numero: number;
  capacidade: number;
  status: string;
  restauranteId: string;
}

export async function listarMesasPorRestaurante(
  restauranteId: string,
  token: string,
) {
  return apiFetch<MesaResponse[]>(`/mesas/restaurante/${restauranteId}`, {
    method: "GET",
    headers: buildHeaders(token),
  });
}

export interface GarcomResponse {
  id: string;
  nome: string;
  email: string;
  restauranteId: string;
  role: string;
}

export async function listarGarconsPorRestaurante(
  restauranteId: string,
  token: string,
) {
  return apiFetch<GarcomResponse[]>(`/garcom/restaurante/${restauranteId}`, {
    method: "GET",
    headers: buildHeaders(token),
  });
}

export async function criarPedido(
  mesaId: string,
  garcomId: string,
  token: string,
  observacao?: string,
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
    body: JSON.stringify({ mesaId, garcomId, observacao }),
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

export interface PedidoResponse {
  id: string;
  status: string;
  valorTotal: number;
  mesaId?: string;
  mesa_id?: string;
  garcomId?: string;
  garcom_id?: string;
  createdAt: string;
  observacao?: string;
  itens?: {
    id: string;
    itemId?: string;
    item_id?: string;
    item?: {
      id: string;
      nome?: string;
      categoria?: string;
      preco?: number;
    };
    nome: string;
    categoria?: string;
    quantidade: number;
    preco: number;
    observacao?: string;
  }[];
}

export async function listarPedidosPorRestaurante(
  restauranteId: string,
  token: string,
) {
  return apiFetch<PedidoResponse[]>(`/pedidos/restaurante/${restauranteId}`, {
    method: "GET",
    headers: buildHeaders(token),
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
  token: string,
  observacao?: string,
) {
  return apiFetch<void>("/pedidos/item", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ pedidoId, itemId, quantidade, observacao }),
  });
}
