import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig, REDIS_REALTIME_CHANNEL } from '../config/redis.config';

export interface RealtimeData {
  loomId: number;
  loomCode: string;
  timestamp: string;
  meterage: number;
  incrementalMeters: number;
  runningStatus: number;
  speed: number;
  defectiveMeters: number;
}

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private subscriber: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
      keyPrefix: redisConfig.keyPrefix,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      enableReadyCheck: true,
    });

    this.subscriber = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err.message);
    });

    this.subscriber.on('connect', () => {
      this.logger.log('Redis subscriber connected');
    });
  }

  async writeRealtimeData(loomId: number, data: Omit<RealtimeData, 'loomId'>): Promise<void> {
    const key = `${redisConfig.realtimeDataKey}:${loomId}`;
    const timestamp = data.timestamp || new Date().toISOString();
    
    const dataWithId: RealtimeData = {
      loomId,
      ...data,
      timestamp,
    };

    const pipeline = this.client.pipeline();
    pipeline.set(key, JSON.stringify(dataWithId), 'EX', 3600);
    pipeline.lpush(`${redisConfig.aggregateKey}:${loomId}`, JSON.stringify(dataWithId));
    pipeline.ltrim(`${redisConfig.aggregateKey}:${loomId}`, 0, 3599);
    pipeline.publish(REDIS_REALTIME_CHANNEL, JSON.stringify(dataWithId));

    await pipeline.exec();
  }

  async getRealtimeData(loomId: number): Promise<RealtimeData | null> {
    const key = `${redisConfig.realtimeDataKey}:${loomId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getBatchRealtimeData(loomIds: number[]): Promise<RealtimeData[]> {
    if (loomIds.length === 0) return [];
    
    const keys = loomIds.map(id => `${redisConfig.realtimeDataKey}:${id}`);
    const results = await this.client.mget(...keys);
    
    return results
      .filter((data): data is string => data !== null)
      .map(data => JSON.parse(data));
  }

  async getRealtimeBuffer(loomId: number, limit: number = 60): Promise<RealtimeData[]> {
    const key = `${redisConfig.aggregateKey}:${loomId}`;
    const data = await this.client.lrange(key, 0, limit - 1);
    return data.map(item => JSON.parse(item));
  }

  async clearBuffer(loomId: number): Promise<void> {
    const key = `${redisConfig.aggregateKey}:${loomId}`;
    await this.client.del(key);
  }

  async subscribeRealtime(callback: (data: RealtimeData) => void): Promise<void> {
    await this.subscriber.subscribe(REDIS_REALTIME_CHANNEL);
    this.subscriber.on('message', (_channel, message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (e) {
        this.logger.error('Failed to parse realtime message:', e);
      }
    });
  }

  async setCache(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } else {
      await this.client.set(key, JSON.stringify(value));
    }
  }

  async getCache<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delCache(key: string): Promise<void> {
    await this.client.del(key);
  }

  getClient(): Redis {
    return this.client;
  }
}
