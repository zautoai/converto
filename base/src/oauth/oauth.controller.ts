import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OauthService } from './oauth.service';
import { ZautoRequest } from 'src/common/models/request.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { StateTokenDto } from './dto/state-token.dto';


@ApiTags("OAuth")
@Controller('api/oauth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OauthController {

    constructor(
        private readonly oauthService: OauthService
    ) { }

    @Post('state')
    async parseStateJWT(@Body() stateToken:StateTokenDto)
    {
        return await this.oauthService.verifyToken(stateToken.token);
    }

    @Get(':provider')
    @ApiQuery({name:'orgId'})
    async auth(@Param('provider') provider: string,@Query() queryParams: any) {
        const { orgId } = queryParams;
        if (!orgId) {
            throw new BadRequestException('Organization ID is requestd.');
        }
        queryParams = {...queryParams, provider};
        const state = await this.oauthService.generateToken(queryParams);
        const customParams = { state: state };
        return {redirect_url : await this.oauthService.getAuthUrl(provider, customParams)};
    }

    @Get(':provider/callback')
    async authRedirect(@Param('provider') provider: string,@Query() queryParams: any,@Req() request: ZautoRequest) {
        if(request && request.user)
        {
            const userId = request.user.id;
            try {
                return await this.oauthService.exchangeCodeForAccessToken(provider, queryParams,userId);
            } catch (error) {
                throw new BadRequestException(error);
            }
        }
        else
        {

        }

    }

    @Get(':provider/revoke')
    async revokeAuth(@Param('provider') provider: string,@Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            return await this.oauthService.revokeAuth(orgId,provider);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

    @Get(':provider/profile')
    async getProfile(@Param('provider') provider: string,@Req() request: ZautoRequest)
    {
        if(request.user && request.orgId)
        {
            const orgId = request.orgId;
            const userId = request.user.id;
            return await this.oauthService.getProfile(orgId,provider,userId);
        }
        else
        {
            throw new UnauthorizedException("Unauthorised access.")
        }
    }

}
