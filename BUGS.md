# Bugs encontrados e correções

Oito bugs encontrados nas quatro áreas apontadas no README (lógica de domínio, wiring de DI,
camada RabbitMQ/realtime e frontend). Os cinco primeiros já tinham teste unitário cobrindo
(estavam falhando antes da correção); os demais só apareciam usando o app ou sob revisão de
arquitetura/carga.

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

## 8. Vazamento de conexão AMQP no producer de eventos

**Arquivo:** `backend/src/domains/posts/index.ts`

`registerPostsDomain` registrava `POST_EVENTS_PRODUCER` com `container.register(TOKEN, { useFactory: ... })`
sem cache de instância. O tipo `FactoryProvider` do tsyringe documenta explicitamente que
`useFactory` **não** faz cache da instância — cada `container.resolve`/injeção cria uma
`PostEventsProducer` nova, e cada uma abre sua própria conexão TCP com o RabbitMQ na primeira
publicação (`ensureChannel` → `amqp.connect`), sem nunca fechar as anteriores. Como o
`type-graphql` resolve os resolvers (e portanto os use cases e o producer injetado) por
requisição, cada `createPost`/`editPost` vazava uma conexão AMQP nova.

**Como foi encontrado:** ao aplicar uma revisão de arquitetura/DI no wiring do container,
notei que este registro — ao contrário de `PRISMA_CLIENT`/`PUBSUB` (via `registerInstance`) —
não garantia instância única. Confirmei empiricamente: subi a stack localmente (Postgres +
RabbitMQ via Homebrew, sem Docker nesta máquina) e, com `lsof -iTCP:5672`, vi o número de
conexões TCP estabelecidas crescer em +1 a cada `createPost` disparado via curl (5 mutations
→ 5 conexões novas, nunca fechadas). Em produção, sob uso normal, isso esgotaria conexões/file
descriptors do broker.

**Correção:** trocado para `container.registerInstance(POST_EVENTS_PRODUCER, new
PostEventsProducer(...))` — mesmo padrão já usado no projeto para `PRISMA_CLIENT`/`PUBSUB`,
instanciando uma vez no bootstrap e reaproveitando a mesma conexão/canal para todas as
publicações. Reproduzi o mesmo teste depois da correção: 10 mutations consecutivas mantiveram
o número de conexões estável (consumer + 1 producer), sem crescer.

---

Todos os bugs foram verificados manualmente rodando a stack completa (Postgres + RabbitMQ +
backend + frontend) e testando: criação de post sem duplicação, edição propagando em tempo real
entre abas (tanto na página de detalhe quanto na lista), e o dashboard de conexões
incrementando/decrementando corretamente ao abrir/fechar abas.

`npm test`, `npm run lint` e `npm run build` (backend e frontend) ficam limpos.
