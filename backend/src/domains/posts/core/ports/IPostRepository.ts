import type { Post } from '../entities/Post.js'

export interface IPostRepository {
  create(props: { title: string; description: string }): Promise<Post>
  findById(id: string): Promise<Post | null>
  findAll(): Promise<Post[]>
  update(post: Post): Promise<Post>
}

export const POST_REPOSITORY = Symbol('POST_REPOSITORY')
