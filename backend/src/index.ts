import 'reflect-metadata'
import 'dotenv/config'
import http from 'node:http'
import { randomUUID } from 'node:crypto'
import express from 'express'
import cors from 'cors'
import { container } from 'tsyringe'
import { PrismaClient } from '@prisma/client'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/use/ws'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'

import { PRISMA_CLIENT, PUBSUB } from './infra/tokens.js'
import { pubsub } from './infra/pubsub.js'
import { buildAppSchema } from './schema.js'
import { registerPostsDomain, startPostsConsumers } from './domains/posts/index.js'
import {
  registerConnectionsDomain,
  startConnectionsConsumers,
} from './domains/connections/index.js'
import { ConnectionTrackingService } from './domains/connections/core/services/ConnectionTrackingService.js'

const PORT = Number(process.env.PORT) || 8000

container.registerInstance(PRISMA_CLIENT, new PrismaClient())
container.registerInstance(PUBSUB, pubsub)
registerPostsDomain(container)
registerConnectionsDomain(container)

const schema = await buildAppSchema()

const app = express()
const httpServer = http.createServer(app)

const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })
const connectionTracking = container.resolve(ConnectionTrackingService)

const serverCleanup = useServer(
  {
    schema,
    onConnect: (ctx) => {
      const id = randomUUID()
      ;(ctx.extra as { connectionId?: string }).connectionId = id
      connectionTracking.onConnect(id)
    },
    onDisconnect: (ctx) => {
      const id = (ctx.extra as { connectionId?: string }).connectionId
      if (id) connectionTracking.onDisconnect(id)
    },
  },
  wsServer,
)

const apolloServer = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

await apolloServer.start()

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(apolloServer, {
    context: async ({ req, res }) => ({ req, res }),
  }),
)

await startPostsConsumers()
await startConnectionsConsumers()

httpServer.listen(PORT, () => {
  console.log(`HTTP/GraphQL server ready at http://localhost:${PORT}/graphql`)
  console.log(`WS subscriptions ready at ws://localhost:${PORT}/graphql`)
})
