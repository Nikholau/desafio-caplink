import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  CREATE_POST_MUTATION,
  POST_CREATED_SUBSCRIPTION,
  POST_EDITED_SUBSCRIPTION,
  POSTS_QUERY,
  type Post,
} from '../graphql/posts'

export function PostsListPage() {
  const { data, loading, error, updateQuery } = useQuery<{ posts: Post[] }>(POSTS_QUERY)
  const [createPost] = useMutation(CREATE_POST_MUTATION)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // New posts don't exist in the cached list yet, so unlike an edit there's no
  // existing normalized entity for Apollo to merge into automatically — insert
  // it into the list explicitly (guarding against the creator's own tab seeing
  // its own post twice).
  useSubscription<{ postCreated: Post }>(POST_CREATED_SUBSCRIPTION, {
    onData: ({ data: subData }) => {
      const post = subData.data?.postCreated
      if (!post) return
      updateQuery((prev) => {
        if (prev.posts.some((existing) => existing.id === post.id)) return prev
        return { posts: [post, ...prev.posts] }
      })
    },
  })

  // Edits DO normalize automatically (Post has an id), so just mounting this
  // keeps every list row's title/description live without any manual merge.
  useSubscription(POST_EDITED_SUBSCRIPTION)

  if (loading) return <p className="text-sm text-muted-foreground">Loading posts…</p>
  if (error)
    return (
      <p className="text-sm text-destructive">
        Could not reach the backend at localhost:8000 — start it with{' '}
        <code>docker compose up</code>.
      </p>
    )

  return (
    <div className="w-full max-w-2xl space-y-8">
      <form
        className="space-y-3 rounded-md border border-border bg-muted/40 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!title.trim() || !description.trim()) return
          createPost({ variables: { input: { title, description } } })
          const now = new Date().toISOString()
          updateQuery((prev) => ({
            posts: [
              { id: crypto.randomUUID(), title, description, createdAt: now, updatedAt: now },
              ...prev.posts,
            ],
          }))
          setTitle('')
          setDescription('')
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Create post
        </button>
      </form>

      <ul className="space-y-2">
        {data?.posts.map((post) => (
          <li key={post.id}>
            <Link
              to={`/posts/${post.id}`}
              className="block rounded-md border border-border px-4 py-3 hover:bg-muted"
            >
              <p className="font-medium text-foreground">{post.title}</p>
              <p className="truncate text-sm text-muted-foreground">{post.description}</p>
            </Link>
          </li>
        ))}
        {data?.posts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No posts yet — create the first one above.
          </p>
        )}
      </ul>
    </div>
  )
}
