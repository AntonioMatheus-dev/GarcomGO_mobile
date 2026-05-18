import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Notificacao() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandWrapper}>
          <Image
            source={require("@/assets/logo.jpeg")}
            style={styles.Ilustration}
          />
          <View>
            <Text style={styles.greeting}>Olá, Garçom!</Text>
            <Text style={styles.subtitle}>
              Acompanhe os pedidos em tempo real
            </Text>
          </View>
        </View>
        <View style={styles.bellContainer}>
          <Ionicons name="notifications" size={32} color="#337acc" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 22,
    width: "100%",
    maxWidth: 720,
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: "#22365d",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  brandWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  Ilustration: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "800",
    color: "#153e7d",
  },
  subtitle: {
    fontSize: 13,
    color: "#6c7c99",
    marginTop: 4,
  },
  bellContainer: {
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
