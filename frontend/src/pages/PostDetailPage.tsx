import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  EDIT_POST_MUTATION,
  POST_EDITED_SUBSCRIPTION,
  POST_QUERY,
  type Post,
} from '../graphql/posts'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, error } = useQuery<{ post: Post }>(POST_QUERY, {
    variables: { id },
    skip: !id,
  })

  // Mounting this subscription is enough to keep the view live: its result
  // normalizes into the same cached `Post` entity the query above reads,
  // so every open tab re-renders on edit without any manual cache writes.
  useSubscription(POST_EDITED_SUBSCRIPTION, {
    variables: { postId: id },
    skip: !id,
  })

  const [editPost] = useMutation(EDIT_POST_MUTATION)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Seed the form once from the post that was loaded when this page mounted.
  useEffect(() => {
    if (data?.post) {
      setTitle(data.post.title)
      setDescription(data.post.description)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground">Loading post…</p>
  if (error || !data?.post)
    return <p className="text-sm text-destructive">Post not found.</p>

  const post = data.post

  return (
    <div className="w-full max-w-2xl space-y-4">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to posts
      </Link>

      {isEditing ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            editPost({ variables: { input: { id: post.id, title, description } } })
            setIsEditing(false)
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-lg font-semibold text-foreground outline-none focus:border-primary"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {post.title}
            </h1>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Edit
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm text-foreground/80">{post.description}</p>
          <p className="text-xs text-muted-foreground">
            Last updated {new Date(post.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
