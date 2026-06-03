import { ItemCardapio, ItemPedido, Pedido } from "@/data/cardapio";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
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
  cardapio: ItemCardapio[];
  carregandoCardapio?: boolean;
  salvando?: boolean;
  onClose: () => void;
  onSavePedido: (mesaId: string, pedido: Pedido) => void | Promise<void>;
}

export default function PedidosModal({
  visible,
  mesaId,
  pedido,
  cardapio,
  carregandoCardapio = false,
  salvando = false,
  onClose,
  onSavePedido,
}: PedidosModalProps) {
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("TODOS");

  useEffect(() => {
    setItens(pedido?.itens ? [...pedido.itens] : []);
    setObservacoes(pedido?.observacoes || "");
  }, [pedido, visible]);

  const categorias = useMemo(
    () => [
      "TODOS",
      ...Array.from(
        new Set(
          cardapio
            .map((item) => item.categoria)
            .filter((categoria): categoria is string => Boolean(categoria)),
        ),
      ),
    ],
    [cardapio],
  );

  const itensPopulares = useMemo(() => cardapio.slice(0, 4), [cardapio]);

  const cardapioFiltrado = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return cardapio.filter((item) => {
      const correspondeCategoria =
        categoriaSelecionada === "TODOS" ||
        item.categoria === categoriaSelecionada;
      const correspondeBusca =
        !termo ||
        item.nome.toLowerCase().includes(termo) ||
        item.descricao?.toLowerCase().includes(termo);

      return correspondeCategoria && correspondeBusca;
    });
  }, [busca, cardapio, categoriaSelecionada]);

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
          icone: cardapioItem.icone ?? "🍽️",
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

  const atualizarObservacaoItem = (itemId: string, texto: string) => {
    setItens(
      itens.map((item) =>
        item.id === itemId ? { ...item, observacoes: texto } : item,
      ),
    );
  };

  const calcularTotal = () => {
    return itens.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0,
    );
  };

  const handleFinalizarPedido = async () => {
    const novoStatus =
      pedido?.status === "finalizado" ? "aberto" : "finalizado";
    await onSavePedido(mesaId, {
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cardápio</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar item"
              placeholderTextColor="#8a97b8"
              value={busca}
              onChangeText={setBusca}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriasRow}
            >
              {categorias.map((categoria) => (
                <TouchableOpacity
                  key={categoria}
                  style={[
                    styles.categoriaChip,
                    categoriaSelecionada === categoria &&
                      styles.categoriaChipActive,
                  ]}
                  onPress={() => setCategoriaSelecionada(categoria)}
                >
                  <Text
                    style={[
                      styles.categoriaText,
                      categoriaSelecionada === categoria &&
                        styles.categoriaTextActive,
                    ]}
                  >
                    {categoria === "TODOS" ? "Todos" : categoria}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {itensPopulares.length > 0 &&
            !busca &&
            categoriaSelecionada === "TODOS" ? (
              <View style={styles.popularSection}>
                <Text style={styles.subSectionTitle}>Mais pedidos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.popularRow}
                >
                  {itensPopulares.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.popularItem}
                      onPress={() => adicionarItem(item)}
                    >
                      <Text style={styles.popularIcon}>{item.icone}</Text>
                      <Text style={styles.popularName}>{item.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            <View style={styles.cardapioContainer}>
              {carregandoCardapio ? (
                <Text style={styles.emptyText}>Carregando cardápio...</Text>
              ) : cardapio.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum item disponível no cardápio.
                </Text>
              ) : cardapioFiltrado.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum item encontrado.</Text>
              ) : (
                cardapioFiltrado.map((item) => (
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
                    <TextInput
                      style={styles.itemObservacaoInput}
                      placeholder="Observação do item"
                      placeholderTextColor="#8a97b8"
                      value={item.observacoes || ""}
                      onChangeText={(texto) =>
                        atualizarObservacaoItem(item.id, texto)
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

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
            style={[styles.btnEnviar, salvando && styles.btnEnviarDisabled]}
            onPress={handleFinalizarPedido}
            disabled={salvando}
          >
            <Text style={styles.btnEnviarText}>
              {salvando ? "Enviando..." : "Enviar"}
            </Text>
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
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#153e7d",
    marginBottom: 8,
  },
  searchInput: {
    height: 44,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#dce5ff",
    color: "#153e7d",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  categoriasRow: {
    gap: 8,
    paddingBottom: 12,
  },
  categoriaChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#dce5ff",
  },
  categoriaChipActive: {
    backgroundColor: "#337acc",
    borderColor: "#337acc",
  },
  categoriaText: {
    color: "#4a6fae",
    fontSize: 12,
    fontWeight: "800",
  },
  categoriaTextActive: {
    color: "#ffffff",
  },
  popularSection: {
    marginBottom: 12,
  },
  popularRow: {
    gap: 8,
    paddingRight: 12,
  },
  popularItem: {
    width: 112,
    minHeight: 88,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5ff",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  popularIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  popularName: {
    color: "#153e7d",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
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
  itemObservacaoInput: {
    minHeight: 42,
    backgroundColor: "#f7f9ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e7f5",
    paddingHorizontal: 12,
    color: "#153e7d",
    fontSize: 13,
    marginTop: 10,
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
  btnEnviarDisabled: {
    opacity: 0.7,
  },
  btnEnviarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
