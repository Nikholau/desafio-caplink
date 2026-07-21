import { Field, ID, InputType } from 'type-graphql'
import { IsNotEmpty, MaxLength } from 'class-validator'

@InputType()
export class EditPostInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string

  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(200)
  title!: string

  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string
}
