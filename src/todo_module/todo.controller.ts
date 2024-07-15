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
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Public } from 'src/meta/public.meta';
import { Response, Request } from 'express';
import { TodoDto } from './dto/todo.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiHeader, ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TracingService } from 'src/tracing/tracing.service';

@ApiTags('todo-features')
@Controller('todo')
@UseInterceptors(ClassSerializerInterceptor)
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly logger: TracingService,
  ) {
    this.logger.setContext(TodoController.name);
  }
  @ApiResponse({ status: 401, description: 'Unauthorized Request' })
  @ApiResponse({ status: 403, description: 'Forbiden' })
  @Get(':userId')
  async getTodoList(@Param('userId') userId: number) {
    this.logger.verbose('Starting to getToDoList');
    return this.todoService.getTodoList(userId);
  }

  // @Public()
  @Patch('complete/:userId')
  async updateNoteStatus(
    @Param('userId') userId: number,
    @Query('noteId') noteId: number,
  ) {
    this.logger.verbose('Starting to update note status');
    return this.todoService.updateStatus(userId, noteId);
  }
  s;

  @Get('softDelete/:id')
  async softDeleteNote(@Param('id') id: number) {
    this.logger.verbose('Starting to soft delete');
    return this.todoService.softDeleteNote(id);
  }

  @Delete('delete/:id')
  async deleteNote(@Param('id') id: number) {
    this.logger.verbose('Starting to delete note');
    return this.todoService.deleteNote(id);
  }

  @Patch('content/:id')
  async updateContent(@Param('id') id: number, @Body() note: TodoDto) {
    this.logger.verbose('Starting to update content');
    return this.todoService.updateContent(note, id);
  }

  @Post('create/:id')
  async createNote(@Body() note: TodoDto, @Param('id') id: string) {
    this.logger.verbose('Starting to create ');
    return this.todoService.createNote(note, id);
  }

  @Get('summarize/:id')
  async summarizeContent(@Param('id') id: number) {
    this.logger.verbose('Starting to summarize');
    return this.todoService.summarizeContent(id);
  }

  @Get('rollback/:id')
  async rollbackSummarize(@Param('id') id: number) {
    this.logger.verbose('Starting to rollback');
    return this.todoService.rollbackSummarize(id);
  }
}
