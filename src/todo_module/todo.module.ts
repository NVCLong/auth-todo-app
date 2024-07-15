import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { JwtStrategy } from 'src/auth_module/strategy/jwt.strategy';
import { AuthModule } from 'src/auth_module/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from 'src/entities/todo.entity';
import { User } from 'src/entities/user.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { GeminiModule } from 'src/gemini_module/gemini.module';

@Module({
  imports: [TypeOrmModule.forFeature([Todo, User]), GeminiModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
