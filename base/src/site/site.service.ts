import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import puppeteer from 'puppeteer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SiteProcessStatus } from 'src/common/enums/enums';
import { ScrapMultipleDto } from './dto/scrap-liks.dto';

import { ChromaDBService } from 'src/chroma/chroma-dbservice/chroma-db.service';
import { WebClientService } from 'src/common/services/web-client.service';
import * as cheerio from 'cheerio';
import { MEDIA_EXTENTIONS, SYSTEM_CONST } from 'src/common/constants/system.constants';
import { JSDOM } from 'jsdom';
import { Agent } from 'src/agent/entities/agent.entity';
import { FileUtilService } from 'src/common/services/file-utility.service';
import * as fs from 'fs';
import axios from 'axios';
import robotsParser from 'robots-parser';
import { UsageService } from 'src/account/usage.service';
import { PageGreeterService } from 'src/assistants/services/page-greeters.service';
import { S3Service } from 'src/common/services/s3.service';

@Injectable()
export class SiteService {

  browsers = {};
  pages = {};

  constructor(private prisma: PrismaService,
    private chromaService: ChromaDBService,
    private webClient: WebClientService,
    private fileService: FileUtilService,
    private readonly usageService: UsageService,
    private readonly pageGreeterService: PageGreeterService,
    private readonly s3Service: S3Service) { }

  async create(createSiteDto: CreateSiteDto) {
    const site = await this.prisma.site.findFirst({ where: { agentId: createSiteDto.agentId, url: createSiteDto.url } });
    if (site) {
      return await this.update(site.id, createSiteDto);
    } else {
      return await this.prisma.site.create({ data: createSiteDto });
    }
  }

  //Train Agent on multiple site urls (selected urls)
  async trainAvatar(orgId: string, scrapMultipleDto: ScrapMultipleDto) {
    const siteUsage = await this.usageService.getSiteCount(orgId);
    const remainingSite = siteUsage.maxCount - siteUsage.count;
    if (remainingSite <= 0) {
      throw new NotAcceptableException(`Remaining site ${remainingSite}`)
    }

    const agent = await this.prisma.agent.findFirst({ where: { id: scrapMultipleDto.agentId }, include: { org: true, AgentFiles: true } });
    if (agent) {
      await this.trainZautoRAG(agent, scrapMultipleDto);
    } else {
      throw new NotFoundException(`Agent not found with id ${scrapMultipleDto.agentId}`);
    }
  }

  async trainZautoRAG(agent: Agent, scrapMultipleDto: ScrapMultipleDto) {
    for (let url of scrapMultipleDto.urls) {
      try {
        let site = await this.prisma.site.findFirst({ where: { agentId: scrapMultipleDto.agentId, url } })
        if (!site) {
          console.log("SiteService: Creating new site.")
          site = await this.create({ url, agentId: scrapMultipleDto.agentId, orgId: agent.orgId });
        }
        if (site) {
          setImmediate(async () => {
            this.processURL(site, agent);
          })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  async trainOnOpenAI(agent: Agent, scrapMultipleDto: ScrapMultipleDto) {
    try {
      const filePath = `./${SYSTEM_CONST.TRAINING_CONTENT_PATH}/agent_${agent.id}.txt`;

      //delete file if exist
      await this.fileService.deleteFile(filePath)

      for (let url of scrapMultipleDto.urls) {

        let site = await this.prisma.site.findFirst({ where: { agentId: scrapMultipleDto.agentId, url } })

        if (!site) {

          console.log("SiteService: Creating new site.")
          site = await this.create({ url, agentId: scrapMultipleDto.agentId, orgId: agent.orgId });

        }

        if (site) {

          const content = await this.getSimpleContent(site.url, agent);

          if (content) {
            site.status = SiteProcessStatus.COMPLETED;
            this.fileService.createOrAppendFile(filePath, `${JSON.stringify(content)}\n`);
          } else {
            site.status = SiteProcessStatus.FAILED;
          }
          await this.prisma.site.update({
            data: {
              status: site.status,
            }, where: { id: site.id }
          });
        }

      }
      if (fs.existsSync(filePath)) {
        await this.updateTrainingStatus(agent, filePath);
      }
    } catch (error) {
      console.log(error)
    }
  }

  async updateTrainingStatus(agent, filePath) {
    try {
      //After extracting the content from sites
      //Upload the content file to S3
      const response = await this.s3Service.uploadTextFile(filePath);

      await this.prisma.agent.update({data: {
        siteObjUrl: response.Location,
      }, where:{id: agent.id}});
      
      await this.fileService.deleteFile(filePath);
    } catch(error) {
      console.log(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const sites = await this.prisma.site.findMany({
      skip,
      take: limit,
    });
    const total = await this.prisma.site.count();
    return {
      statusCode: 200,
      data: sites,
      page: page,
      total: total,
    };
  }


  async findAllByAgent(agentId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const sites = await this.prisma.site.findMany({
      skip,
      take: limit,
      where: { agentId }
    });
    const total = await this.prisma.site.count({ where: { agentId } });
    return {
      data: sites,
      page: page,
      total: total,
    };
  }

  async findAllByOrg(orgId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const sites = await this.prisma.site.findMany({
      skip,
      take: limit,
      where: { orgId }
    });
    const total = await this.prisma.site.count({ where: { orgId } });
    return {
      data: sites,
      page: page,
      total: total,
    };
  }

  async findOne(id: string) {
    const site = await this.prisma.site.findFirst({ where: { id } });
    if (site) return site;
    else throw new NotFoundException(`Site not found with id ${id}`)
  }


  async update(id: string, updateSiteDto: UpdateSiteDto) {
    const site = await this.prisma.site.findFirst({ where: { id } });
    if (site) {
      site.status == SiteProcessStatus.IN_PROGRESS;
      return await this.prisma.site.update({ data: site, where: { id } });
    }
    else throw new NotFoundException(`Site not found with id ${id}`)
  }

  async remove(id: string) {
    const site = await this.prisma.site.findFirst({ where: { id }, include: { agent: true } });
    if (site) {
      await this.chromaService.removeDocs(site.agent.name, site.url);
      return await this.prisma.site.delete({ where: { id } });
    }
    else throw new NotFoundException(`Site not found with id ${id}`)
  }

  async processURL(site: any, agent: any, attempt: number = 0) {
    const content = await this.getSimpleContent(site.url, agent);
    if (content) {
      const processed = await this.chromaService.addDataTonamesapce(agent.name, content, site);
      site.status = processed ? SiteProcessStatus.COMPLETED : SiteProcessStatus.FAILED;
    } else {
      site.status = SiteProcessStatus.FAILED;
    }
    if (site.status == SiteProcessStatus.FAILED && attempt == 0) {
      this.processURL(site, agent, 1);
    }
    await this.prisma.site.update({ data: { status: site.status }, where: { id: site.id } });
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
          console.error(error);
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
    console.log(url)
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
      console.log(error)
    }

  }

  async getSimpleContent(url: string, agent?: any) {
    console.log('Start Time: ' + new Date())
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
      }
      console.log('===============================================')
      console.log('URL: ' + url)
      console.log('===============================================')
      console.log('End Time: ' + new Date())
      return (pageContent.pageContent && pageContent.pageContent.length > 2) ? pageContent : null;

    } catch (error) {
      console.error('Error during scraping:', error);
      if (agent) {
        let site = await this.prisma.site.findFirst({ where: { agentId: agent.id, url } })
        if (site) {
          try {
            console.log(error)
            await this.prisma.site.update({ data: { info: error }, where: { id: site.id } });
          } catch (error) {
            console.error(error)
          }
        }
      }
      return null;
    }
  }

  async parseLinks(rootURL: string) {
    const links = await this.getLinks(rootURL);
    const allContnent = Promise.all(links.map(this.getSimpleContent));
    return allContnent;
  }

  async getGreetingByUrl(agentId: string, pageUrl: string) {
    const page = await this.prisma.site.findFirst({
      where: {
        agentId: agentId,
        url: pageUrl
      }
    });
    if (!page) {
      console.log('page or greeting not found');
      return null;
    };
    return page.greeting;
  }

  async generateGreeting(orgId: string) {
    const agent = await this.prisma.agent.findFirst({ where: { orgId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return this.pageGreeterService.generateGreeting(agent.id);
  }

  async selectGeneratedGreetings(orgId: string, selectGreetingDto: any) {
    try {
      const agent = await this.prisma.agent.findFirst({ where: { orgId: orgId } });
      if (!agent) {
        throw new NotFoundException(`Agent not found for this organization`);
      }
      const createdGreetings = [];
      for (const greeting of selectGreetingDto) {
        const existingSite = await this.prisma.site.findFirst({where:{
          orgId,url:greeting.url
        }});
        if(existingSite)
        {
          const _site = await this.prisma.site.update({
            where:{
              id:existingSite.id
            },
            data:{
              greeting:greeting.message
            }
          })
          createdGreetings.push(_site);
        }
      }
      return createdGreetings;

    }
    catch (error) {
      return error;
    }
  }
}
