import { createScraperAgent } from "../../factory";
import { PuppeteerMCPServer } from "../../../mcp/puppeteer/base";
import { SedoScraperConfig, SedoScraperResult, SedoDomain } from "./types";

const SEDO_BASE_URL = "https://sedo.com/search/searchresult.php4";

async function scrapeSedoPage(
  puppeteer: PuppeteerMCPServer,
  config: SedoScraperConfig,
  page: number
): Promise<SedoDomain[]> {
  const url = new URL(SEDO_BASE_URL);
  url.searchParams.append("page", page.toString());
  if (config.categories) {
    url.searchParams.append("categories", config.categories.join(","));
  }
  if (config.minPrice) {
    url.searchParams.append("min_price", config.minPrice.toString());
  }
  if (config.maxPrice) {
    url.searchParams.append("max_price", config.maxPrice.toString());
  }

  return puppeteer.scrape(url.toString(), {
    waitForSelector: ".domain-list",
    evaluate: async (page) => {
      const domains: SedoDomain[] = [];
      const domainElements = await page.$$(".domain-list .domain-item");

      for (const element of domainElements) {
        const name = await element.$eval(".domain-name", (el) => el.textContent?.trim() || "");
        const price = await element.$eval(".price", (el) => el.textContent?.trim() || "");
        const category = await element.$eval(".category", (el) => el.textContent?.trim() || "");
        const traffic = await element.$eval(".traffic", (el) => el.textContent?.trim() || "");
        
        const sellerName = await element.$eval(".seller-name", (el) => el.textContent?.trim() || "");
        
        domains.push({
          name,
          price,
          category,
          traffic,
          seller: {
            name: sellerName,
          },
        });
      }

      return domains;
    },
  });
}

export function createSedoScraper(config: SedoScraperConfig = { baseUrl: SEDO_BASE_URL }) {
  const puppeteer = new PuppeteerMCPServer();

  return createScraperAgent(
    "SedoScraper",
    "Scrapes domain listings from Sedo marketplace",
    [
      async () => {
        await puppeteer.initialize();
        try {
          const domains: SedoDomain[] = [];
          const maxPages = config.maxPages || 1;

          for (let page = 1; page <= maxPages; page++) {
            const pageDomains = await scrapeSedoPage(puppeteer, config, page);
            domains.push(...pageDomains);
          }

          const result: SedoScraperResult = {
            domains,
            totalFound: domains.length,
            timestamp: new Date().toISOString(),
          };

          return result;
        } finally {
          await puppeteer.cleanup();
        }
      },
    ]
  );
} 