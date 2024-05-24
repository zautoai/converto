import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SiteProcessStatus } from 'src/common/enums/enums';
import { ScrapMultipleDto } from './dto/scrap-liks.dto';

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import robotsParser from 'robots-parser';
import { Agent } from 'src/agent/entities/agent.entity';
import { PageGreeterService } from 'src/assistants/services/page-greeters.service';
import { ChromaDBService } from 'src/chroma/chroma-dbservice/chroma-db.service';
import { MEDIA_EXTENTIONS, SYSTEM_CONST } from 'src/common/constants/system.constants';
import { BaseService } from 'src/common/services/base.service';
import { FileUtilService } from 'src/common/services/file-utility.service';
import { S3Service } from 'src/common/services/s3.service';
import { WebClientService } from 'src/common/services/web-client.service';
import { ServiceParams } from './../common/models/service-param.model';

@Injectable()
export class SiteService extends BaseService {

  browsers = {};
  pages = {};

  constructor(
    private chromaService: ChromaDBService,
    private webClient: WebClientService,
    private fileService: FileUtilService,
    private readonly pageGreeterService: PageGreeterService,
    private readonly s3Service: S3Service) {
    super();
  }

  async create(serviceParams: ServiceParams<CreateSiteDto>) {
    const { orgId, data: createSiteDto } = serviceParams;

    const prisma = await this.getPrismaClient(orgId);

    try {
      const site = await prisma.site.findFirst({ where: { url: createSiteDto.url } });
      if (site) {
        return await this.update({ orgId, data: createSiteDto, id: site.id, });
      } else {
        return await prisma.site.create({ data: createSiteDto });
      }
    }
    catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  // Train Agent on multiple site urls (selected urls)
  async trainAvatar(serviceParams: ServiceParams<ScrapMultipleDto>) {
    const { orgId, data: scrapMultipleDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const agent = await prisma.agent.findFirst({ include: { AgentFiles: true } });
      if (agent) {
        await this.trainZautoRAG({ orgId, agent, data: scrapMultipleDto });
      } else {
        throw new NotFoundException(`Agent not found`);
      }
    }
    catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async trainZautoRAG(serviceParams: ServiceParams<ScrapMultipleDto>) {
    const { orgId, agent, data: scrapMultipleDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      for (let url of scrapMultipleDto.urls) {
        try {

          let site = await prisma.site.findFirst({ where: { url } });
          if (!site) {
            console.log("SiteService: Creating new site.");
            site = await this.create({ orgId, data: { url } });
          }
          if (site) {
            setImmediate(async () => {
              this.processURL({ orgId, data: { site, agent } });
            });
          }
        } catch (error) {
          throw error
        }
      }
    } catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async trainOnOpenAI(serviceParams: ServiceParams<ScrapMultipleDto>) {
    const { orgId, agent, data: scrapMultipleDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {

      const filePath = `./${SYSTEM_CONST.TRAINING_CONTENT_PATH}/agent_${agent.id}.txt`;

      // Delete file if exist
      await this.fileService.deleteFile(filePath);

      for (let url of scrapMultipleDto.urls) {
        let site = await prisma.site.findFirst({ where: { url } });

        if (!site) {
          console.log("SiteService: Creating new site.");
          site = await this.create({ orgId, data: { url } });
        }

        if (site) {
          const content = await this.getSimpleContent({ orgId, data: { url, agent } });

          if (content) {
            site.status = SiteProcessStatus.COMPLETED;
            this.fileService.createOrAppendFile(filePath, `${JSON.stringify(content)}\n`);
          } else {
            site.status = SiteProcessStatus.FAILED;
          }
          await prisma.site.update({
            data: {
              status: site.status,
            },
            where: { id: site.id }
          });
        }
      }
      if (fs.existsSync(filePath)) {
        await this.updateTrainingStatus({ orgId, data: { agent, filePath } });
      }
    } catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async updateTrainingStatus(serviceParams: ServiceParams<{ agent: Agent, filePath: string }>) {
    const { orgId, data: { agent, filePath } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      // After extracting the content from sites
      // Upload the content file to S3
      const response = await this.s3Service.uploadTextFile(filePath);

      await prisma.agent.update({
        data: {
          siteObjUrl: response.Location,
        },
        where: { id: agent.id }
      });

      await this.fileService.deleteFile(filePath);
    } catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async findAll(serviceParams: ServiceParams<PaginationDto>) {
    const { orgId, data: paginationDto } = serviceParams;

    const prisma = await this.getPrismaClient(orgId);
    try {
      const { page, limit } = paginationDto;
      const skip = (page - 1) * limit;
      const sites = await prisma.site.findMany({
        skip,
        take: limit,
      });
      const total = await prisma.site.count();
      return {
        statusCode: 200,
        data: sites,
        page: page,
        total: total,
      };
    }
    catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async findOne(serviceParams: ServiceParams<{ id: string }>) {
    const { orgId, data: { id } } = serviceParams;

    const prisma = await this.getPrismaClient(orgId);
    try {
      const site = await prisma.site.findFirst({ where: { id } });
      if (site) return site;
      else throw new NotFoundException(`Site not found with id ${id}`);
    } catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async update(serviceParams: ServiceParams<UpdateSiteDto>) {
    const { orgId, id, data: updateSiteDto } = serviceParams;

    const prisma = await this.getPrismaClient(orgId);
    try {
      const site = await prisma.site.findFirst({ where: { id } });
      if (site) {
        site.status = SiteProcessStatus.IN_PROGRESS;
        return await prisma.site.update({ data: updateSiteDto, where: { id } });
      } else throw new NotFoundException(`Site not found with id ${id}`);
    }
    catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async remove(serviceParams: ServiceParams<{ id: string }>) {
    const { orgId, data: { id } } = serviceParams;

    const prisma = await this.getPrismaClient(orgId);
    try {
      const site = await prisma.site.findFirst({ where: { id } });
      const agent = await prisma.agent.findFirst();
      if (site) {
        await this.chromaService.removeDocs(agent.name, site.url);
        return await prisma.site.delete({ where: { id } });
      } else throw new NotFoundException(`Site not found with id ${id}`);
    } catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async processURL(serviceParams: ServiceParams<{ site: any, agent: any, attempt?: number }>) {
    const { orgId, data: { site, agent, attempt = 0 } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const content = await this.getSimpleContent({ orgId, data: { url: site.url, agent } });
      if (content) {
        const processed = await this.chromaService.addDataTonamesapce(agent.name, content, site);
        site.status = processed ? SiteProcessStatus.COMPLETED : SiteProcessStatus.FAILED;
      } else {
        site.status = SiteProcessStatus.FAILED;
      }
      if (site.status == SiteProcessStatus.FAILED && attempt == 0) {
        this.processURL({ orgId, data: { site, agent, attempt: 1 } });
      }
      await prisma.site.update({ data: { status: site.status }, where: { id: site.id } });
    } catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async getLinks(url: string): Promise<string[]> {
    console.log("Entering Links Scraping...");

    try {
      const html = await this.webClient.get(url);
      const rootURL = new URL(url);
      const targetDomain = rootURL.hostname;
      const origin = rootURL.origin;

      const $ = cheerio.load(html);

      // Extract all the href attributes of anchor tags
      const links = $('a').map((i, el) => {
        try {
          let href = $(el).attr('href');

          if (href && !this.isAllowedByRobots(href)) {
            return null;
          }

          if (href && href.includes('#')) {
            href = href.replace(/#.*$/, '');
          }

          if (href) {
            const urlWithoutQuery = href.split('?')[0];
            // Extract the file extension from the URL
            const fileExtension = urlWithoutQuery.slice(((urlWithoutQuery.lastIndexOf(".") - 1) >>> 0) + 2);
            // Check if the file extension is in the mediaExtensions array
            if (MEDIA_EXTENTIONS.includes('.' + fileExtension.toLowerCase())) {
              return null;
            }
          }

          if (href && href.startsWith('javascript:')) {
            return null;
          }

          if (href && href.startsWith('tel:')) {
            return null;
          }

          // Skip mailto links
          if (href && href.startsWith('mailto:')) {
            return null;
          }

          // Skip data URIs
          if (href && href.startsWith('data:')) {
            return null;
          }

          if (href && href.startsWith('http') && new URL(href).hostname === targetDomain) {
            return href;
          }
          if (href && !href.startsWith('http')) {
            let baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
            href = new URL(href, baseUrl).toString();
            return href;
          }

        } catch (error) {
          throw error
        }
        return null;
      }).get();

      const linkSet = new Set(links);
      linkSet.add(url);
      return Array.from(linkSet.values()); // Filter out relative URLs
    } catch (error) {
      console.error('Error during scraping:', error);
      return [];
    }
  }

  private async isAllowedByRobots(url: string): Promise<boolean> {
    console.log(url);
    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const robotsRules = new Map<string, any>();

      try {
        const response = await axios.get(robotsUrl);
        const robots = robotsParser(robotsUrl, response.data);
        robotsRules.set(robotsUrl, robots);
      } catch {
        // If robots.txt is not found or another error occurs, assume allowed
        return true;
      }
      const robots = robotsRules.get(robotsUrl);
      return robots.isAllowed(url, 'YourUserAgentName');
    } catch (error) {
      console.log(error);
    }
  }

  async getSimpleContent(serviceParams: ServiceParams<{ url: string, agent?: any }>) {
    const { orgId, data: { url, agent } } = serviceParams;
    console.log('Start Time: ' + new Date());
    const prisma = await this.getPrismaClient(orgId);
    try {
      const html = await this.webClient.get(url);
      const $ = cheerio.load(html);
      const title = $('title').text();
      $('script, style, header, footer').remove();
      $('body script, body style, body img').remove();
      const { window } = new JSDOM($.html());
      const doc = window.document;

      // Now, you can work with the Document object
      const titleElement = doc.querySelector('title');

      let pagetext = doc.body.textContent.trim();
      if (pagetext && pagetext.length > 1) {
        pagetext = pagetext.replace(/\s+/g, ' ').replace(/\n/g, ' ')
          .replace(/\t/g, ' ').replace(/\r/g, ' ');
      }
      const pageContent = {
        pageContent: pagetext.trim(),
        title: title,
        url: url,
        published: new Date().getTime()
      };
      console.log('===============================================');
      console.log('URL: ' + url);
      console.log('===============================================');
      console.log('End Time: ' + new Date());
      return (pageContent.pageContent && pageContent.pageContent.length > 2) ? pageContent : null;

    } catch (error) {

      console.error('Error during scraping:', error);
      if (agent) {
        let site = await prisma.site.findFirst({ where: { url } });
        if (site) {
          try {
            console.log(error);
            await prisma.site.update({ data: { info: error }, where: { id: site.id } });
          } catch (error) {
            throw error
          }
        }
      }
      return null;
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async parseLinks(serviceParams: ServiceParams<{ rootURL: string }>) {
    const { orgId, data: { rootURL } } = serviceParams;
    try {
      const links = await this.getLinks(rootURL);

      // Using Promise.all to wait for all the content to be fetched
      const allContent = await Promise.all(links.map(async (link) => {
        return this.getSimpleContent({ orgId, data: { url: link } });
      }));

      return allContent;
    } catch (error) {
      console.error('Error during link parsing:', error);
      throw error;
    }
  }

  async getGreetingByUrl(serviceParams: ServiceParams<{ pageUrl: string }>) {
    const { orgId, data: { pageUrl } } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {
      const page = await prisma.site.findFirst({
        where: {
          url: pageUrl
        }
      });
      if (!page) {
        console.log('page or greeting not found');
        return null;
      }
      return page.greeting;
    }
    catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async generateGreeting(orgId: string) {
    const prisma = await this.getPrismaClient(orgId);
    try {
      const agent = await prisma.agent.findFirst();
      if (!agent) {
        throw new NotFoundException('Agent not found');
      }
      return this.pageGreeterService.generateGreeting(agent.id);
    }
    catch (error) {
      throw error
    }
    finally {
      await this.closeConnection(orgId)
    }
  }

  async selectGeneratedGreetings(serviceParams: ServiceParams<any>) {
    const { orgId, data: selectGreetingDto } = serviceParams;
    const prisma = await this.getPrismaClient(orgId);
    try {

      const agent = await prisma.agent.findFirst();
      if (!agent) {
        throw new NotFoundException(`Agent not found for this organization`);
      }
      const createdGreetings = [];
      for (const greeting of selectGreetingDto) {
        const existingSite = await prisma.site.findFirst({
          where: {
            url: greeting.url
          }
        });
        if (existingSite) {
          const _site = await prisma.site.update({
            where: {
              id: existingSite.id
            },
            data: {
              greeting: greeting.message
            }
          });
          createdGreetings.push(_site);
        }
      }
      return createdGreetings;
    } catch (error) {
      throw error;
    } finally {
      await this.closeConnection(orgId)
    }
  }
}
