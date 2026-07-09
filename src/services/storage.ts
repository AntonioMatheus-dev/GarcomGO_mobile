import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "admin_token";
const GARCOM_ID_KEY = "garcom_id";
const RESTAURANTE_ID_KEY = "restaurante_id";

export async function saveSession(
  token: string,
  garcomId: string,
  restauranteId: string,
) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(GARCOM_ID_KEY, garcomId);
  await SecureStore.setItemAsync(RESTAURANTE_ID_KEY, restauranteId);
}

export async function getSession() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const garcomId = await SecureStore.getItemAsync(GARCOM_ID_KEY);
  const restauranteId = await SecureStore.getItemAsync(RESTAURANTE_ID_KEY);
  if (token && garcomId && restauranteId) {
    return { token, garcomId, restauranteId };
  }
  return null;
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(GARCOM_ID_KEY);
  await SecureStore.deleteItemAsync(RESTAURANTE_ID_KEY);
}
