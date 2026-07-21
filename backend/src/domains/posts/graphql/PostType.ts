import { Field, GraphQLISODateTime, ID, ObjectType } from 'type-graphql'

@ObjectType('Post')
export class PostType {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  title!: string

  @Field(() => String)
  description!: string

  @Field(() => GraphQLISODateTime)
  createdAt!: Date

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date
}
