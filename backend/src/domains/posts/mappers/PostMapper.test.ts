import { describe, expect, it } from 'vitest'
import { PostMapper } from './PostMapper.js'
import { Post } from '../core/entities/Post.js'

describe('PostMapper.toPersistenceUpdate', () => {
  it('includes every editable field in the Prisma update input', () => {
    const post = new Post({
      id: 'p1',
      title: 'New title',
      description: 'New description',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    })

    const input = PostMapper.toPersistenceUpdate(post)

    expect(input.title).toBe('New title')
    expect(input.description).toBe('New description')
  })
})
