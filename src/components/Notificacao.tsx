import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

interface NotificacaoProps {
  onNotificacaoPress?: () => void;
}

export default function Notificacao({ onNotificacaoPress }: NotificacaoProps) {
  const { user, pedidosPronto } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandWrapper}>
          <Image
            source={require("@/assets/logo.jpeg")}
            style={styles.Ilustration}
          />
          <View>
            <Text style={styles.greeting}>Olá, {user?.nome || "Garçom"}!</Text>
            <Text style={styles.subtitle}>
              Acompanhe os pedidos em tempo real
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bellContainer}
          onPress={onNotificacaoPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={pedidosPronto > 0 ? "notifications" : "notifications-outline"}
            size={32}
            color={pedidosPronto > 0 ? "#ef4444" : "#337acc"}
          />
          {pedidosPronto > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pedidosPronto}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
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
    gap: 10,
  },
  Ilustration: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "800",
    color: "#153e7d",
  },
  subtitle: {
    fontSize: 12,
    color: "#6c7c99",
    marginTop: 2,
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
