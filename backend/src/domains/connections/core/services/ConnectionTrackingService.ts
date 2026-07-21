import { inject, injectable } from 'tsyringe'
import {
  CONNECTION_REGISTRY,
  type IConnectionRegistry,
} from '../ports/IConnectionRegistry.js'
import { PUBSUB } from '../../../../infra/tokens.js'
import type { AppEvents } from '../../../../infra/pubsub.js'
import type { PubSub } from '@graphql-yoga/subscription'
import { Connection } from '../entities/Connection.js'

@injectable()
export class ConnectionTrackingService {
  constructor(
    @inject(CONNECTION_REGISTRY) private readonly registry: IConnectionRegistry,
    @inject(PUBSUB) private readonly pubsub: PubSub<AppEvents>,
  ) {}

  onConnect(id: string): void {
    this.registry.add(new Connection(id, new Date()))
    this.pubsub.publish('CONNECTIONS_CHANGED', { count: this.registry.count() })
  }

  onDisconnect(id: string): void {
    this.registry.remove(id)
    this.pubsub.publish('CONNECTIONS_CHANGED', { count: this.registry.count() })
  }
}
