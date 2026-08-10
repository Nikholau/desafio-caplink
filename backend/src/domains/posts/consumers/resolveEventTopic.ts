export type PostEventType = 'PostCreated' | 'PostEdited'
export type PostEventTopic = 'POST_CREATED' | 'POST_EDITED'

export function resolveEventTopic(eventType: PostEventType): PostEventTopic {
  if (eventType === 'PostCreated') return 'POST_CREATED'
  return 'POST_EDITED'
}
