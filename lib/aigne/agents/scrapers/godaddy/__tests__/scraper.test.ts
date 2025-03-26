import { createGoDaddyScraper } from "../scraper";
import { GoDaddyScraperConfig } from "../types";

describe("GoDaddyScraper", () => {
  it("should scrape domains from GoDaddy auctions", async () => {
    const config: GoDaddyScraperConfig = {
      baseUrl: "https://www.godaddy.com/domain-value-appraisal/auctions",
      maxPages: 1,
      categories: ["Technology"],
      minPrice: 100,
      maxPrice: 1000,
      auctionOnly: true,
      endingSoon: false,
    };

    const scraper = createGoDaddyScraper(config);
    const result = await scraper.execute();

    expect(result).toBeDefined();
    expect(result.domains).toBeInstanceOf(Array);
    expect(result.totalFound).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeDefined();

    if (result.domains.length > 0) {
      const domain = result.domains[0];
      expect(domain.name).toBeDefined();
      expect(domain.price).toBeDefined();
      expect(domain.category).toBeDefined();
      expect(domain.traffic).toBeDefined();
      expect(domain.seller.name).toBeDefined();
      expect(domain.auctionEndDate).toBeDefined();
      expect(domain.bids).toBeDefined();
      expect(domain.reservePrice).toBeDefined();
    }
  });
}); 