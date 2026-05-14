import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Notificacao() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/logo.jpeg")}
          style={styles.Ilustration}
        />
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    width: "100%",
    maxWidth: 720,
    minHeight: 140,
    borderRadius: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  Ilustration: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  bellContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
