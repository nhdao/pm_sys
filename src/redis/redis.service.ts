import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis'

@Injectable()
export class RedisService  implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType
  private redisHost: string
  private redisPort: string
  constructor(private configService: ConfigService) {
    this.redisHost = this.configService.get<string>('REDIS_HOST')
    this.redisPort = this.configService.get<string>('REDIS_PORT')
  }
  async onModuleInit() {
      this.client = createClient({
        url: `redis://${this.redisHost}:${this.redisPort}`,
        socket: {
          reconnectStrategy: function(retries) {
              if (retries > 20) {
                  console.log("Too many attempts to reconnect. Redis connection was terminated");
                  return new Error("Too many retries.");
              } else {
                  return retries * 500;
              }
            }}
      })
      this.client.on('error', (err) => console.log('Redis Client Error', err));
      await this.client.connect();
  }

  async onModuleDestroy() {
    if(this.client) {
      await this.client.disconnect();
    }
  }

  async deleteValueByKey(key: string) {
    await this.client.del(key)
  }

  async setKeyWithEx(key: string, value: string, ttl?: number) {
    await this.client.set(key, value, {EX: ttl})
  }

  async getValueByKey(key: string) {
    return JSON.parse(await this.client.get(key))
  }

  async hSetKeyWithEx(key: string, value: object = {}) {
    for(const field in value) {
      await this.client.hSet(key, field, value[field])
    }
  }

  async hGetValueByKey(key: string) {
    return await this.client.hGetAll(key)
  }

  async checkKeyExist(key: string) {
    const isExist = await this.client.exists(key)
    return isExist === 1
  }
}
