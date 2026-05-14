import { CARDAPIO, ItemPedido, Pedido } from "@/data/cardapio";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PedidosModalProps {
  visible: boolean;
  mesaId: string;
  pedido?: Pedido;
  onClose: () => void;
  onSavePedido: (mesaId: string, pedido: Pedido) => void;
}

export default function PedidosModal({
  visible,
  mesaId,
  pedido,
  onClose,
  onSavePedido,
}: PedidosModalProps) {
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    setItens(pedido?.itens ? [...pedido.itens] : []);
    setObservacoes(pedido?.observacoes || "");
  }, [pedido, visible]);

  const adicionarItem = (cardapioItem: (typeof CARDAPIO)[0]) => {
    const itemExistente = itens.find((item) => item.itemId === cardapioItem.id);

    if (itemExistente) {
      setItens(
        itens.map((item) =>
          item.itemId === cardapioItem.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        ),
      );
    } else {
      setItens([
        ...itens,
        {
          id: Date.now().toString(),
          itemId: cardapioItem.id,
          nome: cardapioItem.nome,
          icone: cardapioItem.icone,
          quantidade: 1,
          preco: cardapioItem.preco,
        },
      ]);
    }
  };

  const removerItem = (itemId: string) => {
    setItens(itens.filter((item) => item.id !== itemId));
  };

  const atualizarQuantidade = (itemId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(itemId);
      return;
    }
    setItens(
      itens.map((item) =>
        item.id === itemId ? { ...item, quantidade: novaQuantidade } : item,
      ),
    );
  };

  const calcularTotal = () => {
    return itens.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0,
    );
  };

  const handleFinalizarPedido = () => {
    const novoStatus =
      pedido?.status === "finalizado" ? "aberto" : "finalizado";
    onSavePedido(mesaId, {
      mesaId,
      itens,
      status: novoStatus,
      observacoes,
    });
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
          <Text style={styles.titulo}>Pedidos - Mesa {mesaId}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#337acc" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Cardápio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cardápio</Text>
            <View style={styles.cardapioContainer}>
              {CARDAPIO.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cardapioItem}
                  onPress={() => adicionarItem(item)}
                >
                  <Text style={styles.icone}>{item.icone}</Text>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemPreco}>
                    R$ {item.preco.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pedido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Itens do Pedido</Text>
            {itens.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum item adicionado</Text>
            ) : (
              <View>
                {itens.map((item) => (
                  <View key={item.id} style={styles.pedidoItem}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemIcon}>{item.icone}</Text>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemNomePedido}>{item.nome}</Text>
                        <Text style={styles.itemPrecoPedido}>
                          R$ {item.preco.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.itemActions}>
                      <View style={styles.quantidadeControl}>
                        <TouchableOpacity
                          onPress={() =>
                            atualizarQuantidade(item.id, item.quantidade - 1)
                          }
                        >
                          <Ionicons
                            name="remove-circle"
                            size={24}
                            color="#337acc"
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantidade}>{item.quantidade}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            atualizarQuantidade(item.id, item.quantidade + 1)
                          }
                        >
                          <Ionicons
                            name="add-circle"
                            size={24}
                            color="#337acc"
                          />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        onPress={() => removerItem(item.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash" size={24} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Observações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <TextInput
              style={styles.observacoesInput}
              placeholder="Digite observações..."
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              R$ {calcularTotal().toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btnEnviar}
            onPress={handleFinalizarPedido}
          >
            <Text style={styles.btnEnviarText}>Enviar</Text>
          </TouchableOpacity>
        </View>
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
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#337acc",
    marginBottom: 12,
  },
  cardapioContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  cardapioItem: {
    width: "48%",
    minWidth: 140,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dce5ff",
  },
  icone: {
    fontSize: 32,
    marginBottom: 4,
  },
  itemNome: {
    fontSize: 12,
    fontWeight: "600",
    color: "#337acc",
    textAlign: "center",
  },
  itemPreco: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  pedidoItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: "#dce5ff",
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemNomePedido: {
    fontSize: 14,
    fontWeight: "600",
    color: "#337acc",
  },
  itemPrecoPedido: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  quantidadeControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
  },
  quantidade: {
    fontSize: 14,
    fontWeight: "600",
    color: "#337acc",
    minWidth: 20,
    textAlign: "center",
  },
  observacoesInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dce5ff",
    color: "#337acc",
    fontSize: 14,
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
    marginBottom: 12,
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
  btnEnviar: {
    backgroundColor: "#337acc",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnEnviarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
