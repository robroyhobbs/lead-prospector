import { createLeadGenerationWorkflow } from "../lead-generation";
import { LeadGenerationConfig } from "../lead-generation";

describe("LeadGenerationWorkflow", () => {
  it("should create a workflow with all required agents", () => {
    const config: LeadGenerationConfig = {
      sedo: {
        maxPages: 1,
        categories: ["Technology"],
        minPrice: 100,
        maxPrice: 1000,
      },
      opensea: {
        maxPages: 1,
        chains: ["ethereum"],
        minPrice: 0.1,
        maxPrice: 10,
        traits: [
          { name: "Type", value: "Domain" }
        ],
      },
      godaddy: {
        maxPages: 1,
        categories: ["Business"],
        minPrice: 100,
        maxPrice: 1000,
        auctionOnly: true,
        endingSoon: false,
      },
      processor: {
        minPortfolioSize: 10,
        minPrice: 100,
        maxPrice: 1000,
        categories: ["Technology", "Business"],
        excludeCategories: ["Adult"],
      },
      manager: {
        defaultStatus: "new",
        autoQualify: {
          minPortfolioSize: 10,
          minPrice: 100,
          maxPrice: 1000,
          categories: ["Technology", "Business"],
        },
        notificationSettings: {
          email: true,
          slack: true,
        },
      },
    };

    const workflow = createLeadGenerationWorkflow(config);

    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("LeadGeneration");
    expect(workflow.description).toBe("Generates leads from multiple domain marketplaces");
    expect(workflow.agents).toHaveLength(5); // 3 scrapers + 1 processor + 1 manager
    expect(workflow.type).toBe("sequential");
  });
}); 