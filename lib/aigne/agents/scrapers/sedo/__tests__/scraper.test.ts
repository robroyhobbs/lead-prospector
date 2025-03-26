import { createSedoScraper } from "../scraper";
import { SedoScraperConfig } from "../types";

describe("SedoScraper", () => {
  it("should scrape domains from Sedo", async () => {
    const config: SedoScraperConfig = {
      baseUrl: "https://sedo.com/search/searchresult.php4",
      maxPages: 1,
      categories: ["Technology"],
      minPrice: 1000,
      maxPrice: 10000,
    };

    const scraper = createSedoScraper(config);
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
    }
  });
}); 