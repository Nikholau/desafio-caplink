import { inject, injectable } from 'tsyringe'
import { Query, Resolver, Root, Subscription } from 'type-graphql'
import { ConnectionsStatusType } from './ConnectionsStatusType.js'
import { GetConnectionsSnapshotUseCase } from '../use-cases/GetConnectionsSnapshotUseCase.js'

@injectable()
@Resolver(() => ConnectionsStatusType)
export class ConnectionsResolver {
  constructor(
    @inject(GetConnectionsSnapshotUseCase)
    private readonly getConnectionsSnapshotUseCase: GetConnectionsSnapshotUseCase,
  ) {}

  @Query(() => ConnectionsStatusType)
  connectionsStatus(): { count: number } {
    return this.getConnectionsSnapshotUseCase.execute()
  }

  @Subscription(() => ConnectionsStatusType, { topics: 'CONNECTIONS_CHANGED' })
  connectionsChanged(@Root() payload: { count: number }): { count: number } {
    return payload
  }
}
