import { Entity } from '../../../../shared/core/Entity.js'

export class Connection extends Entity<string> {
  constructor(
    id: string,
    public readonly connectedAt: Date,
  ) {
    super(id)
  }
}
