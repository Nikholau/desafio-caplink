import { describe, expect, it } from 'vitest'
import { CreatePostUseCase } from './CreatePostUseCase.js'
import { MockPostRepository } from '../mocks/MockPostRepository.js'
import { MockPostEventsProducer } from '../mocks/MockPostEventsProducer.js'

describe('CreatePostUseCase', () => {
  it('creates and persists a post, and publishes a PostCreated event', async () => {
    const repo = new MockPostRepository()
    const producer = new MockPostEventsProducer()
    const useCase = new CreatePostUseCase(repo, producer)

    const post = await useCase.execute({ title: 'Hello', description: 'World' })

    expect(post.title).toBe('Hello')
    expect(post.description).toBe('World')
    expect(await repo.findById(post.id)).not.toBeNull()
    expect(producer.publishedCreatedEvents).toHaveLength(1)
    expect(producer.publishedCreatedEvents[0].id).toBe(post.id)
  })
})
