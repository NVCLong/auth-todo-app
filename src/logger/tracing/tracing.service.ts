import { Injectable, Logger, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable({ scope: Scope.REQUEST })
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
    this.setContext(optionalParams[0])
    super.verbose(this.getLogMessage(message));
  }

  debug(message: any, ...optionalParams: any[]) {
    this.setContext(optionalParams[0])
    super.debug(this.getLogMessage(message));
  }

  error(message: any, ...optionalParams: any[]) {
    this.setContext(optionalParams[0])
    super.debug(this.getLogMessage(message));
  }
  warn(message: any, ...optionalParams: any[]) {
    this.setContext(optionalParams[0])
    super.debug(this.getLogMessage(message));
  }
  log(message: any, ...optionalParams: any[]) {
    this.setContext(optionalParams[0])
    super.debug(this.getLogMessage(message));
  }
}
