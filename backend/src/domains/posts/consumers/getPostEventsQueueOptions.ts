export type PostEventsQueueOptions = {
  name: string
  exclusive: boolean
  autoDelete: boolean
}

// Queue options for this instance's binding to the posts.events exchange.
export function getPostEventsQueueOptions(): PostEventsQueueOptions {
  return { name: 'posts-events-queue', exclusive: false, autoDelete: false }
}
