
import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MyService {
  private client: RedisClientType;

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = process.env.REDIS_PORT || '6379';
    const redisPassword = process.env.REDIS_PASSWORD || '';

    this.client = createClient({
      url: `redis://${redisHost}:${redisPort}`,
      password: redisPassword || undefined,
    });

    this.client.on('error', (err) =>
      console.error('Redis Client Error', err),
    );

    this.connectClient();
  }

  async connectClient() {
    await this.client.connect();
  }

  async setResendOtp(key: string, value: number): Promise<void> {
    await this.client.set(key, value, { EX: 1800 });
  }

  async getOtpValue(key: string): Promise<string> {
    return await this.client.get(key);
  }

  async deleteOtpValue(key: string): Promise<void> {
    await this.client.del(key);
  }
}








