import { gql } from '@apollo/client'

export const POSTS_QUERY = gql`
  query Posts {
    posts {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`

export const POST_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`

export const EDIT_POST_MUTATION = gql`
  mutation EditPost($input: EditPostInput!) {
    editPost(input: $input) {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`

export const POST_CREATED_SUBSCRIPTION = gql`
  subscription PostCreated {
    postCreated {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`

export const POST_EDITED_SUBSCRIPTION = gql`
  subscription PostEdited($postId: ID) {
    postEdited(postId: $postId) {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`

export type Post = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}
