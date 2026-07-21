import { DomainError } from '../../../../shared/core/DomainError.js'

export class PostNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Post ${id} not found`)
  }
}
