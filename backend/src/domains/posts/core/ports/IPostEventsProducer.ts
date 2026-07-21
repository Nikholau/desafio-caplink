import type { Post } from '../entities/Post.js'

export interface IPostEventsProducer {
  publishPostCreated(post: Post): Promise<void>
  publishPostEdited(post: Post): Promise<void>
}

export const POST_EVENTS_PRODUCER = Symbol('POST_EVENTS_PRODUCER')
