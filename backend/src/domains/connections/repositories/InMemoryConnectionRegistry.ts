import { injectable } from 'tsyringe'
import type { IConnectionRegistry } from '../core/ports/IConnectionRegistry.js'
import type { Connection } from '../core/entities/Connection.js'

@injectable()
export class InMemoryConnectionRegistry implements IConnectionRegistry {
  private readonly connections = new Map<string, Connection>()

  add(connection: Connection): void {
    this.connections.set(connection.id, connection)
  }

  remove(id: string): void {
    this.connections.delete(id)
  }

  count(): number {
    return this.connections.size
  }

  list(): Connection[] {
    return Array.from(this.connections.values())
  }
}
