import type { DependencyContainer } from 'tsyringe'
import { CONNECTION_REGISTRY } from './core/ports/IConnectionRegistry.js'
import { InMemoryConnectionRegistry } from './repositories/InMemoryConnectionRegistry.js'

export function registerConnectionsDomain(container: DependencyContainer): void {
  container.register(CONNECTION_REGISTRY, { useClass: InMemoryConnectionRegistry })
}

// No RabbitMQ producers/consumers in v1 — the registry is in-process memory, correct
// for the single-replica docker-compose default. With >1 replica this under-reports
// (each instance only knows its own sockets); extending to a shared count would mean
// mirroring the Posts fanout pattern or moving the registry to a shared store.
export async function startConnectionsConsumers(): Promise<void> {}
