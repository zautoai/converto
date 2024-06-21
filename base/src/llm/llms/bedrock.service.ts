import { Injectable, Logger } from '@nestjs/common';
import { BedrockRuntime, BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';


@Injectable()
export class BedrockService {
    private readonly logger = new Logger(BedrockService.name);
    private client: BedrockRuntimeClient;

    constructor() {
        this.client = new BedrockRuntimeClient({ region: 'us-east-1' });
        this.logger.log('BedrockRuntimeClient initialized.');
    }

    async invokeBedrockModel(prompt,) {
        const bedrock = new BedrockRuntime({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
            region: "us-east-1",
        });

        const params = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2048,
            system: "assistant",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: `${prompt}` }
                    ]
                }
            ],
            temperature: 0.5,
            top_p: 1,
            top_k: 250,
            stop_sequences: ["\\n\\nHuman:"]
        };

        const data = await bedrock.invokeModel({
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(params),
        });



        if (!data) {
            throw new Error("AWS Bedrock Claude Error");
        } else {
            const response_body = JSON.parse(new TextDecoder("utf-8").decode(data.body));
            return response_body.content[0].text;

        }
    }

}
