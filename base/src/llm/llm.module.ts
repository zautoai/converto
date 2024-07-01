import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { CommonModule } from 'src/common/common.module';
import { LlmProvider } from './llm.provider';
import { OpenAIService } from './llms/openai.service';
import { HttpModule } from '@nestjs/axios';
import { CohereAIService } from './llms/cohereai.service';
import { ClaudeAIService } from './llms/claudeai.service';
import { BedrockService } from './llms/bedrock.service';
import { MistralAIService } from './llms/mistralai.service';
import { AwsService } from './llms/aws.service';



@Module({
  exports: [LlmService],
  imports: [CommonModule, HttpModule],
  providers: [LlmService, LlmProvider, OpenAIService, MistralAIService, CohereAIService, ClaudeAIService, BedrockService, AwsService],
  controllers: []
})
export class LlmModule { }
