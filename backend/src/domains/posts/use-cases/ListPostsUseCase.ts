import { inject, injectable } from 'tsyringe'
import { POST_REPOSITORY, type IPostRepository } from '../core/ports/IPostRepository.js'
import type { Post } from '../core/entities/Post.js'

@injectable()
export class ListPostsUseCase {
  constructor(@inject(POST_REPOSITORY) private readonly repo: IPostRepository) {}

  execute(): Promise<Post[]> {
    return this.repo.findAll()
  }
}
