import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ContactService } from './crm_service/contact.service';
import { SchemaManagerService } from './crm_service/schema-manager.service';
import { FormBuilderMicroService } from './crm_service/form-builder.service';

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
                            host:process.env.REDIS_IP,
                            port:+process.env.REDIS_PORT,
                            password:process.env.REDIS_PASSWORD
                        }
                    }
                )
            }
        },
        ContactService,
        SchemaManagerService,
        FormBuilderMicroService
    ],
    exports: [
        ContactService,
        SchemaManagerService,
        FormBuilderMicroService
    ],
})
export class MicroservicesModule {}
