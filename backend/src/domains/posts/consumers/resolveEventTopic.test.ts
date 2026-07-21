import { describe, expect, it } from 'vitest'
import { resolveEventTopic } from './resolveEventTopic.js'

describe('resolveEventTopic', () => {
  it('routes a PostCreated event to the POST_CREATED topic', () => {
    expect(resolveEventTopic('PostCreated')).toBe('POST_CREATED')
  })

  it('routes a PostEdited event to the POST_EDITED topic', () => {
    expect(resolveEventTopic('PostEdited')).toBe('POST_EDITED')
  })
})
