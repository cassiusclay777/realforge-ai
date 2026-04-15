import { createHash } from 'crypto';

export interface XmlRpcResponse {
  success: boolean;
  data?: any;
  faultCode?: number;
  faultString?: string;
}

export class XmlRpcClient {
  private endpoint: string;
  private timeout: number;

  constructor(endpoint: string, timeout: number = 30000) {
    this.endpoint = endpoint;
    this.timeout = timeout;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Make XML-RPC request
   */
  async call(methodName: string, params: any[] = []): Promise<XmlRpcResponse> {
    try {
      const xml = this.buildXmlRequest(methodName, params);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'User-Agent': 'REALFORGE-AI/1.0',
          'Accept': 'text/xml'
        },
        body: xml,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      return this.parseXmlResponse(responseText);
      
    } catch (error: any) {
      console.error(`❌ XML-RPC call failed: ${methodName}`, error);
      return {
        success: false,
        faultCode: 500,
        faultString: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Build XML-RPC request
   */
  private buildXmlRequest(methodName: string, params: any[]): string {
    const paramElements = params.map(param => this.buildParam(param)).join('');
    
    return `<?xml version="1.0"?>
<methodCall>
  <methodName>${methodName}</methodName>
  <params>
    ${paramElements}
  </params>
</methodCall>`;
  }

  /**
   * Build XML-RPC parameter
   */
  private buildParam(value: any): string {
    if (value === null || value === undefined) {
      return '<param><value><nil/></value></param>';
    }
    
    switch (typeof value) {
      case 'string':
        return `<param><value><string>${this.escapeXml(value)}</string></value></param>`;
      
      case 'number':
        if (Number.isInteger(value)) {
          return `<param><value><int>${value}</int></value></param>`;
        } else {
          return `<param><value><double>${value}</double></value></param>`;
        }
      
      case 'boolean':
        return `<param><value><boolean>${value ? 1 : 0}</boolean></value></param>`;
      
      case 'object':
        if (Array.isArray(value)) {
          const arrayElements = value.map(item => this.buildValue(item)).join('');
          return `<param><value><array><data>${arrayElements}</data></array></value></param>`;
        } else {
          const memberElements = Object.entries(value)
            .map(([key, val]) => `<member><name>${key}</name>${this.buildValue(val)}</member>`)
            .join('');
          return `<param><value><struct>${memberElements}</struct></value></param>`;
        }
      
      default:
        return `<param><value><string>${this.escapeXml(String(value))}</string></value></param>`;
    }
  }

  /**
   * Build XML-RPC value (without param wrapper)
   */
  private buildValue(value: any): string {
    if (value === null || value === undefined) {
      return '<value><nil/></value>';
    }
    
    switch (typeof value) {
      case 'string':
        return `<value><string>${this.escapeXml(value)}</string></value>`;
      
      case 'number':
        if (Number.isInteger(value)) {
          return `<value><int>${value}</int></value>`;
        } else {
          return `<value><double>${value}</double></value>`;
        }
      
      case 'boolean':
        return `<value><boolean>${value ? 1 : 0}</boolean></value>`;
      
      case 'object':
        if (Array.isArray(value)) {
          const arrayElements = value.map(item => this.buildValue(item)).join('');
          return `<value><array><data>${arrayElements}</data></array></value>`;
        } else {
          const memberElements = Object.entries(value)
            .map(([key, val]) => `<member><name>${key}</name>${this.buildValue(val)}</member>`)
            .join('');
          return `<value><struct>${memberElements}</struct></value>`;
        }
      
      default:
        return `<value><string>${this.escapeXml(String(value))}</string></value>`;
    }
  }

  /**
   * Parse XML-RPC response
   */
  private parseXmlResponse(xml: string): XmlRpcResponse {
    try {
      // Simple XML parsing for response
      // In production, use a proper XML parser like 'xml2js'
      
      // Check for fault
      if (xml.includes('<fault>')) {
        const faultMatch = xml.match(/<fault>.*?<struct>.*?<member>.*?<name>faultCode<\/name>.*?<value>.*?<int>(\d+)<\/int>.*?<\/value>.*?<\/member>.*?<member>.*?<name>faultString<\/name>.*?<value>.*?<string>(.*?)<\/string>.*?<\/value>.*?<\/member>.*?<\/struct>.*?<\/fault>/s);
        
        if (faultMatch) {
          return {
            success: false,
            faultCode: parseInt(faultMatch[1]),
            faultString: faultMatch[2]
          };
        }
      }
      
      // Extract params from response
      const paramsMatch = xml.match(/<params>.*?<param>.*?<value>(.*?)<\/value>.*?<\/param>.*?<\/params>/s);
      if (!paramsMatch) {
        throw new Error('Invalid XML-RPC response: no params found');
      }
      
      const valueXml = paramsMatch[1];
      const data = this.parseValue(valueXml);
      
      return {
        success: true,
        data
      };
      
    } catch (error: any) {
      console.error('❌ Failed to parse XML-RPC response:', error);
      return {
        success: false,
        faultCode: 500,
        faultString: `Parse error: ${error.message}`
      };
    }
  }

  /**
   * Parse XML-RPC value
   */
  private parseValue(xml: string): any {
    // Simple parsing - in production use proper XML parser
    if (xml.includes('<string>')) {
      const match = xml.match(/<string>(.*?)<\/string>/s);
      return match ? match[1] : '';
    } else if (xml.includes('<int>') || xml.includes('<i4>')) {
      const match = xml.match(/<(int|i4)>(.*?)<\/\1>/s);
      return match ? parseInt(match[2]) : 0;
    } else if (xml.includes('<double>')) {
      const match = xml.match(/<double>(.*?)<\/double>/s);
      return match ? parseFloat(match[1]) : 0;
    } else if (xml.includes('<boolean>')) {
      const match = xml.match(/<boolean>(.*?)<\/boolean>/s);
      return match ? match[1] === '1' : false;
    } else if (xml.includes('<array>')) {
      const dataMatch = xml.match(/<array>.*?<data>(.*?)<\/data>.*?<\/array>/s);
      if (!dataMatch) return [];
      
      const values = dataMatch[1].split(/<\/value>\s*<value>/);
      return values.map(value => this.parseValue(`<value>${value}</value>`));
    } else if (xml.includes('<struct>')) {
      const result: any = {};
      const memberRegex = /<member>.*?<name>(.*?)<\/name>.*?<value>(.*?)<\/value>.*?<\/member>/gs;
      let match;
      
      while ((match = memberRegex.exec(xml)) !== null) {
        const key = match[1];
        const valueXml = match[2];
        result[key] = this.parseValue(valueXml);
      }
      
      return result;
    } else if (xml.includes('<nil/>')) {
      return null;
    }
    
    return null;
  }

  /**
   * Calculate MD5 hash (for session_id updates)
   */
  static md5(text: string): string {
    return createHash('md5').update(text).digest('hex');
  }
}