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
      <Text style={styles.mesaId}>Mesa {mesaId}</Text>

      <View
        style={[
          styles.statusCircle,
          statusFinalizado ? styles.statusGreen : styles.statusRed,
        ]}
      >
        {statusFinalizado && (
          <Ionicons name="checkmark" size={24} color="#ffffff" />
        )}
      </View>

      {temPedido && (
        <Text style={styles.infoText}>Itens: {pedido.itens.length}</Text>
      )}

      <View style={styles.buttonContainer}>
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
            {statusFinalizado ? "Detalhes" : "Adicionar"}
          </Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
    fontWeight: "700",
    color: "#337acc",
    textAlign: "center",
    width: "100%",
  },
  statusCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  statusRed: {
    borderColor: "#ff4444",
    backgroundColor: "transparent",
  },
  statusGreen: {
    backgroundColor: "#44ff44",
    borderColor: "#44ff44",
  },
  infoText: {
    fontSize: 12,
    color: "#337acc",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAdicionar: {
    backgroundColor: "#337acc",
  },
  btnDetalhes: {
    backgroundColor: "#44ff44",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
  },
});
