import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import Input from "@/components/input";
import { useAuth } from "@/context/AuthContext";
import type { GarcomResponse } from "@/services/api";

type Etapa = "login" | "selecionar" | "carregando";

export default function IndexPage() {
  const router = useRouter();
  const { isLoggedIn, loading, adminLogin, selectGarcom } = useAuth();
  const [etapa, setEtapa] = useState<Etapa>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [garcons, setGarcons] = useState<GarcomResponse[]>([]);
  const [tecladoVisivel, setTecladoVisivel] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !loading) {
      router.replace("/mesas");
    }
  }, [isLoggedIn, loading, router]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setTecladoVisivel(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setTecladoVisivel(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#337acc" />
        </View>
      </SafeAreaView>
    );
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Login", "Informe email e senha do administrador.");
      return;
    }

    try {
      setEntrando(true);
      const { garcons, accessToken } = await adminLogin(email, password);
      setGarcons(garcons);
      setAdminToken(accessToken);
      setEtapa("selecionar");
    } catch (error) {
      Alert.alert(
        "Falha no login",
        error instanceof Error ? error.message : "Não foi possível entrar.",
      );
    } finally {
      setEntrando(false);
    }
  };

  const handleSelecionarGarcom = async (garcom: GarcomResponse) => {
    if (!adminToken) return;

    try {
      setEtapa("carregando");
      await selectGarcom(garcom, adminToken);
      router.replace("/mesas");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Não foi possível selecionar o garçom.",
      );
      setEtapa("selecionar");
    }
  };

  if (etapa === "selecionar" || etapa === "carregando") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Image
              source={require("@/assets/logo.jpeg")}
              style={styles.Illustration}
            />
            <Text style={styles.title}>Selecione o Garçom</Text>
            <Text style={styles.subtitle}>
              Escolha seu nome para acessar o sistema
            </Text>

            {etapa === "carregando" ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color="#337acc" />
                <Text style={styles.loadingText}>Entrando...</Text>
              </View>
            ) : (
              <FlatList
                data={garcons}
                keyExtractor={(item) => item.id}
                style={styles.lista}
                contentContainerStyle={styles.listaContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.garcomItem}
                    onPress={() => handleSelecionarGarcom(item)}
                  >
                    <Text style={styles.garcomNome}>{item.nome}</Text>
                    <Text style={styles.garcomEmail}>{item.email}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Nenhum garçom cadastrado para este restaurante.
                  </Text>
                }
              />
            )}

            <TouchableOpacity
              style={styles.voltar}
              onPress={() => {
                setEtapa("login");
                setAdminToken(null);
              }}
            >
              <Text style={styles.voltarText}>Voltar ao login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.spacer} />
          <View style={styles.card}>
            {!tecladoVisivel && (
              <Image
                source={require("@/assets/logo.jpeg")}
                style={styles.Illustration}
              />
            )}
            <Text style={styles.title}>
              Bem-vindo ao <Text style={styles.marca}>Garcom GO</Text>
            </Text>
            <Text style={styles.subtitle}>
              Faça login como administrador para liberar o acesso dos garçons.
            </Text>
            <View style={styles.form}>
              <Input
                placeholder="Email do administrador"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                placeholder="Senha"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Button
                label={entrando ? "Entrando..." : "Entrar"}
                onPress={handleLogin}
                disabled={entrando}
              />
            </View>
          </View>
          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e9f0ff",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#2a4f99",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    maxHeight: "90%",
  },
  Illustration: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 18,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#153e7d",
    textAlign: "center",
    marginBottom: 12,
  },
  marca: {
    color: "rgb(51, 122, 204)",
  },
  subtitle: {
    fontSize: 15,
    color: "#5d728f",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 22,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  lista: {
    width: "100%",
    maxHeight: 300,
  },
  listaContent: {
    gap: 8,
  },
  garcomItem: {
    backgroundColor: "#f0f5ff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dce5ff",
  },
  garcomNome: {
    fontSize: 18,
    fontWeight: "800",
    color: "#153e7d",
  },
  garcomEmail: {
    fontSize: 13,
    color: "#6c7c99",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#8a97b8",
    textAlign: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#337acc",
    marginTop: 12,
    fontWeight: "700",
  },
  voltar: {
    marginTop: 20,
    padding: 8,
  },
  voltarText: {
    color: "#337acc",
    fontSize: 14,
    fontWeight: "700",
  },
});
