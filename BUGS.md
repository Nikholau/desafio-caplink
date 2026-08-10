# Bugs encontrados e correções

Sete bugs encontrados nas quatro áreas apontadas no README (lógica de domínio, wiring de DI,
camada RabbitMQ/realtime e frontend). Os cinco primeiros já tinham teste unitário cobrindo
(estavam falhando antes da correção); os dois últimos só apareciam usando o app.

## 1. Tópicos de evento invertidos (RabbitMQ/realtime)

**Arquivo:** `backend/src/domains/posts/consumers/resolveEventTopic.ts`

`resolveEventTopic` mapeava `PostCreated` → `POST_EDITED` e `PostEdited` → `POST_CREATED` — o
inverso do esperado. Isso fazia o consumer publicar cada evento no canal pub/sub errado, então
quem tivesse assinado `postCreated` receberia edições e vice-versa.

## 2. Fila do RabbitMQ não era anônima/exclusiva por réplica

**Arquivo:** `backend/src/domains/posts/consumers/getPostEventsQueueOptions.ts`

A fila era declarada com nome fixo (`posts-events-queue`) e `exclusive: false, autoDelete: false`.
Com múltiplas réplicas do backend, todas concorreriam pela mesma fila (cada mensagem do exchange
`fanout` seria entregue a apenas uma réplica, não a todas), quebrando o fan-out que sustenta o
"tempo real" entre réplicas. Corrigido para fila anônima (`name: ''`), exclusiva e auto-delete —
cada réplica passa a ter sua própria fila ligada ao exchange.

## 3. `title` ausente na atualização persistida

**Arquivo:** `backend/src/domains/posts/mappers/PostMapper.ts`

`toPersistenceUpdate` só incluía `description` e `updatedAt` no objeto passado ao Prisma —
editar o título de um post nunca persistia no banco, mesmo a UI mostrando o valor novo
localmente.

## 4. Evento publicado antes de persistir a edição

**Arquivo:** `backend/src/domains/posts/use-cases/EditPostUseCase.ts`

`EditPostUseCase.execute` publicava o evento `PostEdited` **antes** de chamar
`repo.update(post)`. Quem estivesse assistindo em tempo real podia reagir ao evento e buscar o
post antes de o UPDATE ter sido efetivado no banco, lendo um dado desatualizado. Corrigido para
persistir primeiro e só então publicar o evento — usando o post já persistido (com `updatedAt`
definitivo) como payload.

## 5. Registro de DI sem escopo singleton (dashboard de conexões)

**Arquivo:** `backend/src/domains/connections/index.ts`

`registerConnectionsDomain` usava `container.register(...)` genérico em vez de
`registerSingleton`. Cada `container.resolve(CONNECTION_REGISTRY)` criava uma nova instância de
`InMemoryConnectionRegistry`, então cada ponto do código que dependesse do registro (tracking de
conexão no `index.ts`, use case do dashboard) via um Map vazio diferente — o contador de conexões
nunca refletia a realidade.

## 6. Post criado aparecia duplicado na própria aba (frontend)

**Arquivo:** `frontend/src/pages/PostsListPage.tsx`

Ao criar um post, o formulário inseria uma entrada "otimista" no cache local com
`id: crypto.randomUUID()`. Quando a subscription `postCreated` chegava com o post real (id gerado
pelo Prisma), o guard de deduplicação (`prev.posts.some(existing => existing.id === post.id)`)
comparava contra o id aleatório — que nunca batia — então o post real era inserido de novo,
duplicando a entrada. Corrigido para usar o post retornado pela própria mutation (com o id real)
ao inserir no cache, então a checagem de duplicidade da subscription funciona corretamente
independente da ordem de chegada.

## 7. Formulário de edição abria vazio (frontend)

**Arquivo:** `frontend/src/pages/PostDetailPage.tsx`

O título/descrição do formulário de edição eram preenchidos por um `useEffect(() => {...}, [])`
com array de dependências vazio — ele roda uma única vez, no primeiro render, quando a query
`POST_QUERY` ainda pode não ter resolvido (`data` undefined). Como o array de dependências nunca
muda, o efeito nunca reexecuta quando o dado chega, e o formulário abre com os campos em branco.
Se salvo sem perceber, o título e a descrição reais do post eram apagados. Corrigido preenchendo
os campos diretamente no clique do botão "Edit" (nesse ponto o post já está garantidamente
carregado, pelos guards de `loading`/`error` acima).

---

Todos os bugs foram verificados manualmente rodando a stack completa (Postgres + RabbitMQ +
backend + frontend) e testando: criação de post sem duplicação, edição propagando em tempo real
entre abas (tanto na página de detalhe quanto na lista), e o dashboard de conexões
incrementando/decrementando corretamente ao abrir/fechar abas.

`npm test`, `npm run lint` e `npm run build` (backend e frontend) ficam limpos.
