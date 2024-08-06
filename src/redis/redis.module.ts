import { DynamicModule, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';


export const convertPort= (port: any)=>{
  if(typeof port === 'number'){
    return port;
  }
  else{
    return parseInt(port)
  }
}
@Module({})
export class RedisModule {
  static register(options: RedisOptions): DynamicModule{
    const {host, port, sslEnabled, isGlobal}= options;
    const redis= new Redis({
      host: host ?? 'localhost',
      port: convertPort(port) ?? 6379,
      tls: sslEnabled? {}: undefined,
    });
    return {
      module: RedisModule,
      global: isGlobal,
      providers: [
        {
          provide: 'IOREDIS',
          useValue: redis,

        },
        {
          provide: 'REDIS_SERVICE',
          useClass: RedisService,
        }
      ],
      exports: ['IOREDIS', 'REDIS_SERVICE'],
    }
  }
}
export interface RedisOptions {
  host?: string,
  port?: number | string;
  password?: string;
  sslEnabled?: boolean;
  isGlobal?: boolean;
  servicePrefix?: string;
}
