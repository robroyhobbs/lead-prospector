import puppeteer from "puppeteer";
import { MCPServer, ScrapingOptions } from "../../types";

export class PuppeteerMCPServer implements MCPServer {
  private browser: puppeteer.Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrape(url: string, options: ScrapingOptions = {}): Promise<any> {
    if (!this.browser) {
      throw new Error("Browser not initialized");
    }

    const page = await this.browser.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle0" });
      
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: options.timeout || 30000 });
      }

      if (options.evaluate) {
        return await options.evaluate(page);
      }

      return await page.content();
    } finally {
      await page.close();
    }
  }
} 