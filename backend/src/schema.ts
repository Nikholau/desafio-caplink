import { buildSchema } from 'type-graphql'
import type { GraphQLSchema } from 'graphql'
import { container } from 'tsyringe'
import { createTsyringeContainerAdapter } from './infra/tsyringe-container-adapter.js'
import { pubsub } from './infra/pubsub.js'
import { PostResolver } from './domains/posts/graphql/PostResolver.js'
import { ConnectionsResolver } from './domains/connections/graphql/ConnectionsResolver.js'

export function buildAppSchema(): Promise<GraphQLSchema> {
  return buildSchema({
    resolvers: [PostResolver, ConnectionsResolver],
    container: createTsyringeContainerAdapter(container),
    pubSub: pubsub,
    validate: true,
  })
}
