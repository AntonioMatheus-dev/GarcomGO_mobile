import CardMesa from "@/components/CardMesa";
import DetalhesModal from "@/components/DetalhesModal";
import Notificacao from "@/components/Notificacao";
import PedidosModal from "@/components/PedidosModal";
import { Pedido } from "@/data/cardapio";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function MesasPage() {
  const mesas = ["01", "02", "03", "04", "05", "06"];
  const [pedidos, setPedidos] = useState<Record<string, Pedido>>({});
  const [mesaSelecionada, setMesaSelecionada] = useState<string | null>(null);
  const [modalPedidosAberto, setModalPedidosAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);

  const handleAdicionarPedido = (mesaId: string) => {
    setMesaSelecionada(mesaId);
    setModalPedidosAberto(true);
  };

  const handleVerDetalhes = (mesaId: string) => {
    setMesaSelecionada(mesaId);
    setModalDetalhesAberto(true);
  };

  const handleSavePedido = (mesaId: string, pedido: Pedido) => {
    setPedidos((prevPedidos) => ({
      ...prevPedidos,
      [mesaId]: pedido,
    }));
    setModalPedidosAberto(false);
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

      // Se não há mais itens, remove o pedido completamente
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

  return (
    <View style={styles.container}>
      <Notificacao />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {mesas.map((mesa) => (
            <CardMesa
              key={mesa}
              mesaId={mesa}
              pedido={pedidos[mesa]}
              onAdicionarPedido={handleAdicionarPedido}
              onVerDetalhes={handleVerDetalhes}
            />
          ))}
        </View>
      </ScrollView>

      {mesaSelecionada && (
        <>
          <PedidosModal
            visible={modalPedidosAberto}
            mesaId={mesaSelecionada}
            pedido={pedidos[mesaSelecionada]}
            onClose={() => setModalPedidosAberto(false)}
            onSavePedido={handleSavePedido}
          />
          <DetalhesModal
            visible={modalDetalhesAberto}
            mesaId={mesaSelecionada}
            itens={pedidos[mesaSelecionada]?.itens || []}
            observacoes={pedidos[mesaSelecionada]?.observacoes || ""}
            onClose={() => setModalDetalhesAberto(false)}
            onAtualizarItem={handleAtualizarItem}
            onRemoverItem={handleRemoverItem}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dce5ff",
    paddingTop: 16,
  },
  content: {
    paddingHorizontal: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
});
