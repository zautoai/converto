import { Injectable } from "@nestjs/common";
import { Verification } from "src/registration/entities/verification.entity";
import * as SendGrid from '@sendgrid/mail'
import { VerificationType } from "../enums/enums";
import { WELCOME_MAIL_TEMPLATE } from "../templates/welcome-mail.template";
import { PASSWORD_RESET_TEMPLATE } from "../templates/password-reset.template";
import { SignupMailDto } from "src/registration/dto/signup-mail.dto";
import { SIGNUP_MAIL_TEMPLATE } from "../templates/signupmail.template";
import axios from 'axios';



@Injectable()
export class EmailService {

    private readonly domainBlockList: string[] = [
        // 'gmail.com',
        'example.com',
        'email.com',
        'yahoo.com',
        'hotmail.com',
        'aol.com',
        'outlook.com',
        'icloud.com',
        'live.com',
        'msn.com',
        'me.com',
        'ymail.com',
        'inbox.com',
        'zoho.com',
        "guerrillamail.com",
        "sharklasers.com",
        "guerrillamailblock.com",
        "grr.la",
        "pokemail.net",
        "spam4.me",
        "tempmail.net",
        "tempmail.com",
        "tempemail.net",
        "tmpmail.net",
        "tmp.com",
        "throwawaymail.com",
        "yopmail.com",
        "yogamaven.com",
        "10minutemail.com",
        "mailinator.com",
        "maildrop.cc",
        "mailnesia.com",
        "mailtemporaire.fr",
        "jetable.fr",
        "mailmoat.com",
        "clip.lat",
    ];

    constructor() {
    }

    getVerificationLink(verification: Verification) {
        if (verification.type == VerificationType.VERIFYEMAIL) {
            const link = `${process.env.HOST_URL}/auth/login?token=${verification.token}`
            return link;
        } else {
            const link = `${process.env.HOST_URL}/auth/reset-password?token=${verification.token}`
            return link;
        }

    }

    async sendVerifucationMail(verification: Verification) {
        const verificationLink = this.getVerificationLink(verification);
        let template = (verification.type == VerificationType.VERIFYEMAIL) ? WELCOME_MAIL_TEMPLATE : PASSWORD_RESET_TEMPLATE;
        template = template.replaceAll('{{link}}', verificationLink).replace('{{name}}', verification.user.name);
        SendGrid.setApiKey(process.env.SENDGRID_KEY);
        const message: SendGrid.MailDataRequired = {
            to: verification.user.email,
            from: process.env.CONVERTO_EMAIL,
            subject: (verification.type == VerificationType.VERIFYEMAIL) ? 'Welcome to ZautoAI' : 'Reset Account Password',
            html: template
        };
        // console.log(template)
        try {
            const result = await SendGrid.send(message);
            console.log(result)
        } catch (error) {
            console.log(error)
        }

    }

    async sendSignupAleartMail(signupMailDto: SignupMailDto) {
        SendGrid.setApiKey(process.env.SENDGRID_KEY);
        let template = SIGNUP_MAIL_TEMPLATE;
        template = template
            .replaceAll('{{username}}', signupMailDto.user.name)
            .replaceAll('{{useremail}}', signupMailDto.user.email)
            .replaceAll('{{createdAt}}', signupMailDto.user.createdAt.toDateString())
        const message: SendGrid.MailDataRequired = {
            to: process.env.SIGNUP_ALERT_MAIL,
            from: process.env.CONVERTO_EMAIL,
            subject: 'Signup Aleart',
            html: template
        };
        // console.log(template)
        const result = await SendGrid.send(message);
    }

    async validateEmailDomain(email: string): Promise<boolean> {
        // check if email is valid
        if (!email.includes('@')) return false;

        const domain = email.split('@')[1];
        // check blocked domain
        if (this.domainBlockList.includes(domain)) return false;

        try {
            // ping check
            // const pingResponse = await axios.head(`https://${domain}`);
            // const isPingValid = pingResponse.status >= 200 && pingResponse.status < 300;
            // if (!isPingValid) return false;
            // API check
            // const isDisposable = await this.validateEmailWithAPI(email);
            // return isDisposable;
            return true;
        } catch (error) {
            return false;
        }
    }


    async validateEmailWithAPI(email: string): Promise<boolean> {
        try {
            const url = `https://api.quickemailverification.com/v1/verify?email=${email}&apikey=${process.env.QUICK_MAIL_VALIDATOR_API}`;
            const response = await axios.get(url);
            const isValid = response.data.result === 'valid';
            const isDisposable = response.data.disposable === 'true';
            return isValid && !isDisposable;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}