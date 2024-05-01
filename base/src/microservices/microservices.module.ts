import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ContactService } from './crm_service/contact.service';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [],
    providers: [
        {
            provide: 'CRM_SERVICE',
            inject:[ConfigService],
            useFactory: (configService: ConfigService) => {
                return ClientProxyFactory.create(
                    {
                        transport: Transport.REDIS,
                        options: {
                            host: process.env.REDIS_IP || 'localhost',
                            port: +process.env.REDIS_PORT || 6379,
                            password: process.env.REDIS_PASSWORD || '',
                        }
                    }
                )
            }
        },
        ContactService
    ],
    exports: [
        ContactService
    ],
})
export class MicroservicesModule {}
