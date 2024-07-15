import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PromptDto } from '../prompt.dto';


type Prompt={
    prompt: string,
    exactLevel: string,
 }
@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService ){}

    @Post("")
    async replyTextPrompt(@Body() prompt: PromptDto){
        return this.geminiService.genratedTextResponse(prompt)
    }

    
}
