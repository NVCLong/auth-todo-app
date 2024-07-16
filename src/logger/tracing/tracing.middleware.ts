import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { TracingService } from './tracing.service';

@Injectable()
export class TracingMiddlware implements NestMiddleware {
  constructor(
    private readonly als: AsyncLocalStorage<any>,
    private logger: TracingService,
  ) {}

  use(req: any, res: any, next: (error?: Error | any) => void) {
    const store= {traceId: randomUUID()}
    this.als.run(store,()=> next())
  }
}
