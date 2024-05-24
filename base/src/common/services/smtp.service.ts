import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingService } from './hashing.service';

export class MailContent {

    public to: string[];
    public subject: string;
    public text: string;

    constructor(to: string[], subject: string, text: string) {
        this.to = to;
        this.subject = subject;
        this.text = text;
    }
}


@Injectable()
export class SmtpService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly hashingService: HashingService
    ) { }

    private isPooled = true;
    private tranporterPool: { [key: string]: nodemailer.Transporter } = {};


    async getTransporter(config, pooled: boolean = false) {
        if (!config) {
            return null;
        }
        const smtpConfig = {
            pooled: pooled,
            host: config.host,
            port: config.port,
            secure: false,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        }
        if (config.port === 465) {
            smtpConfig.secure = true; // SMTP with SSL
        } else {
            smtpConfig.secure = false; // SMTP with STARTTLS
        }
        let transporter = this.getTransporterFromPool(config.user);
        if (!transporter) {
            transporter = nodemailer.createTransport(smtpConfig);
            this.addTransporterPool(transporter);
        }
        return transporter;
    }

    async verifyConnection(config) {
        try {
            const transporter = await this.getTransporter(config, this.isPooled);
            await transporter.verify();
            return true;
        } catch (error) {
            return false;
        }
    }

    async sendMail(orgId: string, mailContent: MailContent) {
        const config = await this.prisma.orgSMTPConfig.findFirst({ where: {isActive: true } });
        if (!config) {
            return null;
        }
        config.pass = this.hashingService.decrypt(config.pass);
        const updatedMailContent = {
            ...mailContent,
            from: {
                name: config.name,
                address: config.user,
            },
        };

        try {
            const transporter = await this.getTransporter(config, this.isPooled);
            const info = await transporter.sendMail(updatedMailContent);
            return info;
        }
        catch (error) {
            return error;
        }
    }

    getTransporterFromPool(user: string) {
        return this.tranporterPool[user];
    }

    addTransporterPool(transporter: nodemailer.Transporter): nodemailer.Transporter | void {
        if (transporter) {
            const key = transporter.options.auth.user;

            const maxConnections = +process.env.MAX_SMTP_CONNECTIONS || 10;
            if (Object.keys(this.tranporterPool).length < maxConnections) {
                if (!this.tranporterPool[key]) {
                    this.tranporterPool[key] = transporter;
                } else {
                    return this.tranporterPool[key];
                }
            }
            else {
                const oldestKey = Object.keys(this.tranporterPool)[0];
                this.removeTransporterFromPool(oldestKey);
                this.tranporterPool[key] = transporter;
            }
        }
    }


    removeTransporterFromPool(user: string) {
        if (this.tranporterPool[user]) {
            try {
                if (typeof this.tranporterPool[user].close === 'function') {
                    this.tranporterPool[user].close();
                }
            } catch (error) {
                console.error(`Error closing transporter for user ${user}: ${error.message}`);
            } finally {
                delete this.tranporterPool[user];
            }
        }
    }
}


