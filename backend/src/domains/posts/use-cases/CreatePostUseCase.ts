import { inject, injectable } from 'tsyringe'
import { POST_REPOSITORY, type IPostRepository } from '../core/ports/IPostRepository.js'
import {
  POST_EVENTS_PRODUCER,
  type IPostEventsProducer,
} from '../core/ports/IPostEventsProducer.js'
import type { Post } from '../core/entities/Post.js'

@injectable()
export class CreatePostUseCase {
  constructor(
    @inject(POST_REPOSITORY) private readonly repo: IPostRepository,
    @inject(POST_EVENTS_PRODUCER) private readonly producer: IPostEventsProducer,
  ) {}

  async execute(input: { title: string; description: string }): Promise<Post> {
    const post = await this.repo.create(input)
    await this.producer.publishPostCreated(post)
    return post
  }
}
