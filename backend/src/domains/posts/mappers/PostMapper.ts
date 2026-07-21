import type { Post as PrismaPost, Prisma } from '@prisma/client'
import { Post } from '../core/entities/Post.js'

export class PostMapper {
  static toDomain(row: PrismaPost): Post {
    return new Post({
      id: row.id,
      title: row.title,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  static toPersistenceCreate(props: {
    title: string
    description: string
  }): Prisma.PostCreateInput {
    return {
      title: props.title,
      description: props.description,
    }
  }

  static toPersistenceUpdate(post: Post): Prisma.PostUpdateInput {
    return {
      description: post.description,
      updatedAt: post.updatedAt,
    }
  }
}
