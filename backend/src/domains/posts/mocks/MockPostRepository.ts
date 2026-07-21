import { randomUUID } from 'node:crypto'
import type { IPostRepository } from '../core/ports/IPostRepository.js'
import { Post } from '../core/entities/Post.js'

export class MockPostRepository implements IPostRepository {
  private readonly posts = new Map<string, Post>()

  async create(props: { title: string; description: string }): Promise<Post> {
    const now = new Date()
    const post = new Post({
      id: randomUUID(),
      title: props.title,
      description: props.description,
      createdAt: now,
      updatedAt: now,
    })
    this.posts.set(post.id, post)
    return post
  }

  async findById(id: string): Promise<Post | null> {
    return this.posts.get(id) ?? null
  }

  async findAll(): Promise<Post[]> {
    return Array.from(this.posts.values())
  }

  async update(post: Post): Promise<Post> {
    this.posts.set(post.id, post)
    return post
  }
}
