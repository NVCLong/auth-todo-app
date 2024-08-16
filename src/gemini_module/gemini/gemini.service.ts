import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { PromptDto } from '../prompt.dto';
import { ConfigService } from '@nestjs/config';
import { TracingService } from '../../logger/tracing/tracing.service';

type PromptResponse = {
  question: string;
  response: string;
};
@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private genModel: any;
  constructor(private configService: ConfigService, private readonly logger: TracingService) {
    this.logger.setContext(GeminiService.name)
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY'),
    );
    this.genModel = this.genAI.getGenerativeModel({
      model: this.configService.get<string>('GEMINI_MODEL'),
    });
  }
  async generatedTextResponse(prompt: PromptDto): Promise<PromptResponse> {
    this.logger.verbose("Starting solve the prompt",[GeminiService.name])
    this.logger.debug("API Key "+ this.genAI.apiKey,[GeminiService.name])
    this.logger.debug("AI Model "+ this.genModel.model, [GeminiService.name]);
    const finalPrompt =
      prompt.prompt + 'with' + prompt.exactLevel + 'exact level';
    const result = await this.genModel.generateContent(finalPrompt);
    const response = result.response;
    const text = response.text();
    const finalRes: PromptResponse = {
      question: prompt.prompt,
      response: text,
    };
    this.logger.log("Finished solve the prompt "+ prompt.prompt, [GeminiService.name])
    return finalRes;
  }

  async summarize(content: string): Promise<string> {
    this.logger.verbose("Solving summarize content request", [GeminiService.name]);
    if (content !== null) {
      const prompt = 'summarize ' + content + ' with in 100 words ';
      const result = await this.genModel.generateContent(prompt);
      const response = result.response;
      console.log(response.text());
      this.logger.log("Finished solve the prompt ", [GeminiService.name]);
      return response.text();
    } else{
      this.logger.warn("Content is null and return basic value", [GeminiService.name]);
      return content;
    }
  }
}
