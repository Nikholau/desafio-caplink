import { Field, InputType } from 'type-graphql'
import { IsNotEmpty, MaxLength } from 'class-validator'

@InputType()
export class CreatePostInput {
  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(200)
  title!: string

  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string
}
