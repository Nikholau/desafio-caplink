import { describe, expect, it, vi } from 'vitest'
import { ConnectionTrackingService } from './ConnectionTrackingService.js'
import { MockConnectionRegistry } from '../../mocks/MockConnectionRegistry.js'
import type { PubSub } from '@graphql-yoga/subscription'
import type { AppEvents } from '../../../../infra/pubsub.js'

function createMockPubSub(): PubSub<AppEvents> {
  return { publish: vi.fn() } as unknown as PubSub<AppEvents>
}

describe('ConnectionTrackingService', () => {
  it('increments the count and publishes it on connect', () => {
    const registry = new MockConnectionRegistry()
    const pubsub = createMockPubSub()
    const service = new ConnectionTrackingService(registry, pubsub)

    service.onConnect('conn-1')

    expect(registry.count()).toBe(1)
    expect(pubsub.publish).toHaveBeenCalledWith('CONNECTIONS_CHANGED', { count: 1 })
  })

  it('decrements the count and publishes it on disconnect', () => {
    const registry = new MockConnectionRegistry()
    const pubsub = createMockPubSub()
    const service = new ConnectionTrackingService(registry, pubsub)

    service.onConnect('conn-1')
    service.onConnect('conn-2')
    service.onDisconnect('conn-1')

    expect(registry.count()).toBe(1)
    expect(pubsub.publish).toHaveBeenLastCalledWith('CONNECTIONS_CHANGED', { count: 1 })
  })

  it('tracks multiple simultaneous connections independently', () => {
    const registry = new MockConnectionRegistry()
    const pubsub = createMockPubSub()
    const service = new ConnectionTrackingService(registry, pubsub)

    service.onConnect('conn-1')
    service.onConnect('conn-2')
    service.onConnect('conn-3')
    service.onDisconnect('conn-2')

    expect(registry.count()).toBe(2)
    expect(registry.list().map((c) => c.id).sort()).toEqual(['conn-1', 'conn-3'])
  })
})
