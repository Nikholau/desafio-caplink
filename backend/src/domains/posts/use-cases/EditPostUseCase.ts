import { inject, injectable } from 'tsyringe'
import { POST_REPOSITORY, type IPostRepository } from '../core/ports/IPostRepository.js'
import {
  POST_EVENTS_PRODUCER,
  type IPostEventsProducer,
} from '../core/ports/IPostEventsProducer.js'
import { PostNotFoundError } from '../core/errors/PostNotFoundError.js'
import type { Post } from '../core/entities/Post.js'

@injectable()
export class EditPostUseCase {
  constructor(
    @inject(POST_REPOSITORY) private readonly repo: IPostRepository,
    @inject(POST_EVENTS_PRODUCER) private readonly producer: IPostEventsProducer,
  ) {}

  async execute(input: { id: string; title: string; description: string }): Promise<Post> {
    const post = await this.repo.findById(input.id)
    if (!post) throw new PostNotFoundError(input.id)

    post.edit(input.title, input.description)

    await this.producer.publishPostEdited(post)
    const updated = await this.repo.update(post)

    return updated
  }
}
