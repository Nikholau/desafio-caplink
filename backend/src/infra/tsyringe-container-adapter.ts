import type { DependencyContainer } from 'tsyringe'
import type { ContainerType } from 'type-graphql'

export function createTsyringeContainerAdapter(scope: DependencyContainer): ContainerType {
  return {
    get: (someClass) => scope.resolve(someClass),
  }
}
