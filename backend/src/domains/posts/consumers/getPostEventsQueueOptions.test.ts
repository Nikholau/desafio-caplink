import { describe, expect, it } from 'vitest'
import { getPostEventsQueueOptions } from './getPostEventsQueueOptions.js'

describe('getPostEventsQueueOptions', () => {
  it('declares an anonymous, exclusive, auto-delete queue so every replica gets its own', () => {
    const options = getPostEventsQueueOptions()

    expect(options.name).toBe('')
    expect(options.exclusive).toBe(true)
    expect(options.autoDelete).toBe(true)
  })
})
