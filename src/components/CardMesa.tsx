import { Pedido } from "@/data/cardapio";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CardMesaProps {
  mesaId: string;
  mesaLabel?: string;
  mesaStatus?: string;
  pedido?: Pedido;
  onAdicionarPedido: (mesaId: string) => void;
  onVerDetalhes: (mesaId: string) => void;
}

export default function CardMesa({
  mesaId,
  mesaLabel,
  mesaStatus,
  pedido,
  onAdicionarPedido,
  onVerDetalhes,
}: CardMesaProps) {
  const temPedido = pedido && pedido.itens.length > 0;
  const statusFinalizado = pedido?.status === "finalizado" && temPedido;
  const statusAberto = pedido?.status === "aberto" && temPedido;
  const quantidadeItens =
    pedido?.itens.reduce((total, item) => total + item.quantidade, 0) || 0;
  const total =
    pedido?.itens.reduce(
      (valor, item) => valor + item.preco * item.quantidade,
      0,
    ) || 0;
  const statusMesa = mesaStatus?.toLowerCase();
  const estaLivre =
    !temPedido && (!statusMesa || statusMesa === "livre" || statusMesa === "disponivel");
  const cardState = statusFinalizado
    ? "enviado"
    : statusAberto
      ? "aberto"
      : estaLivre
        ? "livre"
        : "ocupada";
  const stateConfig = {
    livre: {
      label: "Livre",
      icon: "checkmark-circle" as const,
      color: "#1f9d55",
      badgeStyle: styles.statusFree,
      button: "Abrir mesa",
      buttonStyle: styles.btnAdicionar,
    },
    ocupada: {
      label: "Ocupada",
      icon: "restaurant" as const,
      color: "#f59f00",
      badgeStyle: styles.statusBusy,
      button: "Adicionar item",
      buttonStyle: styles.btnAdicionar,
    },
    aberto: {
      label: "Pedido aberto",
      icon: "time" as const,
      color: "#f59f00",
      badgeStyle: styles.statusBusy,
      button: "Adicionar item",
      buttonStyle: styles.btnAdicionar,
    },
    enviado: {
      label: "Pedido enviado",
      icon: "paper-plane" as const,
      color: "#337acc",
      badgeStyle: styles.statusSent,
      button: "Ver pedido",
      buttonStyle: styles.btnDetalhes,
    },
  }[cardState];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.mesaId}>Mesa {mesaLabel || mesaId}</Text>
        <View
          style={[
            styles.statusBadge,
            stateConfig.badgeStyle,
          ]}
        >
          <Text style={styles.statusText}>
            {stateConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <Ionicons
          name={stateConfig.icon}
          size={36}
          color={stateConfig.color}
        />
        <Text style={styles.infoText}>
          {temPedido ? `${quantidadeItens} itens` : "Nenhum pedido"}
        </Text>
        {temPedido && (
          <Text style={styles.totalText}>R$ {total.toFixed(2)}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          stateConfig.buttonStyle,
        ]}
        onPress={() =>
          statusFinalizado ? onVerDetalhes(mesaId) : onAdicionarPedido(mesaId)
        }
      >
        <Text style={styles.buttonText}>
          {stateConfig.button}
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
  statusBusy: {
    backgroundColor: "#ffe6ea",
    borderColor: "#ff8a96",
  },
  statusFree: {
    backgroundColor: "#e8f9ea",
    borderColor: "#74d186",
  },
  statusSent: {
    backgroundColor: "#e8f1ff",
    borderColor: "#8cb7f4",
  },
  infoText: {
    fontSize: 14,
    color: "#4a6fae",
    fontWeight: "600",
    textAlign: "center",
  },
  totalText: {
    fontSize: 15,
    color: "#153e7d",
    fontWeight: "900",
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
