import { AuthProvider } from "@/context/AuthContext";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { solicitarPermissao, ouvirRespostaNotificacao } from "@/services/notificacao";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    solicitarPermissao();
    const sub = ouvirRespostaNotificacao((dados) => {
      if (dados?.tela === "ocupados") {
        router.replace("/mesas?filtro=ocupados");
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
