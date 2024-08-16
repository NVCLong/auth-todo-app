import { Injectable, Logger, Scope } from "@nestjs/common";



@Injectable({scope:Scope.DEFAULT})
export class GlobalLogger extends Logger{
    private numberOfRequests = 0;
    constructor(){
        super()
    }

    setContext(context:string){
        this.context = context
    }
    private getMessage(message){
        this.numberOfRequests++;
        return `[${this.numberOfRequests}]  ${message}`
    }
    debug(message: any, ...optionParams: any[]): void{
        super.debug(this.getMessage(message), ...optionParams)
    }
    verbose(message: any, ...optionalParams: any[]): void{
        super.verbose(this.getMessage(message), ...optionalParams)
    }
    
    log(message: any, ...optionalParams: any[]): void{
        super.log(this.getMessage(message), ...optionalParams)
    }
    
}