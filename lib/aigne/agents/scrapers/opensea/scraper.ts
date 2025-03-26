import { createScraperAgent } from "../../factory";
import { PuppeteerMCPServer } from "../../../mcp/puppeteer/base";
import { OpenSeaScraperConfig, OpenSeaScraperResult, OpenSeaDomain } from "./types";

const OPENSEA_BASE_URL = "https://opensea.io/assets";

async function scrapeOpenSeaPage(
  puppeteer: PuppeteerMCPServer,
  config: OpenSeaScraperConfig,
  page: number
): Promise<OpenSeaDomain[]> {
  const url = new URL(OPENSEA_BASE_URL);
  url.searchParams.append("page", page.toString());
  if (config.chains) {
    url.searchParams.append("chains", config.chains.join(","));
  }
  if (config.minPrice) {
    url.searchParams.append("min_price", config.minPrice.toString());
  }
  if (config.maxPrice) {
    url.searchParams.append("max_price", config.maxPrice.toString());
  }
  if (config.traits) {
    url.searchParams.append("traits", JSON.stringify(config.traits));
  }

  return puppeteer.scrape(url.toString(), {
    waitForSelector: ".assets-grid",
    evaluate: async (page) => {
      const domains: OpenSeaDomain[] = [];
      const assetElements = await page.$$(".assets-grid .asset-card");

      for (const element of assetElements) {
        const name = await element.$eval(".asset-name", (el) => el.textContent?.trim() || "");
        const price = await element.$eval(".asset-price", (el) => el.textContent?.trim() || "");
        const chain = await element.$eval(".chain-badge", (el) => el.textContent?.trim() || "");
        
        const sellerAddress = await element.$eval(".seller-address", (el) => el.textContent?.trim() || "");
        const sellerUsername = await element.$eval(".seller-username", (el) => el.textContent?.trim() || "");
        
        const traits: { name: string; value: string }[] = [];
        const traitElements = await element.$$(".trait-item");
        for (const traitElement of traitElements) {
          const traitName = await traitElement.$eval(".trait-name", (el) => el.textContent?.trim() || "");
          const traitValue = await traitElement.$eval(".trait-value", (el) => el.textContent?.trim() || "");
          traits.push({ name: traitName, value: traitValue });
        }

        let lastSale;
        try {
          const lastSalePrice = await element.$eval(".last-sale-price", (el) => el.textContent?.trim() || "");
          const lastSaleDate = await element.$eval(".last-sale-date", (el) => el.textContent?.trim() || "");
          lastSale = { price: lastSalePrice, date: lastSaleDate };
        } catch {
          // Last sale information might not be available
        }

        domains.push({
          name,
          price,
          chain,
          seller: {
            address: sellerAddress,
            username: sellerUsername,
          },
          traits,
          lastSale,
        });
      }

      return domains;
    },
  });
}

export function createOpenSeaScraper(config: OpenSeaScraperConfig = { baseUrl: OPENSEA_BASE_URL }) {
  const puppeteer = new PuppeteerMCPServer();

  return createScraperAgent(
    "OpenSeaScraper",
    "Scrapes domain listings from OpenSea marketplace",
    [
      async () => {
        await puppeteer.initialize();
        try {
          const domains: OpenSeaDomain[] = [];
          const maxPages = config.maxPages || 1;

          for (let page = 1; page <= maxPages; page++) {
            const pageDomains = await scrapeOpenSeaPage(puppeteer, config, page);
            domains.push(...pageDomains);
          }

          const result: OpenSeaScraperResult = {
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