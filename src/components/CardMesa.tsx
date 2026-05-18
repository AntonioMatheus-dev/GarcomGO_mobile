import { Pedido } from "@/data/cardapio";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CardMesaProps {
  mesaId: string;
  pedido?: Pedido;
  onAdicionarPedido: (mesaId: string) => void;
  onVerDetalhes: (mesaId: string) => void;
}

export default function CardMesa({
  mesaId,
  pedido,
  onAdicionarPedido,
  onVerDetalhes,
}: CardMesaProps) {
  const temPedido = pedido && pedido.itens.length > 0;
  const statusFinalizado = pedido?.status === "finalizado" && temPedido;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.mesaId}>Mesa {mesaId}</Text>
        <View
          style={[
            styles.statusBadge,
            statusFinalizado ? styles.statusGreen : styles.statusRed,
          ]}
        >
          <Text style={styles.statusText}>
            {statusFinalizado ? "Finalizado" : "Aberto"}
          </Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <Ionicons
          name={statusFinalizado ? "checkmark-circle" : "time"}
          size={36}
          color={statusFinalizado ? "#44bb66" : "#ff6b6b"}
        />
        <Text style={styles.infoText}>
          {temPedido ? `${pedido.itens.length} itens` : "Nenhum pedido"}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          statusFinalizado ? styles.btnDetalhes : styles.btnAdicionar,
        ]}
        onPress={() =>
          statusFinalizado ? onVerDetalhes(mesaId) : onAdicionarPedido(mesaId)
        }
      >
        <Text style={styles.buttonText}>
          {statusFinalizado ? "Ver Detalhes" : "Adicionar Pedido"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    flexBasis: "48%",
    minWidth: 160,
    borderWidth: 2,
    borderColor: "#dce5ff",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    minHeight: 200,
  },
  mesaId: {
    fontSize: 18,
    fontWeight: "800",
    color: "#153e7d",
  },
  cardHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(51, 122, 204, 0.2)",
  },
  statusText: {
    fontSize: 12,
    color: "#153e7d",
    fontWeight: "700",
  },
  cardInfo: {
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  statusCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  statusRed: {
    backgroundColor: "#ffe6ea",
    borderColor: "#ff8a96",
  },
  statusGreen: {
    backgroundColor: "#e8f9ea",
    borderColor: "#74d186",
  },
  infoText: {
    fontSize: 14,
    color: "#4a6fae",
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAdicionar: {
    backgroundColor: "#337acc",
  },
  btnDetalhes: {
    backgroundColor: "#44bb66",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
