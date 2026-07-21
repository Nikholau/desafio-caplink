import { Entity } from '../../../../shared/core/Entity.js'

export class Post extends Entity<string> {
  title: string
  description: string
  readonly createdAt: Date
  updatedAt: Date

  constructor(props: {
    id: string
    title: string
    description: string
    createdAt: Date
    updatedAt: Date
  }) {
    super(props.id)
    this.title = props.title
    this.description = props.description
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  edit(title: string, description: string): void {
    this.title = title
    this.description = description
    this.updatedAt = new Date()
  }
}
