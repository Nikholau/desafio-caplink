import { injectable } from 'tsyringe'
import amqp, { type Channel, type ChannelModel } from 'amqplib'
import type { IPostEventsProducer } from '../core/ports/IPostEventsProducer.js'
import type { Post } from '../core/entities/Post.js'

const EXCHANGE = 'posts.events'

@injectable()
export class PostEventsProducer implements IPostEventsProducer {
  private connection?: ChannelModel
  private channel?: Channel
  private connecting?: Promise<void>

  constructor(private readonly amqpUrl: string) {}

  private async ensureChannel(): Promise<Channel> {
    if (this.channel) return this.channel
    if (!this.connecting) this.connecting = this.connect()
    await this.connecting
    return this.channel!
  }

  private async connect(): Promise<void> {
    this.connection = await amqp.connect(this.amqpUrl)
    this.connection.on('close', () => {
      this.channel = undefined
      this.connecting = undefined
    })
    this.connection.on('error', () => {
      this.channel = undefined
      this.connecting = undefined
    })
    this.channel = await this.connection.createChannel()
    await this.channel.assertExchange(EXCHANGE, 'fanout', { durable: true })
  }

  async publishPostCreated(post: Post): Promise<void> {
    const channel = await this.ensureChannel()
    channel.publish(
      EXCHANGE,
      '',
      Buffer.from(JSON.stringify({ type: 'PostCreated', post })),
      { contentType: 'application/json', persistent: false },
    )
  }

  async publishPostEdited(post: Post): Promise<void> {
    const channel = await this.ensureChannel()
    channel.publish(
      EXCHANGE,
      '',
      Buffer.from(JSON.stringify({ type: 'PostEdited', post })),
      { contentType: 'application/json', persistent: false },
    )
  }
}
