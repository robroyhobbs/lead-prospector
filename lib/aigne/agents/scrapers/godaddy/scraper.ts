import { createScraperAgent } from "../../factory";
import { PuppeteerMCPServer } from "../../../mcp/puppeteer/base";
import { GoDaddyScraperConfig, GoDaddyScraperResult, GoDaddyDomain } from "./types";

const GODADDY_BASE_URL = "https://www.godaddy.com/domain-value-appraisal/auctions";

async function scrapeGoDaddyPage(
  puppeteer: PuppeteerMCPServer,
  config: GoDaddyScraperConfig,
  page: number
): Promise<GoDaddyDomain[]> {
  const url = new URL(GODADDY_BASE_URL);
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
  if (config.auctionOnly) {
    url.searchParams.append("auction_only", "true");
  }
  if (config.endingSoon) {
    url.searchParams.append("ending_soon", "true");
  }

  return puppeteer.scrape(url.toString(), {
    waitForSelector: ".domain-list",
    evaluate: async (page) => {
      const domains: GoDaddyDomain[] = [];
      const domainElements = await page.$$(".domain-list .domain-item");

      for (const element of domainElements) {
        const name = await element.$eval(".domain-name", (el) => el.textContent?.trim() || "");
        const price = await element.$eval(".price", (el) => el.textContent?.trim() || "");
        const category = await element.$eval(".category", (el) => el.textContent?.trim() || "");
        const traffic = await element.$eval(".traffic", (el) => el.textContent?.trim() || "");
        
        const sellerName = await element.$eval(".seller-name", (el) => el.textContent?.trim() || "");
        const sellerEmail = await element.$eval(".seller-email", (el) => el.textContent?.trim() || "");
        
        let auctionEndDate;
        let bids;
        let reservePrice;
        try {
          auctionEndDate = await element.$eval(".auction-end-date", (el) => el.textContent?.trim() || "");
          bids = parseInt(await element.$eval(".bids", (el) => el.textContent?.trim() || "0"));
          reservePrice = await element.$eval(".reserve-price", (el) => el.textContent?.trim() || "");
        } catch {
          // Auction information might not be available
        }

        domains.push({
          name,
          price,
          category,
          traffic,
          seller: {
            name: sellerName,
            email: sellerEmail,
          },
          auctionEndDate,
          bids,
          reservePrice,
        });
      }

      return domains;
    },
  });
}

export function createGoDaddyScraper(config: GoDaddyScraperConfig = { baseUrl: GODADDY_BASE_URL }) {
  const puppeteer = new PuppeteerMCPServer();

  return createScraperAgent(
    "GoDaddyScraper",
    "Scrapes domain listings from GoDaddy auctions",
    [
      async () => {
        await puppeteer.initialize();
        try {
          const domains: GoDaddyDomain[] = [];
          const maxPages = config.maxPages || 1;

          for (let page = 1; page <= maxPages; page++) {
            const pageDomains = await scrapeGoDaddyPage(puppeteer, config, page);
            domains.push(...pageDomains);
          }

          const result: GoDaddyScraperResult = {
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