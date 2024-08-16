import { Injectable, NestMiddleware } from "@nestjs/common";
import { GlobalLogger } from "./global-logger/global-logger.service";

@Injectable()
export class ClusterMiddleware implements NestMiddleware{
    private  logger: GlobalLogger= new GlobalLogger()
    use(req: any, res: any, next: (error?: Error | any) => void) {
        const pid = process.pid;
        this.logger.log(`PID: ${pid} - ${req.method} ${req.originalUrl}`);
        next();
    }
    
}