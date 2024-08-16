import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PromptDto } from '../prompt.dto';
import { TracingService } from '../../logger/tracing/tracing.service';

@Controller('gemini')
export class GeminiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly logger: TracingService,
  ) {
  }
  @Post('')
  async replyTextPrompt(@Body() prompt: PromptDto) {
    this.logger.verbose('Starting sending prompt',[GeminiController.name]);
    return this.geminiService.generatedTextResponse(prompt);
  }
}
