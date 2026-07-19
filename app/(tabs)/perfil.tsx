import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#ffffff" />
          </View>
          <Text style={styles.nome}>{user?.nome || "Garçom"}</Text>
          <Text style={styles.email}>{user?.email || ""}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#337acc" />
            <Text style={styles.infoText}>
              {user?.role === "GARCOM" ? "Garçom" : user?.role || "Usuário"}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ffffff" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e6eefc",
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#337acc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  nome: {
    fontSize: 24,
    fontWeight: "900",
    color: "#153e7d",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: "#5d728f",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#2a4f99",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#153e7d",
    fontWeight: "700",
  },
  logoutButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 14,
    paddingVertical: 16,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
});
