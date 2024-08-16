import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth_module/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { typeOrmConfig, typeOrmConfigASync } from './config/typeorm.config';
import { GeminiModule } from './gemini_module/gemini.module';
import * as dotenv from 'dotenv';

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
    AuthModule,
    GeminiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
