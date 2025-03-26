import { createLeadProcessor } from "../lead-processor";
import { LeadProcessorConfig, UnifiedLead } from "../types";
import { SedoDomain } from "../../scrapers/sedo/types";
import { OpenSeaDomain } from "../../scrapers/opensea/types";
import { GoDaddyDomain } from "../../scrapers/godaddy/types";

describe("LeadProcessor", () => {
  it("should process and normalize leads from different sources", async () => {
    const config: LeadProcessorConfig = {
      minPortfolioSize: 10,
      minPrice: 100,
      maxPrice: 1000,
      categories: ["Technology", "Business"],
      excludeCategories: ["Adult"],
    };

    const testData = {
      sedo: [
        {
          name: "test.com",
          price: "$500",
          category: "Technology",
          traffic: "1000",
          seller: {
            name: "John Doe",
            email: "john@example.com",
            portfolioSize: 15,
          },
        } as SedoDomain,
      ],
      opensea: [
        {
          name: "test.eth",
          price: "0.5 ETH",
          chain: "ethereum",
          seller: {
            address: "0x123...",
            username: "crypto_seller",
            portfolioSize: 20,
          },
          traits: [
            { name: "Category", value: "Technology" },
          ],
        } as OpenSeaDomain,
      ],
      godaddy: [
        {
          name: "business.com",
          price: "$750",
          category: "Business",
          traffic: "2000",
          seller: {
            name: "Jane Smith",
            email: "jane@example.com",
            portfolioSize: 25,
          },
          auctionEndDate: "2024-04-01",
          bids: 5,
          reservePrice: "$700",
        } as GoDaddyDomain,
      ],
    };

    const processor = createLeadProcessor(config);
    const result = await processor.execute(testData);

    expect(result).toBeDefined();
    expect(result.leads).toBeInstanceOf(Array);
    expect(result.totalProcessed).toBe(3);
    expect(result.totalFiltered).toBe(0);
    expect(result.timestamp).toBeDefined();

    // Verify normalized leads
    const leads = result.leads;
    expect(leads.length).toBe(3);

    // Verify Sedo lead
    const sedoLead = leads.find((l: UnifiedLead) => l.source === "sedo");
    expect(sedoLead).toBeDefined();
    expect(sedoLead?.name).toBe("test.com");
    expect(sedoLead?.price).toBe("$500");
    expect(sedoLead?.category).toBe("Technology");

    // Verify OpenSea lead
    const openseaLead = leads.find((l: UnifiedLead) => l.source === "opensea");
    expect(openseaLead).toBeDefined();
    expect(openseaLead?.name).toBe("test.eth");
    expect(openseaLead?.price).toBe("0.5 ETH");
    expect(openseaLead?.category).toBe("Technology");

    // Verify GoDaddy lead
    const godaddyLead = leads.find((l: UnifiedLead) => l.source === "godaddy");
    expect(godaddyLead).toBeDefined();
    expect(godaddyLead?.name).toBe("business.com");
    expect(godaddyLead?.price).toBe("$750");
    expect(godaddyLead?.category).toBe("Business");
  });
}); 