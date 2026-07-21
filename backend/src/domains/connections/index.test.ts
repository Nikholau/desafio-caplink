import { describe, expect, it } from 'vitest'
import { container as rootContainer } from 'tsyringe'
import { registerConnectionsDomain } from './index.js'
import { CONNECTION_REGISTRY } from './core/ports/IConnectionRegistry.js'

describe('registerConnectionsDomain', () => {
  it('registers a single shared connection registry instance', () => {
    const container = rootContainer.createChildContainer()
    registerConnectionsDomain(container)

    const first = container.resolve(CONNECTION_REGISTRY)
    const second = container.resolve(CONNECTION_REGISTRY)

    expect(first).toBe(second)
  })
})
