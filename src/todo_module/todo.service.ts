import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from 'src/entities/todo.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { TodoDto } from './dto/todo.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GeminiService } from 'src/gemini_module/gemini/gemini.service';
import { TracingService } from 'src/tracing/tracing.service';

type TodoResponse = {
  message: string;
  todo?: Todo;
  todos?: Todo[];
};

// Caching the user information to check with the key is userId and the value is user
@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly geminiService: GeminiService,
    private readonly logger: TracingService,
  ) {
    this.logger.setContext(TodoService.name);
  }

  async createNote(note: TodoDto, id: string): Promise<TodoResponse> {
    try {
      this.logger.debug('Solving create note request');
      const cacheUser = await this.cacheService.get(id);
      let user;
      if (!cacheUser) {
        this.logger.debug('Do not find user in cache');
        const newTodo = new Todo();
        user = await this.userRepository.findOneBy({ id: parseInt(id) });

        if (!user) {
          const res: TodoResponse = {
            message: 'Invalid User',
          };
          return res;
        }
        await this.cacheService.set(`${id}`, user, 30000);
        newTodo.content = note.content;
        newTodo.user = user;
        console.log('new : ' + newTodo);
        await this.todoRepository.save(newTodo);

        const res: TodoResponse = {
          message: 'Create Success',
          todo: newTodo,
        };
        this.logger.log('Create Successfully');
        return res;
      } else {
        this.logger.debug('Find user in cache');
        const newTodo = new Todo();
        user = cacheUser;
        if (!user) {
          const res: TodoResponse = {
            message: 'Invalid User',
          };
          return res;
        }
        newTodo.content = note.content;
        newTodo.user = user;

        await this.todoRepository.save(newTodo);
        const res: TodoResponse = {
          message: 'Create Success',
          todo: newTodo,
        };
        this.logger.log('Create Successfully');
        return res;
      }
    } catch (e) {
      this.logger.error('Error when create note ' + e.message());
      console.log(e);
    }
  }

  async getTodoList(userId: number): Promise<TodoResponse> {
    try {
      this.logger.debug('Solving get todo list');
      const cacheUser = (await this.cacheService.get(`${userId}`)) as User;

      if (!cacheUser) {
        this.logger.debug('Do not find user in cache');
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
          return res;
        }

        const res: TodoResponse = {
          message: 'Todo list',
          todos: todos,
        };
        this.logger.debug('Get todo list successfully');
        return res;
      } else {
        this.logger.debug('Do not find user in cache');
        const todos: Todo[] = await this.todoRepository.find({
          where: { user: cacheUser, isDeleted: false },
        });
        if (todos.length === 0) {
          const res: TodoResponse = {
            message: 'Can not find any note',
            todos: todos,
          };
          this.logger.debug('Get todo list successfully without any note');
          return res;
        }

        const res: TodoResponse = {
          message: 'Todo list',
          todos: todos,
        };
        this.logger.debug(`Get todo list successfully with ${todos.length}`);
        return res;
      }
    } catch (e) {
      this.logger.error('Error when get todo list ' + e.message());
      console.log(e);
    }
  }

  async updateStatus(userId: number, noteId: number) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        const res: TodoResponse = {
          message: 'Invalid User',
        };
        return res;
      }

      const note = await this.todoRepository.findOneBy({ id: noteId });

      if (!note) {
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

      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async updateContent(note: TodoDto, id: number): Promise<TodoResponse> {
    try {
      const foundNote = await this.todoRepository.findOneBy({ id: id });
      let res: TodoResponse;
      if (!foundNote) {
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
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async softDeleteNote(id: number) {
    try {
      const note = await this.todoRepository.findOneBy({ id: id });
      let res: TodoResponse;
      if (!note) {
        res = {
          message: 'Can not find note',
        };
        return res;
      }
      note.isDeleted = true;
      await this.todoRepository.save(note);

      res = {
        message: 'Soft Delete Successfully',
      };

      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteNote(id: number): Promise<TodoResponse> {
    try {
      const note = await this.todoRepository.findOneBy({ id: id });
      let res: TodoResponse;
      if (!note) {
        res = {
          message: 'Can not find note',
        };
        return res;
      }
      await this.todoRepository.delete(note);

      res = {
        message: 'Delete Successfully',
      };
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async summarizeContent(id: number) {
    try {
      console.log('Summary content');
      const previousContent = (await this.cacheService.get(
        `note-${id}`,
      )) as Todo;
      console.log(previousContent);
      if (previousContent !== null) {
        console.log('having note in cache');
        await this.cacheService.del(`note-${id}`);
      }
      const note = await this.todoRepository.findOneBy({ id: id });
      await this.cacheService.set(`note-${id}`, note, 60000);
      note.content = await this.geminiService.summarize(note.content);
      await this.todoRepository.save(note);
      return {
        message: 'success',
        note: note,
      };
    } catch (err) {
      console.log(err);
    }
  }
  async rollbackSummarize(id: number) {
    try {
      console.log(`note-${id}`);
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
}
