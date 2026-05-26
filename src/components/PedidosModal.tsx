import { useAuth } from "@/context/AuthContext";
import { ItemCardapio, ItemPedido, Pedido } from "@/data/cardapio";
import { listarItensPorRestaurante } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  const { token, restauranteId } = useAuth();
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
  const [carregandoCardapio, setCarregandoCardapio] = useState(false);

  useEffect(() => {
    setItens(pedido?.itens ? [...pedido.itens] : []);
    setObservacoes(pedido?.observacoes || "");
  }, [pedido, visible]);

  useEffect(() => {
    if (!visible || !restauranteId || !token) {
      setCardapio([]);
      return;
    }

    const carregarCardapio = async () => {
      setCarregandoCardapio(true);
      try {
        const itensDoBack = await listarItensPorRestaurante(
          restauranteId,
          token,
        );
        setCardapio(
          itensDoBack.map((item) => ({
            id: item.id,
            nome: item.nome,
            descricao: item.descricao || "",
            preco: item.preco,
            categoria: item.categoria,
            icone: getEmojiForCategoria(item.categoria),
          })),
        );
      } catch (error) {
        Alert.alert(
          "Erro",
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o cardápio.",
        );
      } finally {
        setCarregandoCardapio(false);
      }
    };

    carregarCardapio();
  }, [visible, restauranteId, token]);

  const getEmojiForCategoria = (categoria?: string) => {
    switch (categoria) {
      case "BEBIDAS":
        return "🥤";
      case "SOBREMESAS":
        return "🍰";
      case "PRATOS":
        return "🍽️";
      default:
        return "🍽️";
    }
  };

  const adicionarItem = (cardapioItem: ItemCardapio) => {
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>Pedidos - Mesa {mesaId}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#337acc" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Cardápio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cardápio</Text>
            <View style={styles.cardapioContainer}>
              {carregandoCardapio ? (
                <Text style={styles.emptyText}>Carregando cardápio...</Text>
              ) : cardapio.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum item disponível no cardápio.
                </Text>
              ) : (
                cardapio.map((item) => (
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
                ))
              )}
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef4ff",
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
    shadowColor: "#2a4f99",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "900",
    color: "#153e7d",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    marginVertical: 14,
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
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dce5ff",
    shadowColor: "#2a4f99",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  icone: {
    fontSize: 32,
    marginBottom: 8,
  },
  itemNome: {
    fontSize: 13,
    fontWeight: "700",
    color: "#153e7d",
    textAlign: "center",
  },
  itemPreco: {
    fontSize: 12,
    color: "#66758a",
    marginTop: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#8a97b8",
    textAlign: "center",
    paddingVertical: 20,
  },
  pedidoItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dce5ff",
    shadowColor: "#2a4f99",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 15,
    fontWeight: "700",
    color: "#153e7d",
  },
  itemPrecoPedido: {
    fontSize: 13,
    color: "#66758a",
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
    marginTop: 10,
  },
  deleteButton: {
    padding: 8,
  },
  quantidade: {
    fontSize: 14,
    fontWeight: "700",
    color: "#337acc",
    minWidth: 24,
    textAlign: "center",
  },
  observacoesInput: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dce5ff",
    color: "#337acc",
    fontSize: 14,
    minHeight: 96,
    textAlignVertical: "top",
  },
  footer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#dce5ff",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#337acc",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#153e7d",
  },
  btnEnviar: {
    backgroundColor: "#337acc",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEnviarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
