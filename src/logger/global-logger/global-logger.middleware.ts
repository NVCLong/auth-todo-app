import { Injectable, NestMiddleware } from "@nestjs/common";
import { GlobalLogger } from "./global-logger.service";



@Injectable()
export class GlobalLoggerMiddleware implements NestMiddleware{
    constructor(private globalLogger: GlobalLogger){
        this.globalLogger.setContext("Application Request")
    }
    use(req: Request, res: any, next: (error?: Error | any) => void) {
        this.globalLogger.verbose("Request come from "+ req.method)
        next();
    }
    
}