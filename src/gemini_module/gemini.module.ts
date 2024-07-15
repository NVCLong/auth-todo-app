import { Module } from '@nestjs/common';
import { GeminiService } from './gemini/gemini.service';
import { GeminiController } from './gemini/gemini.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [], 
  providers: [GeminiService],
  controllers: [GeminiController],
  exports:[GeminiService]
})
export class GeminiModule {}
