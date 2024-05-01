import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExternalToolLevel } from 'src/common/enums/enums';
import { ExternalToolService } from 'src/external-tool/external-tool.service';
import { OrgToolService } from 'src/org-tool/org-tool.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OauthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly externalToolService: ExternalToolService,
        private readonly orgToolService: OrgToolService,
        private readonly jwtService: JwtService,
    ) { }

    async getAccessToken(orgId: string, toolName: string,userId:string = null) {
        const tool = await this.externalToolService.getToolByName(toolName);
        const tokenData = await this.prisma.orgTool.findFirst({
            where: {
                orgId,
                toolId:tool.id,
                ...(tool.level == ExternalToolLevel.USERLEVEL && userId) ? { userId } : {}
            }
        });
        if (!tokenData) {
            throw new NotFoundException(`OAuth access token not exist with name ${toolName}`);
        }
        const createdAt = new Date(tokenData.createdAt);
        const expirationTime = createdAt.getTime() + (tokenData.expiresIn * 1000);
        const currentTime = Date.now();
        if (currentTime > expirationTime) {
            return await this.exchangeRefreshTokenForAccessToken(tool.id, tokenData.refreshToken, orgId);

        }
        return tokenData;
    }

    async getAuthUrl(toolName: string, customParams: any) {
        const tool = await this.externalToolService.getToolByName(toolName);
        const { authUrl, clientId, redirectUri, scope } = tool;
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: scope,
            response_type: 'code',
            access_type: "offline",
            prompt: "select_account",
            ...customParams,
        });
        const fullAuthUrl = `${authUrl}?${params}`;
        return fullAuthUrl;
    }

    async exchangeCodeForAccessToken(toolName: string, queryParams: any,userId?:string) {
        const { code, state } = queryParams;
        if (!code || !state) {
            throw new BadRequestException('Both code and state parameters are required.');
        }

        const tool = await this.externalToolService.getToolByName(toolName);
        const statePayload = await this.verifyToken(state);
        if(statePayload.provider != toolName)
        {
            throw new NotFoundException(`Provider "${toolName}" is not supported.`);
        }

        const organization = await this.prisma.organization.findUnique({ where: { id: statePayload.orgId } });
        if (!organization) {
            throw new NotFoundException('Organization not found.');
        }

        const { clientId, clientSecret, redirectUri, tokenUrl } = tool;
        try {
            const requestBody = new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code: code,
                grant_type: 'authorization_code',
                access_type: "offline",
                prompt: "select_account"
            });
            const response = await fetch(tokenUrl, {
                method: 'POST',
                body: requestBody,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });
            const responseData = await response.json();

            if (!response.ok) {
                throw new BadRequestException(responseData.error);
            }
            const existingOAuthAccess = await this.prisma.orgTool.findFirst({ 
                where: { 
                    orgId: organization.id, 
                    toolId: tool.id,
                    ...tool.level == ExternalToolLevel.USERLEVEL ? { userId } : {}
                } 
            });
            if (existingOAuthAccess) {
                const updatedOAuthAccess = await this.prisma.orgTool.update({
                    where: { 
                        id: existingOAuthAccess.id,
                        ...tool.level == ExternalToolLevel.USERLEVEL ? { userId } : {}
                    },
                    data: {
                        refreshToken: responseData.refresh_token,
                        accessToken: responseData.access_token,
                        expiresIn: responseData.expires_in,
                        ...tool.level == ExternalToolLevel.USERLEVEL ? { userId } : {}
                    }
                });
                delete updatedOAuthAccess.accessToken;
                return updatedOAuthAccess;
            }
            else {
                const data = {
                    orgId: organization.id,
                    toolId: tool.id,
                    refreshToken: responseData.refresh_token,
                    accessToken: responseData.access_token,
                    expiresIn: responseData.expires_in,
                    ...tool.level == ExternalToolLevel.USERLEVEL ? { userId } : {}
                };
                const oauthAccess = await this.prisma.orgTool.create({ data: data });
                delete oauthAccess.accessToken;
                return oauthAccess;
            }
        }
        catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async exchangeRefreshTokenForAccessToken(toolId: string, refreshToken: string, orgId: string) {
        const tool = await this.externalToolService.findOne(toolId);
        if (!refreshToken) {
            throw new NotFoundException('Refresh token missing!.');
        }
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            throw new NotFoundException('Organization not found.');
        }
        const { clientId, clientSecret, redirectUri, tokenUrl } = tool;
        try {
            const requestBody = new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            });
            const response = await fetch(tokenUrl, {
                method: 'POST',
                body: requestBody,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });            
            const responseData = await response.json();
            const existingOAuthAccess = await this.prisma.orgTool.findFirst({ where: { orgId: organization.id, toolId: tool.id } });
            if (existingOAuthAccess) {
                const updatedOAuthAccess = await this.prisma.orgTool.update({
                    where: { id: existingOAuthAccess.id },
                    data: {
                        refreshToken: responseData.refresh_token,
                        accessToken: responseData.access_token,
                        expiresIn: responseData.expires_in
                    }
                });

                return updatedOAuthAccess;
            }
            else {
                const data = {
                    orgId: organization.id,
                    toolId: tool.id,
                    refreshToken: responseData.refresh_token,
                    accessToken: responseData.access_token,
                    expiresIn: responseData.expires_in
                };
                const oauthAccess = await this.prisma.orgTool.create({ data: data });
                return oauthAccess;
            }
        }
        catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getProfile(orgId: string,toolName: string, userId: string)
    {
        const tokenData = await this.getAccessToken(orgId,toolName,userId);
        const accessToken = tokenData.accessToken;
        if(!accessToken)
        {
            throw new NotFoundException('Access Token not found.');
        }
        const tool = await this.externalToolService.getToolByName(toolName);
        try {
            const response = await fetch(tool.profileUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new BadRequestException(`Failed to fetch user profile: ${response.statusText}`);
            }

            const userProfile = await response.json();
            return userProfile;
        } catch (error) {
            throw new BadRequestException(`Failed to fetch user profile: ${error.message}`);
        }
    }

    generateToken(data: any): string {
        return this.jwtService.sign(data);
    }
    verifyToken(token: string): any {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            return null;
        }
    }

    async revokeAuth(orgId:string,toolName: string)
    {
        const tool = await this.externalToolService.getToolByName(toolName);
        const existingOAuthAccess = await this.prisma.orgTool.findFirst({where:{orgId,toolId:tool.id}});
        return await this.prisma.orgTool.update({
            where: { id:existingOAuthAccess.id},
            data: {accessToken:"",refreshToken:null}
        });
    }

}
