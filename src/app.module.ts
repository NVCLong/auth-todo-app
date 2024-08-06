import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from './todo_module/todo.module';
import { AuthModule } from './auth_module/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { typeOrmConfigASync } from './config/typeorm.config';
import { GeminiModule } from './gemini_module/gemini.module';
import * as dotenv from 'dotenv';
import { TracingMiddlware } from './logger/tracing/tracing.middleware';
import { TracingModule } from './logger/tracing/tracing.module';
import { GlobalLogger } from './logger/global-logger/global-logger.service';
import { GlobalLoggerModule } from './logger/global-logger/global-logger.module';
import { GlobalLoggerMiddleware } from './logger/global-logger/global-logger.middleware';
import { PhotoModule } from './photo_module/photo.module';
import { AzureBlobModule } from './azure_module/azure-blob.module';
import { ClusterMiddleware } from './logger/cluster.middleware';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';


dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ ...process.env })],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigASync),
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
      max: 10,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    TodoModule,
    AuthModule,
    GeminiModule,
    TracingModule,
    GlobalLoggerModule,
    PhotoModule,
    AzureBlobModule,
    RedisModule.register({
      host: 'localhost',
      port: 6379,
      isGlobal: true
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalLoggerMiddleware).forRoutes("*")
    consumer.apply(TracingMiddlware).forRoutes('*')
    consumer.apply(ClusterMiddleware).forRoutes('*')
  }
}
