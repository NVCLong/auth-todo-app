import {
  Controller,
  Inject,
  UseGuards,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Query,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoDto } from './dto/todo.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiHeader, ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TracingService } from 'src/logger/tracing/tracing.service';
import { Response } from 'express';
import { Public } from 'src/meta/public.meta';

@ApiTags('todo-features')
@Controller('todo')
@UseInterceptors(ClassSerializerInterceptor)
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly logger: TracingService,
  ) {}

  @Get(':userId')
  @Public()
  async getTodoList(@Param('userId') userId: number) {
    this.logger.verbose('Starting to getToDoList', [TodoController.name]);
    return this.todoService.getTodoList(userId);
  }

  // @Public()
  @Patch('complete/:userId')
  async updateNoteStatus(
    @Param('userId') userId: number,
    @Query('noteId') noteId: number,
  ) {
    this.logger.verbose('Starting to update note status', [
      TodoController.name,
    ]);
    return this.todoService.updateStatus(userId, noteId);
  }
  @Get('softDelete/:id')
  async softDeleteNote(@Param('id') id: number) {
    this.logger.verbose('Starting to soft delete', [TodoController.name]);
    return this.todoService.softDeleteNote(id);
  }

  @Delete('delete/:id')
  async deleteNote(@Param('id') id: number) {
    this.logger.verbose('Starting to delete note', [TodoController.name]);
    return this.todoService.deleteNote(id);
  }

  @Patch('content/:id')
  async updateContent(@Param('id') id: number, @Body() note: TodoDto) {
    this.logger.verbose('Starting to update content', [TodoController.name]);
    return this.todoService.updateContent(note, id);
  }

  @Post('create/:id')
  async createNote(@Body() note: TodoDto, @Param('id') id: string) {
    this.logger.verbose('Starting to create ', [TodoController.name]);
    return this.todoService.createNote(note, id);
  }

  @Get('summarize/:id')
  async summarizeContent(@Param('id') id: number) {
    this.logger.verbose('Starting to summarize', [TodoController.name]);
    return this.todoService.summarizeContent(id);
  }

  @Get('rollback/:id')
  async rollbackSummarize(@Param('id') id: number) {
    this.logger.verbose('Starting to rollback', [TodoController.name]);
    return this.todoService.rollbackSummarize(id);
  }
}
