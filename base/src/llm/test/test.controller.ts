import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { BedrockService } from '../llms/bedrock.service';

@Controller('test')
export class TestController {
    private readonly logger = new Logger(TestController.name);

    constructor(private readonly bedrockService: BedrockService) { }


    @Post('generate')
    @HttpCode(HttpStatus.OK)
    async generateText(@Body('prompt') prompt: string): Promise<{ text: string }> {
        try {
            const text = await this.bedrockService.invokeBedrockModel(prompt,);
            return { text };
        } catch (error) {
            throw error;
        }
    }
}
