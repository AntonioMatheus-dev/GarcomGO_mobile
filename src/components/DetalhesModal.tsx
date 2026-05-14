import { ItemPedido } from "@/data/cardapio";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DetalhesModalProps {
  visible: boolean;
  mesaId: string;
  itens: ItemPedido[];
  observacoes?: string;
  onClose: () => void;
  onAtualizarItem: (itemId: string, novaQuantidade: number) => void;
  onRemoverItem: (itemId: string) => void;
}

export default function DetalhesModal({
  visible,
  mesaId,
  itens,
  observacoes,
  onClose,
  onAtualizarItem,
  onRemoverItem,
}: DetalhesModalProps) {
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);

  const calcularTotal = () => {
    return itens.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0,
    );
  };

  const handleExcluir = (itemId: string, itemNome: string) => {
    Alert.alert("Excluir item", `Tem certeza que deseja excluir ${itemNome}?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => onRemoverItem(itemId),
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Detalhes - Mesa {mesaId}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#337acc" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {itens.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum item neste pedido</Text>
            </View>
          ) : (
            <View>
              {itens.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemIcon}>{item.icone}</Text>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemNome}>{item.nome}</Text>
                      <Text style={styles.itemPreco}>
                        R$ {item.preco.toFixed(2)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.btnExcluir}
                      onPress={() => handleExcluir(item.id, item.nome)}
                    >
                      <Ionicons name="trash" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemBody}>
                    <View style={styles.quantidadeSection}>
                      <Text style={styles.label}>Quantidade:</Text>
                      <View style={styles.quantidadeControl}>
                        <TouchableOpacity
                          onPress={() =>
                            onAtualizarItem(item.id, item.quantidade - 1)
                          }
                        >
                          <Ionicons
                            name="remove-circle"
                            size={28}
                            color="#337acc"
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantidade}>{item.quantidade}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            onAtualizarItem(item.id, item.quantidade + 1)
                          }
                        >
                          <Ionicons
                            name="add-circle"
                            size={28}
                            color="#337acc"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.subtotalSection}>
                      <Text style={styles.label}>Subtotal:</Text>
                      <Text style={styles.subtotal}>
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </Text>
                    </View>

                    {item.observacoes && (
                      <View style={styles.observacoesSection}>
                        <Text style={styles.label}>Observações:</Text>
                        <Text style={styles.observacoes}>
                          {item.observacoes}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {observacoes ? (
          <View style={styles.observacoesPedidoSection}>
            <Text style={styles.observacoesPedidoLabel}>
              Observações do pedido:
            </Text>
            <Text style={styles.observacoesPedidoText}>{observacoes}</Text>
          </View>
        ) : null}

        {itens.length > 0 && (
          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total do Pedido:</Text>
              <Text style={styles.totalValue}>
                R$ {calcularTotal().toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#dce5ff",
  },
  titulo: {
    fontSize: 18,
    fontWeight: "900",
    color: "#337acc",
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dce5ff",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: "700",
    color: "#337acc",
  },
  itemPreco: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  btnExcluir: {
    padding: 8,
  },
  itemBody: {
    gap: 12,
  },
  observacoesPedidoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dce5ff",
  },
  observacoesPedidoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#337acc",
    marginBottom: 6,
  },
  observacoesPedidoText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  quantidadeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  quantidadeControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantidade: {
    fontSize: 16,
    fontWeight: "700",
    color: "#337acc",
    minWidth: 24,
    textAlign: "center",
  },
  subtotalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f5ff",
    borderRadius: 8,
  },
  subtotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#337acc",
  },
  observacoesSection: {
    gap: 4,
  },
  observacoes: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
  },
  footer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#dce5ff",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#337acc",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#337acc",
  },
});
