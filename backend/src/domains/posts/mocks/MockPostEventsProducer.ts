import type { IPostEventsProducer } from '../core/ports/IPostEventsProducer.js'
import type { Post } from '../core/entities/Post.js'

export class MockPostEventsProducer implements IPostEventsProducer {
  readonly publishedCreatedEvents: Post[] = []
  readonly publishedEditedEvents: Post[] = []

  async publishPostCreated(post: Post): Promise<void> {
    this.publishedCreatedEvents.push(post)
  }

  async publishPostEdited(post: Post): Promise<void> {
    this.publishedEditedEvents.push(post)
  }
}
