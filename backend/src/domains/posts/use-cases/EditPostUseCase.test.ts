import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditPostUseCase } from './EditPostUseCase.js'
import { MockPostRepository } from '../mocks/MockPostRepository.js'
import { MockPostEventsProducer } from '../mocks/MockPostEventsProducer.js'
import { PostNotFoundError } from '../core/errors/PostNotFoundError.js'
import type { Post } from '../core/entities/Post.js'

describe('EditPostUseCase', () => {
  let repo: MockPostRepository
  let producer: MockPostEventsProducer
  let useCase: EditPostUseCase
  let existing: Post

  beforeEach(async () => {
    repo = new MockPostRepository()
    producer = new MockPostEventsProducer()
    useCase = new EditPostUseCase(repo, producer)
    existing = await repo.create({ title: 'Old', description: 'Old body' })
  })

  it('persists the edit and publishes a PostEdited event', async () => {
    const result = await useCase.execute({
      id: existing.id,
      title: 'New',
      description: 'New body',
    })

    expect(result.title).toBe('New')
    expect((await repo.findById(existing.id))?.description).toBe('New body')
    expect(producer.publishedEditedEvents).toHaveLength(1)
    expect(producer.publishedEditedEvents[0].id).toBe(existing.id)
  })

  it('throws PostNotFoundError for an unknown id', async () => {
    await expect(
      useCase.execute({ id: 'missing', title: 'x', description: 'y' }),
    ).rejects.toBeInstanceOf(PostNotFoundError)
  })

  it('persists the update before publishing the PostEdited event', async () => {
    const callOrder: string[] = []

    const originalUpdate = repo.update.bind(repo)
    vi.spyOn(repo, 'update').mockImplementation(async (post) => {
      const result = await originalUpdate(post)
      callOrder.push('update')
      return result
    })

    const originalPublish = producer.publishPostEdited.bind(producer)
    vi.spyOn(producer, 'publishPostEdited').mockImplementation(async (post) => {
      callOrder.push('publish')
      return originalPublish(post)
    })

    await useCase.execute({ id: existing.id, title: 'New', description: 'New body' })

    expect(callOrder).toEqual(['update', 'publish'])
  })
})
