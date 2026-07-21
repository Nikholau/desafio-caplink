import { inject, injectable } from 'tsyringe'
import { Arg, ID, Mutation, Query, Resolver, Root, Subscription } from 'type-graphql'
import { PostType } from './PostType.js'
import { CreatePostInput } from './CreatePostInput.js'
import { EditPostInput } from './EditPostInput.js'
import { CreatePostUseCase } from '../use-cases/CreatePostUseCase.js'
import { GetPostUseCase } from '../use-cases/GetPostUseCase.js'
import { ListPostsUseCase } from '../use-cases/ListPostsUseCase.js'
import { EditPostUseCase } from '../use-cases/EditPostUseCase.js'
import type { Post } from '../core/entities/Post.js'

@injectable()
@Resolver(() => PostType)
export class PostResolver {
  constructor(
    @inject(CreatePostUseCase) private readonly createPostUseCase: CreatePostUseCase,
    @inject(GetPostUseCase) private readonly getPostUseCase: GetPostUseCase,
    @inject(ListPostsUseCase) private readonly listPostsUseCase: ListPostsUseCase,
    @inject(EditPostUseCase) private readonly editPostUseCase: EditPostUseCase,
  ) {}

  @Query(() => [PostType])
  posts(): Promise<Post[]> {
    return this.listPostsUseCase.execute()
  }

  @Query(() => PostType)
  post(@Arg('id', () => ID) id: string): Promise<Post> {
    return this.getPostUseCase.execute(id)
  }

  @Mutation(() => PostType)
  createPost(@Arg('input', () => CreatePostInput) input: CreatePostInput): Promise<Post> {
    return this.createPostUseCase.execute(input)
  }

  @Mutation(() => PostType)
  editPost(@Arg('input', () => EditPostInput) input: EditPostInput): Promise<Post> {
    return this.editPostUseCase.execute(input)
  }

  @Subscription(() => PostType, { topics: 'POST_CREATED' })
  postCreated(@Root() payload: { post: Post }): Post {
    return payload.post
  }

  @Subscription(() => PostType, {
    topics: 'POST_EDITED',
    // No postId => the list page wants every edit; otherwise only a matching post's viewers care.
    filter: ({ payload, args }) => !args.postId || payload.post.id === args.postId,
  })
  postEdited(
    @Root() payload: { post: Post },
    @Arg('postId', () => ID, { nullable: true }) _postId?: string,
  ): Post {
    return payload.post
  }
}
