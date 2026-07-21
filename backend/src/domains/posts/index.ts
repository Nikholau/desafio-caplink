import type { DependencyContainer } from 'tsyringe'
import { POST_REPOSITORY } from './core/ports/IPostRepository.js'
import { POST_EVENTS_PRODUCER } from './core/ports/IPostEventsProducer.js'
import { PrismaPostRepository } from './repositories/PrismaPostRepository.js'
import { PostEventsProducer } from './producers/PostEventsProducer.js'
import { startPostEventsConsumer } from './consumers/PostEventsConsumer.js'

export function registerPostsDomain(container: DependencyContainer): void {
  container.register(POST_REPOSITORY, { useClass: PrismaPostRepository })
  container.register(POST_EVENTS_PRODUCER, {
    useFactory: () => new PostEventsProducer(process.env.RABBITMQ_URL!),
  })
}

export async function startPostsConsumers(): Promise<void> {
  await startPostEventsConsumer(process.env.RABBITMQ_URL!)
}
