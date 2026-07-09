export interface ItemCardapio {
  id: string;
  nome: string;
  icone?: string;
  descricao?: string;
  categoria?: string;
  preco: number;
}

export const CARDAPIO: ItemCardapio[] = [
  { id: "1", nome: "Hambúrguer", icone: "🍔", preco: 25.9 },
  { id: "2", nome: "Pastel", icone: "🥟", preco: 12.5 },
  { id: "3", nome: "Batata Frita", icone: "🍟", preco: 18.0 },
  { id: "4", nome: "Bebida", icone: "🥤", preco: 8.5 },
  { id: "5", nome: "Boca Gola", icone: "🍪", preco: 2.5 },
];

export interface ItemPedido {
  id: string;
  itemId: string;
  nome: string;
  icone: string;
  quantidade: number;
  preco: number;
  observacoes?: string;
}

export interface Pedido {
  id?: string;
  mesaId: string;
  itens: ItemPedido[];
  status: "aberto" | "finalizado" | "entregue" | "preparando";
  observacoes?: string;
}
