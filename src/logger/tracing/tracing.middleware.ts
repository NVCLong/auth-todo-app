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

  use(req: Request, res: any, next: (error?: Error | any) => void) {
    const requestId: string = req.headers['syncrequestid'] ?? randomUUID();
    const store = { traceId: `${requestId}` };
    this.als.run(store, () => next());
  }
}
