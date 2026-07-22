import { AuthProvider } from "@/context/AuthContext";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { solicitarPermissao, ouvirRespostaNotificacao } from "@/services/notificacao";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    solicitarPermissao();
    let subscription: { remove: () => void } | null = null;
    ouvirRespostaNotificacao((dados) => {
      if (dados?.tela === "ocupados") {
        router.replace("/mesas?filtro=ocupados");
      }
    }).then((s) => { subscription = s; });
    return () => subscription?.remove();
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
