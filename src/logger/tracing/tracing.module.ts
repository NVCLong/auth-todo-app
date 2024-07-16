import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { TracingService } from './tracing.service';

@Global()
@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
    TracingService,
  ],
  exports: [AsyncLocalStorage, TracingService],
})
export class TracingModule {}
