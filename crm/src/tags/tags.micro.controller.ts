import { Controller } from "@nestjs/common";
import { TagsService } from "./tags.service";
import { MessagePattern } from "@nestjs/microservices";


@Controller('tags')
export class TagsMicroController {

    constructor(
        private readonly tagsService: TagsService
    ) {}

    @MessagePattern({cmd:"CREATE_TAG"})
    async createTag(data: any) {
        try
        {
            return this.tagsService.createTag(data.orgId,data.tag);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"GET_TAGS"})
    async getTags(data: any) {
        try
        {
            return this.tagsService.getAllTags(data.orgId,data.filterDto);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"GET_TAG"})
    async getTag(data: any) {
        try
        {
            return this.tagsService.getTagById(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"UPDATE_TAG"})
    async updateTag(data: any) {
        try
        {
            return this.tagsService.updateTag(data.orgId, data.id, data.tag);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

    @MessagePattern({cmd:"DELETE_TAG"})
    async deleteTag(data: any) {
        try
        {
            return this.tagsService.deleteTag(data.orgId, data.id);
        }
        catch (error)
        {
            return error.response || error;
        }
    }

}