import { createPubSub } from '@graphql-yoga/subscription'
import type { Post } from '../domains/posts/core/entities/Post.js'

export type AppEvents = {
  POST_CREATED: [payload: { post: Post }]
  POST_EDITED: [payload: { post: Post }]
  CONNECTIONS_CHANGED: [payload: { count: number }]
}

export const pubsub = createPubSub<AppEvents>()
