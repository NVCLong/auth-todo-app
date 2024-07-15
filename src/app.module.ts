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
import { TracingMiddlware } from './tracing/tracing.middleware';
import { TracingModule } from './tracing/tracing.module';
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddlware).forRoutes('*');
  }
}
