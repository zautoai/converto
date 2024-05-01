import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateAccessToken(payload: any){
        try {
            const plainPayload = JSON.parse(JSON.stringify(payload));
            const token = this.jwtService.sign(plainPayload);
            return token;
        } catch (error) {
            console.error('Error generating access token:', error);
            throw new Error('Failed to generate access token');
        }
    }

    async verifyAccessToken(token: string) {
        const payload = await this.jwtService.verify(token);
        return payload;
    }
}
