import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import robotsParser from 'robots-parser';
import { MEDIA_EXTENTIONS } from '../constants/system.constants';
import { WebClientService } from './web-client.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { JSDOM } from 'jsdom';


@Injectable()
export class WebScraperService {

  private robotsRules = new Map<string, any>();

  constructor(private readonly webClient: WebClientService,
    private readonly prisma: PrismaService) {}

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private shouldScrape(url: string, baseUrl: string): boolean {
    // Add additional checks as necessary, for example:
    // Check if the URL is not a JavaScript action
    if (url.startsWith('javascript:')) {
      return false;
    }
   
    if (url && url.includes('#')) {
      url = url.replace(/#.*$/, '');
    }
    if (url) {
      const urlWithoutQuery = url.split('?')[0];
      // Extract the file extension from the URL
      const fileExtension = urlWithoutQuery.slice(((urlWithoutQuery.lastIndexOf(".") - 1) >>> 0) + 2);
      // Check if the file extension is in the mediaExtensions array
      if (MEDIA_EXTENTIONS.includes('.' + fileExtension.toLowerCase())) {
        return null;
      }
    }

    // Avoid scraping the same page again
    if (url === baseUrl) {
      return false;
    }

    // Further filtering logic can be added here
    // ...

    return true;
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

          if(href && !this.isAllowedByRobots(href)) {
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
          if(href && !href.startsWith('http')) {
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
    } catch(error)  {
      console.log(error)
    }
    
  }

  async getSimpleContent(url: string, agent?: any){
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
        if(pagetext && pagetext.length > 1) {
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
      console.log('URL: '+url)
      console.log('===============================================')
      console.log('End Time: ' + new Date())
      return (pageContent.pageContent && pageContent.pageContent.length > 2) ? pageContent : null;
      
    } catch (error) {
      console.error('Error during scraping:', error);
      if(agent) {
        let site = await this.prisma.site.findFirst({where: {agentId: agent.id, url}})
        if(site) {
          try {
            console.log(error)
            await this.prisma.site.update({data: {info: error}, where: {id: site.id}});
          } catch(error) {
            console.error(error)
          }
        }
      }
      return null;
    }
  }
}
