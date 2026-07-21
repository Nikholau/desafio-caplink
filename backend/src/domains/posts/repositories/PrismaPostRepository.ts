import { inject, injectable } from 'tsyringe'
import type { PrismaClient } from '@prisma/client'
import { PRISMA_CLIENT } from '../../../infra/tokens.js'
import type { IPostRepository } from '../core/ports/IPostRepository.js'
import { PostMapper } from '../mappers/PostMapper.js'
import type { Post } from '../core/entities/Post.js'

@injectable()
export class PrismaPostRepository implements IPostRepository {
  constructor(@inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(props: { title: string; description: string }): Promise<Post> {
    const row = await this.prisma.post.create({
      data: PostMapper.toPersistenceCreate(props),
    })
    return PostMapper.toDomain(row)
  }

  async findById(id: string): Promise<Post | null> {
    const row = await this.prisma.post.findUnique({ where: { id } })
    return row ? PostMapper.toDomain(row) : null
  }

  async findAll(): Promise<Post[]> {
    const rows = await this.prisma.post.findMany({ orderBy: { createdAt: 'asc' } })
    return rows.map(PostMapper.toDomain)
  }

  async update(post: Post): Promise<Post> {
    const row = await this.prisma.post.update({
      where: { id: post.id },
      data: PostMapper.toPersistenceUpdate(post),
    })
    return PostMapper.toDomain(row)
  }
}
