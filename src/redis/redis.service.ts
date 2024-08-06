import { Inject, Injectable } from '@nestjs/common';
import {Redis} from 'ioredis'
import { TracingService } from 'src/logger/tracing/tracing.service';

@Injectable()
export class RedisService {
  
    constructor(private readonly logger: TracingService, @Inject('IOREDIS') private readonly redis: Redis){
        this.logger.setContext(RedisService.name)
    }


    async  acquireLock(lockKey: string, lockTimeout: number): Promise<boolean>{
        try{
            const acquired= await this.redis.set(lockKey, 'locked', 'PX', lockTimeout, 'NX');
            this.logger.debug('Acquired lock'+ lockKey +'is ' + acquired=='OK', [RedisService.name]);
            return acquired==='OK'
        }catch(e){
            this.logger.error(`Error acquire lock: ${e.message}`, {error: e},[RedisService.name]);
            throw e;
        }
    }

    async releaseLock(lockKey:string): Promise<void>{
        try{
            await this.redis.del(lockKey)
        }catch(e){
            this.logger.error(`Error relesae lock: ${e.message}`, {error: e},[RedisService.name]);
            throw e;
        }
    }
}
