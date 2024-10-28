import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis'

@Injectable()
export class RedisService  implements OnModuleInit, OnModuleDestroy {
  private client: any
  async onModuleInit() {
      this.client = createClient({
        url: 'redis://localhost:6379',
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

  async setKey(key: string = 'test', value: string = 'redis') {
    await this.client.set(key, value)
  }

  async checkKeyExist(key: string) {
    const isExist = await this.client.exists(key)
    return isExist === 1
  }
}
