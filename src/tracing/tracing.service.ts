import { Injectable, Logger, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable({ scope: Scope.TRANSIENT })
export class TracingService extends Logger {
  private requestId: string;
  constructor(private readonly als?: AsyncLocalStorage<any>) {
    super();
  }

  setContext(context: string) {
    this.context = context;
  }


  private getLogMessage = (message) => {
    const traceId= this. als?.getStore()?.traceId;
    // const traceId = this.requestId;
    if (traceId) {
      return `[${traceId}] ${message}`;
    }
    return message;
  };

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(this.getLogMessage(message), ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(this.getLogMessage(message), ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    super.debug(this.getLogMessage(message), ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.debug(this.getLogMessage(message), ...optionalParams);
  }
  log(message: any, ...optionalParams: any[]) {
    super.debug(this.getLogMessage(message), ...optionalParams);
  }
}
