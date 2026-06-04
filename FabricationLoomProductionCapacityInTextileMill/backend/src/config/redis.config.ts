export const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  db: 0,
  keyPrefix: 'loom:',
  realtimeDataKey: 'realtime:data',
  aggregateKey: 'aggregate:buffer',
};

export const REDIS_REALTIME_CHANNEL = 'loom:realtime:channel';
export const REDIS_ALERT_CHANNEL = 'loom:alert:channel';
