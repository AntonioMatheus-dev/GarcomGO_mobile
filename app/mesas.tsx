import CardMesa from "@/components/CardMesa";
import DetalhesModal from "@/components/DetalhesModal";
import Notificacao from "@/components/Notificacao";
import PedidosModal from "@/components/PedidosModal";
import { useAuth } from "@/context/AuthContext";
import { ItemCardapio, Pedido } from "@/data/cardapio";
import * as api from "@/services/api";
import { connectSocket, getSocket } from "@/services/socket";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FiltroMesa = "todas" | "livres" | "ocupadas" | "enviados";

const emojiPorCategoria = (categoria?: string) => {
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

const normalizarStatus = (status: string): Pedido["status"] => {
  if (status === "FINALIZADO") return "finalizado";
  if (status === "ENTREGUE") return "entregue";
  if (status === "PREPARANDO") return "preparando";
  return "aberto";
};

export default function MesasPage() {
  const router = useRouter();
  const { token, restauranteId, user, limparNotificacoes } = useAuth();
  const [mesas, setMesas] = useState<api.MesaResponse[]>([]);
  const [garcomId, setGarcomId] = useState<string | null>(null);
  const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
  const [pedidos, setPedidos] = useState<Record<string, Pedido>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState<string | null>(null);
  const [modalPedidosAberto, setModalPedidosAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroMesa>("todas");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const params = useLocalSearchParams<{ filtro?: string }>();

  useEffect(() => {
    if (params.filtro === "ocupadas") {
      setFiltro("ocupadas");
    }
  }, [params.filtro]);

  const mesaAtual = useMemo(
    () => mesas.find((mesa) => mesa.id === mesaSelecionada),
    [mesas, mesaSelecionada],
  );

  const mesasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return mesas.filter((mesa) => {
      const pedido = pedidos[mesa.id];
      const temPedido = !!pedido && pedido.status !== "finalizado";
      const status = pedido?.status;
      const numeroMesa = String(mesa.numero).padStart(2, "0");
      const correspondeBusca =
        !termo ||
        numeroMesa.includes(termo) ||
        `mesa ${numeroMesa}`.includes(termo);

      if (!correspondeBusca) return false;

      if (filtro === "livres") return !temPedido || status === "finalizado";
      if (filtro === "ocupadas") return status === "entregue";
      if (filtro === "enviados") return status === "aberto" || status === "preparando";

      return true;
    });
  }, [busca, filtro, mesas, pedidos]);

  const totalComPedido = useMemo(
    () => Object.values(pedidos).filter((p) => p.status !== "finalizado"),
    [pedidos],
  );
  const totalEnviados = useMemo(
    () => Object.values(pedidos).filter((p) => p.status === "aberto" || p.status === "preparando"),
    [pedidos],
  );
  const totalOcupados = useMemo(
    () => Object.values(pedidos).filter((p) => p.status === "entregue"),
    [pedidos],
  );

  const carregarDados = useCallback(async () => {
    if (!token || !restauranteId) {
      router.replace("/");
      return;
    }

    try {
      setCarregando(true);
      const [mesasApi, itensApi, pedidosApi, garconsApi] = await Promise.all([
        api.listarMesasPorRestaurante(restauranteId, token),
        api.listarItensPorRestaurante(restauranteId, token),
        api.listarPedidosPorRestaurante(restauranteId, token),
        api.listarGarconsPorRestaurante(restauranteId, token),
      ]);

      setMesas(mesasApi);
      setGarcomId(user?.id || garconsApi[0]?.id || null);
      setCardapio(
        itensApi.map((item) => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao || undefined,
          categoria: item.categoria,
          preco: Number(item.preco),
          icone: emojiPorCategoria(item.categoria),
        })),
      );

      const pedidosPorMesa = pedidosApi.reduce<Record<string, Pedido>>(
        (acc, pedido) => {
          const mesaId = pedido.mesaId || pedido.mesa_id;
          if (!mesaId) return acc;

          const itens = (pedido.itens || [])
            .map((item) => ({
              id: item.id,
              itemId: item.itemId || item.item_id || item.item?.id || item.id,
              nome: item.nome || item.item?.nome || "Item",
              icone: emojiPorCategoria(item.categoria || item.item?.categoria),
              quantidade: Number(item.quantidade),
              preco: Number(item.preco || item.item?.preco || 0),
            }))
            .filter((item) => item.quantidade > 0);

          acc[mesaId] = {
            id: pedido.id,
            mesaId,
            status: normalizarStatus(pedido.status),
            itens,
          };
          return acc;
        },
        {},
      );
      setPedidos((pedidosAtuais) => {
        const novos = { ...pedidosAtuais };
        for (const [mesaId, pedido] of Object.entries(pedidosPorMesa)) {
          const existente = novos[mesaId];
          if (existente && pedido.itens.length === 0 && existente.itens.length > 0) {
            novos[mesaId] = { ...pedido, itens: existente.itens };
          } else {
            novos[mesaId] = pedido;
          }
        }
        return novos;
      });
    } catch (error) {
      Alert.alert(
        "Erro ao carregar mesas",
        error instanceof Error ? error.message : "Nao foi possivel conectar.",
      );
    } finally {
      setCarregando(false);
    }
  }, [restauranteId, router, token, user?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    if (!token) return;
    const existing = getSocket();
    const socket = existing || connectSocket(token);
    const handler = (data: { id: string; status: string }) => {
      const mapStatus: Record<string, "entregue" | "preparando"> = {
        ENTREGUE: "entregue",
        PREPARANDO: "preparando",
      };
      const novoStatus = mapStatus[data.status];
      if (novoStatus) {
        setPedidos(prev => {
          const entry = Object.entries(prev).find(([, p]) => p.id === data.id);
          if (!entry) return prev;
          const [mesaId] = entry;
          return { ...prev, [mesaId]: { ...prev[mesaId], status: novoStatus } };
        });
      }
    };
    socket.on('statusPedidoAlterado', handler);
    return () => { socket.off('statusPedidoAlterado', handler); };
  }, [token]);

  const handleAdicionarPedido = (mesaId: string) => {
    setMesaSelecionada(mesaId);
    setModalPedidosAberto(true);
  };

  const handleVerDetalhes = (mesaId: string) => {
    setMesaSelecionada(mesaId);
    setModalDetalhesAberto(true);
  };

  const handleSavePedido = async (mesaId: string, pedido: Pedido) => {
    if (!token || !garcomId) {
      Alert.alert("Pedido", "Nao foi possivel identificar o garcom.");
      return;
    }

    if (pedido.itens.length === 0) {
      Alert.alert("Pedido", "Adicione pelo menos um item ao pedido.");
      return;
    }

    try {
      setSalvando(true);
      const pedidoCriado = await api.criarPedido(mesaId, garcomId, token);

      await Promise.all(
        pedido.itens.map((item) =>
          api.adicionarItemPedido(
            pedidoCriado.id,
            item.itemId,
            item.quantidade,
            token,
          ),
        ),
      );

      setPedidos((prevPedidos) => ({
        ...prevPedidos,
        [mesaId]: {
          ...pedido,
          id: pedidoCriado.id,
          mesaId,
          status: "aberto",
        },
      }));
      setModalPedidosAberto(false);
      setMensagemSucesso("Pedido enviado para cozinha");
      await carregarDados();
      setTimeout(() => setMensagemSucesso(""), 2500);
    } catch (error) {
      Alert.alert(
        "Erro ao enviar pedido",
        error instanceof Error ? error.message : "Nao foi possivel salvar.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const handleAtualizarItem = (itemId: string, novaQuantidade: number) => {
    if (!mesaSelecionada) return;

    if (novaQuantidade <= 0) {
      handleRemoverItem(itemId);
      return;
    }

    setPedidos((prevPedidos) => ({
      ...prevPedidos,
      [mesaSelecionada]: {
        ...prevPedidos[mesaSelecionada],
        itens: prevPedidos[mesaSelecionada].itens.map((item) =>
          item.id === itemId ? { ...item, quantidade: novaQuantidade } : item,
        ),
      },
    }));
  };

  const handleRemoverItem = (itemId: string) => {
    if (!mesaSelecionada) return;

    setPedidos((prevPedidos) => {
      const pedidoAtual = prevPedidos[mesaSelecionada];
      const itensRestantes = pedidoAtual.itens.filter(
        (item) => item.id !== itemId,
      );

      if (itensRestantes.length === 0) {
        const { [mesaSelecionada]: _, ...pedidosRestantes } = prevPedidos;
        return pedidosRestantes;
      }

      return {
        ...prevPedidos,
        [mesaSelecionada]: {
          ...pedidoAtual,
          itens: itensRestantes,
        },
      };
    });
  };

  const handleAdicionarItensDetalhes = () => {
    setModalDetalhesAberto(false);
    setModalPedidosAberto(true);
  };

  const handleMarcarEntregue = async (mesaId: string) => {
    const pedido = pedidos[mesaId];
    if (!token || !pedido?.id) return;

    try {
      await api.alterarStatusPedido(pedido.id, "FINALIZADO", token);
      setPedidos(prev => {
        const { [mesaId]: _, ...resto } = prev;
        return resto;
      });
      limparNotificacoes();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível finalizar o pedido.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Notificacao onNotificacaoPress={() => setFiltro("ocupadas")} />
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>Mesas</Text>
          <Text style={styles.pageSubtitle}>
            Selecione uma mesa para gerenciar pedidos ou verificar detalhes.
          </Text>
        </View>
        {mensagemSucesso ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{mensagemSucesso}</Text>
          </View>
        ) : null}
        <View style={styles.controls}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar mesa"
            placeholderTextColor="#8a97b8"
            value={busca}
            onChangeText={setBusca}
            keyboardType="number-pad"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {[
              ["todas", `Todas (${mesas.length})`],
              ["livres", `Livres (${mesas.length - totalComPedido.length})`],
              ["ocupadas", `Ocupadas (${totalOcupados.length})`],
              ["enviados", `Enviados (${totalEnviados.length})`],
            ].map(([valor, label]) => (
              <TouchableOpacity
                key={valor}
                style={[
                  styles.filterChip,
                  filtro === valor && styles.filterChipActive,
                ]}
                onPress={() => setFiltro(valor as FiltroMesa)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filtro === valor && styles.filterTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {carregando ? (
            <Text style={styles.emptyText}>Carregando mesas...</Text>
          ) : mesas.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma mesa cadastrada para este restaurante.
            </Text>
          ) : mesasFiltradas.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma mesa encontrada com esse filtro.
            </Text>
          ) : (
            <View style={styles.gridContainer}>
              {mesasFiltradas.map((mesa) => (
                <CardMesa
                  key={mesa.id}
                  mesaId={mesa.id}
                  mesaLabel={String(mesa.numero).padStart(2, "0")}
                  mesaStatus={mesa.status}
                  pedido={pedidos[mesa.id]}
                  onAdicionarPedido={handleAdicionarPedido}
                  onVerDetalhes={handleVerDetalhes}
                  onMarcarEntregue={handleMarcarEntregue}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {mesaSelecionada && (
          <>
            <PedidosModal
              visible={modalPedidosAberto}
              mesaId={
                mesaAtual ? String(mesaAtual.numero).padStart(2, "0") : ""
              }
              pedido={pedidos[mesaSelecionada]}
              cardapio={cardapio}
              carregandoCardapio={carregando}
              salvando={salvando}
              onClose={() => setModalPedidosAberto(false)}
              onSavePedido={(_, pedido) =>
                handleSavePedido(mesaSelecionada, pedido)
              }
            />
            <DetalhesModal
              visible={modalDetalhesAberto}
              mesaId={
                mesaAtual ? String(mesaAtual.numero).padStart(2, "0") : ""
              }
              itens={pedidos[mesaSelecionada]?.itens || []}
              observacoes={pedidos[mesaSelecionada]?.observacoes || ""}
              onClose={() => setModalDetalhesAberto(false)}
              onAdicionarItens={handleAdicionarItensDetalhes}
              onAtualizarItem={handleAtualizarItem}
              onRemoverItem={handleRemoverItem}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e6eefc",
  },
  container: {
    flex: 1,
    backgroundColor: "#e6eefc",
    paddingTop: 18,
  },
  headerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#153e7d",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 17,
    color: "#5d728f",
    lineHeight: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  successBanner: {
    marginHorizontal: 18,
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#e8f9ea",
    borderWidth: 1,
    borderColor: "#74d186",
    borderRadius: 12,
  },
  successText: {
    color: "#1f7a3a",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  controls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchInput: {
    height: 56,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5ff",
    borderRadius: 14,
    paddingHorizontal: 16,
    color: "#153e7d",
    fontSize: 18,
    fontWeight: "700",
  },
  filterRow: {
    gap: 10,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5ff",
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: "#337acc",
    borderColor: "#337acc",
  },
  filterText: {
    color: "#4a6fae",
    fontSize: 16,
    fontWeight: "800",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  gridContainer: {
    width: "100%",
  },
  emptyText: {
    color: "#5d728f",
    fontSize: 18,
    paddingHorizontal: 8,
    paddingTop: 28,
    textAlign: "center",
  },
});
