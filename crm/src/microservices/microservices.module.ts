import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { OrganizationService } from './base-services/organization.service';
import { AuthService } from './base-services/auth.service';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [],
    providers: [
        {
            provide: 'BASE_SERVICE',
            useFactory: () => {
                return ClientProxyFactory.create(
                    { 
                        transport: Transport.REDIS,
                        options: {
                            host: process.env.REDIS_IP || 'localhost',
                            port: +process.env.REDIS_PORT || 6379,
                            password: process.env.REDIS_PASSWORD || '',
                        }, 
                    }
                ) 
            }
        },  
        OrganizationService,
        AuthService,
    ],
    exports: [
        OrganizationService,
        AuthService
    ]

})
export class MicroservicesModule { }
