import { inject, injectable } from 'tsyringe'
import {
  CONNECTION_REGISTRY,
  type IConnectionRegistry,
} from '../core/ports/IConnectionRegistry.js'

@injectable()
export class GetConnectionsSnapshotUseCase {
  constructor(@inject(CONNECTION_REGISTRY) private readonly registry: IConnectionRegistry) {}

  execute(): { count: number } {
    return { count: this.registry.count() }
  }
}
