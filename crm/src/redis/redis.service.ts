import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly subscriberClient: RedisClient;
  private readonly publisherClient: RedisClient;
  private readonly logger = new Logger('RedisService');

  constructor() {
    const { REDIS_IP, REDIS_PORT, REDIS_PASSWORD } = process.env;

    // Create a subscriber client
    this.subscriberClient = new Redis({
      host: REDIS_IP,
      port: parseInt(REDIS_PORT, 10) || 6379,
      password: REDIS_PASSWORD,
    });

    // Create a publisher client
    this.publisherClient = new Redis({
      host: REDIS_IP,
      port: parseInt(REDIS_PORT, 10) || 6379,
      password: REDIS_PASSWORD,
    });

    this.subscriberClient.on('connect', () => {
      this.logger.log('Connected to Redis server for subscription');
    });

    this.publisherClient.on('connect', () => {
      this.logger.log('Connected to Redis server for publishing');
    });

    // Handle errors for both clients
    this.subscriberClient.on('error', this.handleError.bind(this));
    this.publisherClient.on('error', this.handleError.bind(this));
  }

  async onModuleInit(): Promise<void> {}

  async setValue(
    key: string,
    value: string,
    expiration?: number,
  ): Promise<void> {
    try {
      await this.publisherClient.set(key, value);
      if (expiration) {
        await this.publisherClient.expire(key, expiration);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getValue(key: string): Promise<string | null> {
    try {
      const value = await this.publisherClient.get(key);
      return value;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.publisherClient.publish(channel, message);
      this.logger.log(`Message published to channel ${channel}: ${message}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async subscribe(
    channel: string,
    callback: (
      error?: any,
      response?: { channel: string; message: string },
    ) => void,
  ): Promise<void> {
    try {
      await this.subscriberClient.subscribe(channel);
      this.logger.log(`Subscribed to channel: ${channel}`);
      this.subscriberClient.on('message', (ch, msg) => {
        if (ch === channel) {
          callback(null, { channel: ch, message: msg });
        }
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriberClient.unsubscribe(channel);
      this.logger.log(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enqueue(queueName: string, item: string): Promise<void> {
    try {
      await this.publisherClient.lpush(queueName, item);
      this.logger.log(`Enqueued item "${item}" to queue "${queueName}"`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async dequeue(queueName: string): Promise<string | null> {
    try {
      const item = await this.publisherClient.lpop(queueName);
      this.logger.log(`Dequeued item "${item}" from queue "${queueName}"`);
      return item;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  private handleError(error: Error): void {
    this.logger.error(`Redis error: ${error.message}`);
  }
}
