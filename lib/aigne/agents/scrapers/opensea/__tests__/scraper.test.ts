import { createOpenSeaScraper } from "../scraper";
import { OpenSeaScraperConfig } from "../types";

describe("OpenSeaScraper", () => {
  it("should scrape domains from OpenSea", async () => {
    const config: OpenSeaScraperConfig = {
      baseUrl: "https://opensea.io/assets",
      maxPages: 1,
      chains: ["ethereum"],
      minPrice: 0.1,
      maxPrice: 10,
      traits: [
        { name: "Type", value: "Domain" }
      ],
    };

    const scraper = createOpenSeaScraper(config);
    const result = await scraper.execute();

    expect(result).toBeDefined();
    expect(result.domains).toBeInstanceOf(Array);
    expect(result.totalFound).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeDefined();

    if (result.domains.length > 0) {
      const domain = result.domains[0];
      expect(domain.name).toBeDefined();
      expect(domain.price).toBeDefined();
      expect(domain.chain).toBeDefined();
      expect(domain.seller.address).toBeDefined();
      expect(domain.traits).toBeInstanceOf(Array);
    }
  });
}); 