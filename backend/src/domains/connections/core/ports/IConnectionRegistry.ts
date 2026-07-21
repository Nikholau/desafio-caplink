import type { Connection } from '../entities/Connection.js'

export interface IConnectionRegistry {
  add(connection: Connection): void
  remove(id: string): void
  count(): number
  list(): Connection[]
}

export const CONNECTION_REGISTRY = Symbol('CONNECTION_REGISTRY')
