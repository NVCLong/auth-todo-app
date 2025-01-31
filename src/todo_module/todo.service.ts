import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from 'src/entities/todo.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { TodoDto } from './dto/todo.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GeminiService } from 'src/gemini_module/gemini/gemini.service';
import { TracingService } from 'src/logger/tracing/tracing.service';
import { RedisService } from 'src/redis/redis.service';

type TodoResponse = {
  message: string;
  todo?: Todo;
  todos?: Todo[];
};

// Caching the user information to check with the key is userId and the value is user
@Injectable()
export class TodoService {
  private readonly lockedKey: string = 'task_lock';
  private readonly lockTimeout: number = 2000;
  private counter: number = 0;
  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject('REDIS_SERVICE') private readonly redisService: RedisService,
    private readonly geminiService: GeminiService,
    private readonly logger: TracingService,
  ) {}

  async createNote(note: TodoDto, id: string): Promise<TodoResponse> {
    try {
      this.logger.debug('Solving create note request', [TodoService.name]);
      const cacheUser = await this.cacheService.get(id);
      let user;
      if (!cacheUser) {
        this.logger.debug('Do not find user in cache', [TodoService.name]);
        user = await this.userRepository.findOneBy({ id: parseInt(id) });
      
        if (!user) {
          return { message: 'Invalid User' } as TodoResponse;
        }
      
        await this.cacheService.set(`${id}`, user, 30000);
      } else {
        this.logger.debug('Find user in cache', [TodoService.name]);
        user = cacheUser;
      }
      
      const newTodo = new Todo();
      newTodo.content = note.content;
      newTodo.user = user;
      
      await this.todoRepository.save(newTodo);
      
      const res: TodoResponse = {
        message: 'Create Success',
        todo: newTodo,
      };
      
      this.logger.log('Create Successfully', [TodoService.name]);
      return res;
    } catch (e) {
      this.logger.error('Error when create note ' + e, [TodoService.name]);
      console.log(e);
    }
  }

  async getTodoList(userId: number): Promise<TodoResponse> {
    try {
      this.logger.debug('Solving get todo list', [TodoService.name]);
      const cacheUser = (await this.cacheService.get(`${userId}`)) as User;

      if (!cacheUser) {
        this.logger.debug('Do not find user in cache', [TodoService.name]);
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
          const res: TodoResponse = {
            message: 'Invalid User',
          };
          return res;
        }
        await this.cacheService.set(`${userId}`, user, 30000);

        const todos: Todo[] = await this.todoRepository.find({
          where: { user: user, isDeleted: false },
        });

        if (todos.length === 0) {
          const res: TodoResponse = {
            message: 'Can not find any note',
            todos: todos,
          };
          this.logger.debug('Get todo list with no item', [TodoService.name]);
          return res;
        }

        const res: TodoResponse = {
          message: 'Todo list',
          todos: todos,
        };
        this.logger.debug('Get todo list successfully', [TodoService.name]);
        return res;
      } else {
        this.logger.debug('Do not find user in cache', [TodoService.name]);
        const todos: Todo[] = await this.todoRepository.find({
          where: { user: cacheUser, isDeleted: false },
        });
        if (todos.length === 0) {
          const res: TodoResponse = {
            message: 'Can not find any note',
            todos: todos,
          };
          this.logger.debug('Get todo list successfully without any note', [
            TodoService.name,
          ]);
          return res;
        }

        const res: TodoResponse = {
          message: 'Todo list',
          todos: todos,
        };
        this.logger.debug(`Get todo list successfully with ${todos.length}`, [
          TodoService.name,
        ]);
        return res;
      }
    } catch (e) {
      this.logger.error('Error when get todo list ' + e, [TodoService.name]);
    }
  }

  async updateStatus(userId: number, noteId: number) {
    try {
      this.logger.verbose('Solving update status for note with id: ' + noteId, [
        TodoService.name,
      ]);
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        this.logger.warn('Can not find user with id: ' + userId, [
          TodoService.name,
        ]);
        const res: TodoResponse = {
          message: 'Invalid User',
        };
        return res;
      }

      const note = await this.todoRepository.findOneBy({ id: noteId });
      if (!note) {
        this.logger.warn('Can not find note with id: ' + noteId, [
          TodoService.name,
        ]);
        const res: TodoResponse = {
          message: 'Can not find note',
        };
        return res;
      }
      note.isCompleted = !note.isCompleted;

      this.todoRepository.save(note);

      const res: TodoResponse = {
        message: 'Success',
        todo: note,
      };
      this.logger.log('Update status successfully', [TodoService.name]);
      return res;
    } catch (e) {
      this.logger.error('Error when update status' + e, [TodoService.name]);
    }
  }

  async updateContent(note: TodoDto, id: number): Promise<TodoResponse> {
    try {
      this.logger.verbose('Solving update content for note with id: ' + id, [
        TodoService.name,
      ]);
      const foundNote = await this.todoRepository.findOneBy({ id: id });
      let res: TodoResponse;
      if (!foundNote) {
        this.logger.warn('Can not find note with id: ' + id, [
          TodoService.name,
        ]);
        res = {
          message: 'Can not find note',
        };
        return res;
      }
      foundNote.content = note.content;

      await this.todoRepository.save(foundNote);

      res = {
        message: 'Update Successfully',
        todo: foundNote,
      };
      this.logger.log('Update content successfully', [TodoService.name]);
      return res;
    } catch (e) {
      this.logger.error('Error when update content: ' + e, [TodoService.name]);
    }
  }

  async softDeleteNote(id: number) {
    try {
      this.logger.verbose('Solving soft delete for note with id: ' + id, [
        TodoService.name,
      ]);
      const note = await this.todoRepository.findOneBy({ id: id });
      let res: TodoResponse;
      if (!note) {
        this.logger.warn('Can not find note with id: ' + id, [
          TodoService.name,
        ]);
        res = {
          message: 'Can not find note',
        };
        return res;
      }
      note.isDeleted = !note.isDeleted;
      await this.todoRepository.save(note);

      res = {
        message: 'Soft Delete Successfully',
      };
      this.logger.log('Soft delete sucessfully', [TodoService.name]);
      return res;
    } catch (e) {
      console.log(e);
    }
  }
  async undoSoftDelete(id: number) {
    try {
      this.logger.verbose('Solving undo soft delete for note with id: ' + id, [
        TodoService.name,
      ]);
      const note = await this.todoRepository.findOneBy({ id: id });
      let res: TodoResponse;
      if (!note) {
        this.logger.warn('Can not find note with id: ' + id, [
          TodoService.name,
        ]);
        res = {
          message: 'Can not find note',
        };
        return res;
      }
      note.isDeleted = !note.isDeleted;
      await this.todoRepository.save(note);
      res = {
        message: 'Soft Delete Successfully',
      };
      this.logger.log('Undo Soft delete sucessfully', [TodoService.name]);
      return res;
    } catch (e) {
      this.logger.error('Error undo: ' + e, [TodoService.name]);
    }
  }

  async deleteNote(id: number): Promise<TodoResponse> {
    try {
      this.logger.verbose('Solving delete for note with id: ' + id, [
        TodoService.name,
      ]);
      const note = await this.todoRepository.findOneBy({ id: id });
      let res: TodoResponse;
      if (!note) {
        this.logger.warn('Can not find note with id: ' + id, [
          TodoService.name,
        ]);
        res = {
          message: 'Can not find note',
        };
        return res;
      }
      await this.todoRepository.delete(note);

      res = {
        message: 'Delete Successfully',
      };
      this.logger.log('Delete note successfully', [TodoService.name]);
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async summarizeContent(id: number) {
    try {
      this.logger.verbose('Solving summarize content request', [
        TodoService.name,
      ]);
      const previousContent = (await this.cacheService.get(
        `note-${id}`,
      )) as Todo;

      if (previousContent !== null) {
        this.logger.debug('Found the previous content in cache', [
          TodoService.name,
        ]);
        await this.cacheService.del(`note-${id}`);
      }
      const note = await this.todoRepository.findOneBy({ id: id });
      await this.cacheService.set(`note-${id}`, note, 60000);
      note.content = await this.geminiService.summarize(note.content);
      await this.todoRepository.save(note);
      this.logger.log('Rolled back successfull', [TodoService.name]);
      return {
        message: 'success',
        note: note,
      };
    } catch (err) {
      this.logger.error('Error while rolling back: ' + err.message, [
        TodoService.name,
      ]);
    }
  }
  async rollbackSummarize(id: number) {
    try {
      const previousContent = (await this.cacheService.get(
        `note-${id}`,
      )) as Todo;
      if (!previousContent) {
        return {
          message: 'Time out or Do not summarize',
        };
      }
      const note = await this.todoRepository.findOneBy({ id: id });
      note.content = previousContent.content;
      await this.todoRepository.save(note);
      await this.cacheService.del(`note-${id}`);
      return {
        message: 'Roll back successfully',
        note: note,
      };
    } catch (err) {
      console.log(err);
    }
  }
  async count() {
    const key = `${this.lockedKey}-count`;
    const acquire = await this.redisService.acquireLock(key, this.lockTimeout);
    this.logger.debug('Acquire lock ' + acquire, [TodoService.name]);
    if (!acquire) {
      this.logger.debug('Request is handled by anoher instance');
      return;
    }
    try {
      this.counter++;
      this.logger.debug(this.counter);
      return this.counter;
    } catch (e) {
      this.logger.error('Error when counting: ' + e, [TodoService.name]);
    } finally {
      await this.redisService.releaseLock(key);
    }
  }
}
