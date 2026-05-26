import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import Input from "@/components/input";
import { useAuth } from "@/context/AuthContext";

export default function IndexPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email.trim(), password);
      router.push("/mesas");
    } catch (error) {
      Alert.alert(
        "Falha no login",
        error instanceof Error ? error.message : "Não foi possível acessar.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.card}>
              <Image
                source={require("@/assets/logo.jpeg")}
                style={styles.Illustration}
              />
              <Text style={styles.title}>
                Bem-vindo ao <Text style={styles.marca}>Garçom GO</Text>
              </Text>
              <Text style={styles.subtitle}>
                Agilize o atendimento e visualize pedidos em tempo real.
              </Text>
              <View style={styles.form}>
                <Input
                  placeholder="Matrícula"
                  value={email}
                  onChangeText={setEmail}
                />
                <Input
                  placeholder="Senha"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Button label="Entrar" onPress={handleLogin} />
              </View>
            </View>
          </View>
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
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
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
  },
  Illustration: {
    width: 240,
    height: 240,
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
});
