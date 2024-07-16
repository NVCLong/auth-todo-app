import { Module } from "@nestjs/common";
import { GlobalLogger } from "./global-logger.service";
import { GlobalLoggerMiddleware } from "./global-logger.middleware";


@Module({
    imports:[],
    providers:[GlobalLogger],
    controllers:[],
    exports:[GlobalLogger]
})
export class GlobalLoggerModule {}