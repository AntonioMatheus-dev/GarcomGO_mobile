# GarcomGO - Contexto Geral

## Stack
- **Frontend (mobile):** Expo (React Native) + TypeScript + expo-router + Socket.IO client
- **Backend:** NestJS + PostgreSQL + JWT + Socket.IO + class-validator

---

## Arquitetura do Backend (`Gar-om-GO-Repo`)

### Módulos
| Módulo | Função |
|--------|--------|
| `administrador` | Admin CRUD + hash de senha |
| `autenticacao` | Login (`POST /auth/login`), geração de JWT |
| `garcom` | CRUD garçons (sem senha própria) |
| `item` | CRUD itens do cardápio |
| `mesa` | CRUD mesas |
| `pedido` | Criação, itens, status, WebSocket (garçom) |
| `cozinha` | Visualização/alteração pedidos (cozinheiro), WebSocket separado |
| `restaurante` | CRUD restaurantes |

### Autenticação
- `POST /auth/login` → aceita email/senha de administrador, retorna `{ accessToken, administrador }`
- JWT contém: `sub`, `email`, `role`, `restauranteId`
- Quase todas as rotas protegidas por `JwtAuthGuard`
- Role `COZINHEIRO` protegida por `CargosGuard` adicional

### Banco de Dados
- Todas as primary keys são `VARCHAR(255)` — IDs gerados via `nanoid()`, **NÃO** UUID
- Tabelas: `administrador`, `restaurante`, `garcom`, `mesa`, `item`, `pedido`, `pedido_item`
- Schema completo em `schema.sql` (commit f6434e3)

### API Endpoints (relevantes para o mobile)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login admin → retorna JWT + admin data |
| GET | `/restaurantes` | Lista todos restaurantes |
| GET | `/garcom/restaurante/:id` | Lista garçons de um restaurante |
| GET | `/itens/restaurante/:id` | Lista itens do cardápio |
| GET | `/mesas/restaurante/:id` | Lista mesas de um restaurante |
| POST | `/pedidos` | Cria pedido (`mesaId`, `garcomId`) |
| POST | `/pedidos/item` | Adiciona item ao pedido (`pedidoId`, `itemId`, `quantidade`) |
| PATCH | `/pedidos/:id/status` | Altera status do pedido |
| GET | `/pedidos/restaurante/:id` | Lista pedidos de um restaurante |

### WebSocket
- Gateway principal: `/ws` namespace, autentica via JWT, ingressa sala `restaurante_{id}`
- Eventos: `novo-pedido`, `status-alterado`, `pedido-pronto`
- Gateway da cozinha: sem namespace, eventos `novoPedido`, `statusPedidoAlterado`

---

## Arquitetura do Mobile (`GarcomGO_mobile`)

### Fluxo de Navegação
```
app/index.tsx - login admin → seleção garçom → redirect /mesas
app/mesas.tsx - gerenciamento de pedidos por mesa
```

### Componentes Principais
| Componente | Arquivo | Função |
|-----------|---------|--------|
| AuthContext | `src/context/AuthContext.tsx` | Estado global (token, user, restauranteId) |
| Storage | `src/services/storage.ts` | Persistência via SecureStore |
| API | `src/services/api.ts` | Chamadas HTTP para o backend |
| Socket | `src/services/socket.ts` | Conexão WebSocket |
| CardMesa | `src/components/CardMesa.tsx` | Card visual de cada mesa |
| PedidosModal | `src/components/PedidosModal.tsx` | Modal para criar/editar pedido |
| DetalhesModal | `src/components/DetalhesModal.tsx` | Detalhes do pedido |
| Notificacao | `src/components/Notificacao.tsx` | Header com saudação + badge notificações |

### Fluxo de Dados (envio de pedido)
1. `POST /pedidos` com `{ mesaId, garcomId }` → retorna `{ id, status, ... }`
2. Para cada item: `POST /pedidos/item` com `{ pedidoId, itemId, quantidade }`
3. Backend usa `adicionar-item-pedido.use-case.ts` que busca preço no banco via `itemRepository.findById(itemId)`

### Fluxo de Autenticação
1. Admin informa email+senha → `POST /auth/login`
2. Retorna token JWT + dados do admin
3. Lista garçons via `GET /garcom/restaurante/:id`
4. Garçom seleciona seu nome → sessão salva no SecureStore
5. App redireciona para `/mesas`
6. Ao reabrir, sessão restaurada do SecureStore → redireciona direto para `/mesas`

---

## Problemas Corrigidos

### Backend

1. ✅ **MesaController sem rota `GET /restaurante/:id`**
   - `mesa.repository.interface.ts` — adicionado `listarPorRestaurante`
   - `pg-mesa.repository.ts` — implementado SQL filter por `restaurante_id`
   - `mesa.controller.ts` — adicionada rota `GET /restaurante/:id`

2. ✅ **DTOs validando IDs como UUID, mas sistema gera nanoids**
   - `criar-pedido.dto.ts` — `@IsUUID()` → `@IsString()` em `mesaId`, `garcomId`
   - `adicionar-item-pedido.dto.ts` — `@IsUUID()` → `@IsString()` em `pedidoId`, `itemId`
   - Causa do erro: `gerarId()` usa `nanoid()` que gera strings alfanuméricas (ex: `V1StGXR8_Z5jdHi6B-myT`), mas DTOs exigiam formato UUID

---

## Problemas Pendentes

### Backend (corrigir quando possível)

1. **Outros DTOs com `@IsUUID()` que também quebram**
   - `criar-garcom.dto.ts`: `restauranteId` ainda como `@IsUUID()`
   - `criar-item.dto.ts`: `restauranteId` ainda como `@IsUUID()`
   - `criar-mesa.dto.ts`: `restauranteId` ainda como `@IsUUID()`
   - Impacto: admin web não consegue criar garçons/itens/mesas se passar IDs nanoid
   - Solução: trocar todos `@IsUUID()` por `@IsString()` nos DTOs que recebem IDs do sistema

2. **Módulo Cozinha incompleto**
   - `gemini.md` descreve funcionalidades não implementadas
   - Role `COZINHEIRO` + visualização de pedidos + alteração status + WebSocket dedicado

### Mobile (corrigir quando possível)

3. **WebSocket não reconecta ao restaurar sessão**
   - `AuthContext.tsx` `useEffect` de restauração carrega token/garcomId/restauranteId do SecureStore, mas **não chama `connectSocket`**
   - Efeito: notificações em tempo real (`pedido-pronto`) não funcionam até o próximo login completo
   - Solução: adicionar `connectSocket(session.token)` e registrar listener `pedido-pronto` no bloco de restauração de sessão

4. **Error handling genérico no `api.ts`**
   - `apiFetch` lança `errorText` bruto (pode ser HTML ou JSON) sem parse
   - Solução: detectar se `errorText` é JSON, extrair `message`, lançar erro mais legível

---

## Variáveis de Ambiente Necessárias (Backend)
- `DATABASE_URL` — conexão PostgreSQL
- `JWT_SECRET` — segredo para assinar tokens (fallback: `'default_secret'`)
