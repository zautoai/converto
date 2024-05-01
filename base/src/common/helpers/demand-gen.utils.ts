import * as crypto from 'crypto';

export function parseURLParams(url: string): Record<string, string> {
    try {
      const params: Record<string, string> = {};
      const parser = new URL(url);
      const query = parser.search.substring(1);
      const vars = query.split('&');
      for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (pair.length === 2) {
          params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        } else {
          console.error("Malformed query parameter:", vars[i]);
        }
      }
      return params;
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
      return {};
    }
}

export function generateUniqueId(params: Record<string, any>): string | null {
    try {
      const keys = Object.keys(params).sort();
      const paramString = keys.map(key => params[key]).join('');
      const hash = crypto.createHash('sha256').update(paramString).digest('hex');
      return hash;
    } catch (error) {
      console.error("Error generating unique ID:", error);
      return null;
    }
}