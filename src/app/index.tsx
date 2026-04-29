import { useRouter } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "@/components/Button";
import Input from "@/components/input";

export default function IndexPage() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "height" })}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Image
            source={require("@/assets/logo.jpeg")}
            style={styles.Illustration}
          />
          <Text style={styles.title}>
            Bem-vindo ao <Text style={styles.marca}>Garçom GO</Text>, o app que
            agiliza o atendimento, conecta garçons e cozinha em tempo real.
          </Text>
          <View style={styles.form}>
            <Input placeholder="Matricula" />
            <Input placeholder="senha" />
            <Button label="Entrar" onPress={() => router.push("/mesas")} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.87)",
    padding: 20,
  },
  Illustration: {
    width: 400,
    height: 400,
    alignSelf: "center",
    marginTop: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 900,
    color: "rgba(116, 139, 148, 0.87)",
    marginBottom: 100,
  },
  marca: {
    color: "rgb(51, 122, 204)",
  },
  fundo: {
    flex: 1,
    width: 100,
    height: 800,
  },
  form: {
    gap: 20,
    marginTop: 90,
  },
});
