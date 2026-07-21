import { Field, Int, ObjectType } from 'type-graphql'

@ObjectType('ConnectionsStatus')
export class ConnectionsStatusType {
  @Field(() => Int)
  count!: number
}
