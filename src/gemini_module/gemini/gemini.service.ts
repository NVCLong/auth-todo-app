import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { PromptDto } from '../prompt.dto';
import { ConfigService } from '@nestjs/config';
import { TracingService } from '../../tracing/tracing.service';

type PromptResponse = {
  question: string;
  response: string;
};
@Injectable()
export class GeminiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private genModel: any;
  constructor(private configService: ConfigService, private readonly logger: TracingService) {
    this.logger.setContext(GeminiService.name)
  }
  async onModuleInit() {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY'),
    );
    this.genModel = await this.genAI.getGenerativeModel({
      model: this.configService.get<string>('GEMINI_MODEL'),
    });
  }

  async genratedTextResponse(prompt: PromptDto): Promise<PromptResponse> {
    this.logger.debug("Starting solve the prompt")
    const finalPrompt =
      prompt.prompt + 'with' + prompt.exactLevel + 'exact level';
    const result = await this.genModel.generateContent(finalPrompt);
    const resposne = result.response;
    const text = resposne.text();
    const finalRes: PromptResponse = {
      question: prompt.prompt,
      response: text,
    };
    this.logger.log("Finished solve the prompt ")
    return finalRes;
  }

  async summarize(content: string): Promise<string> {
    if (content !== null) {
      const prompt = 'summarize ' + content + ' with in 100 words ';
      const result = await this.genModel.generateContent(prompt);
      const response = result.response;
      console.log(response.text());
      return response.text();
    } else return content;
  }
}
