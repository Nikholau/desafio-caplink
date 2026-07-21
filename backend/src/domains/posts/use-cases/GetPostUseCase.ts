import { inject, injectable } from 'tsyringe'
import { POST_REPOSITORY, type IPostRepository } from '../core/ports/IPostRepository.js'
import { PostNotFoundError } from '../core/errors/PostNotFoundError.js'
import type { Post } from '../core/entities/Post.js'

@injectable()
export class GetPostUseCase {
  constructor(@inject(POST_REPOSITORY) private readonly repo: IPostRepository) {}

  async execute(id: string): Promise<Post> {
    const post = await this.repo.findById(id)
    if (!post) throw new PostNotFoundError(id)
    return post
  }
}
